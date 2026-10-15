import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from config import VAULT_DIR, SUPABASE_URL, SUPABASE_ANON_KEY

# Initialize Supabase client if available
supabase_client = None
try:
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    print(f"[Supabase Init Notice] Using local forensic datastore fallback: {e}")

# Local SQLite Forensic Database (always provides instant, resilient persistence)
DB_PATH = VAULT_DIR / "truthlens_evidence.db"

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        case_number TEXT UNIQUE,
        title TEXT NOT NULL,
        examiner TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Under Investigation',
        tags TEXT DEFAULT '[]',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_items (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        sha256_hash TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        storage_rel_path TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forensic_results (
        id TEXT PRIMARY KEY,
        evidence_id TEXT NOT NULL,
        case_id TEXT NOT NULL,
        risk_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        verified_facts TEXT NOT NULL,
        estimates TEXT NOT NULL,
        ela_summary TEXT NOT NULL,
        fft_summary TEXT NOT NULL,
        noise_summary TEXT NOT NULL,
        metadata_summary TEXT NOT NULL,
        c2pa_summary TEXT NOT NULL,
        candidate_matches TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (evidence_id) REFERENCES evidence_items (id),
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS custody_logs (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        evidence_id TEXT,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        hash_verified INTEGER DEFAULT 1,
        details TEXT DEFAULT '',
        FOREIGN KEY (case_id) REFERENCES cases (id)
    )
    """)
    conn.commit()
    conn.close()

# Auto-initialize database on load
init_db()

def create_case(title: str, examiner: str, priority: str = "Medium", tags: Optional[List[str]] = None, notes: str = "", case_number: Optional[str] = None) -> Dict[str, Any]:
    case_id = str(uuid.uuid4())
    if not case_number:
        case_number = f"TL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{case_id[:6].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    tags_json = json.dumps(tags or ["digital-evidence"])

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cases (id, case_number, title, examiner, priority, status, tags, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (case_id, case_number, title, examiner, priority, "Under Investigation", tags_json, notes, now_iso, now_iso))
    conn.commit()
    conn.close()

    # Log initial custody event
    add_custody_log(case_id, None, "CASE_CREATED", examiner, f"Case {case_number} initiated by {examiner}")

    return {
        "id": case_id,
        "case_number": case_number,
        "title": title,
        "examiner": examiner,
        "priority": priority,
        "status": "Under Investigation",
        "tags": tags or ["digital-evidence"],
        "notes": notes,
        "created_at": now_iso,
        "updated_at": now_iso
    }

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ? OR case_number = ?", (case_id, case_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    case_dict = dict(row)
    case_dict["tags"] = json.loads(case_dict.get("tags") or "[]")

    # Fetch evidence items
    cursor.execute("SELECT * FROM evidence_items WHERE case_id = ?", (case_dict["id"],))
    evidence_rows = cursor.fetchall()
    case_dict["evidence"] = [dict(r) for r in evidence_rows]

    # Fetch latest forensic results
    cursor.execute("SELECT * FROM forensic_results WHERE case_id = ? ORDER BY created_at DESC", (case_dict["id"],))
    results = cursor.fetchall()
    case_dict["forensic_results"] = []
    for r in results:
        res = dict(r)
        for k in ["verified_facts", "estimates", "ela_summary", "fft_summary", "noise_summary", "metadata_summary", "c2pa_summary", "candidate_matches"]:
            try:
                res[k] = json.loads(res.get(k) or "{}")
            except Exception:
                pass
        case_dict["forensic_results"].append(res)

    # Fetch custody logs
    cursor.execute("SELECT * FROM custody_logs WHERE case_id = ? ORDER BY timestamp ASC", (case_dict["id"],))
    logs = cursor.fetchall()
    case_dict["custody_logs"] = [dict(l) for l in logs]

    conn.close()
    return case_dict

def list_cases() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, 
               (SELECT COUNT(*) FROM evidence_items e WHERE e.case_id = c.id) as evidence_count,
               (SELECT risk_score FROM forensic_results r WHERE r.case_id = c.id ORDER BY r.created_at DESC LIMIT 1) as latest_risk_score,
               (SELECT risk_level FROM forensic_results r WHERE r.case_id = c.id ORDER BY r.created_at DESC LIMIT 1) as latest_risk_level
        FROM cases c 
        ORDER BY c.created_at DESC
    """)
    rows = cursor.fetchall()
    cases = []
    for row in rows:
        c = dict(row)
        c["tags"] = json.loads(c.get("tags") or "[]")
        cases.append(c)
    conn.close()
    return cases

def update_case_notes(case_id: str, notes: str, status: Optional[str] = None) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    if status:
        cursor.execute("UPDATE cases SET notes = ?, status = ?, updated_at = ? WHERE id = ?", (notes, status, now_iso, case_id))
    else:
        cursor.execute("UPDATE cases SET notes = ?, updated_at = ? WHERE id = ?", (notes, now_iso, case_id))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def add_evidence_item(case_id: str, file_name: str, file_size: int, sha256_hash: str, mime_type: str, storage_rel_path: str) -> Dict[str, Any]:
    evidence_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO evidence_items (id, case_id, file_name, file_size, sha256_hash, mime_type, storage_rel_path, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (evidence_id, case_id, file_name, file_size, sha256_hash, mime_type, storage_rel_path, now_iso))
    conn.commit()
    conn.close()
    return {
        "id": evidence_id,
        "case_id": case_id,
        "file_name": file_name,
        "file_size": file_size,
        "sha256_hash": sha256_hash,
        "mime_type": mime_type,
        "storage_rel_path": storage_rel_path,
        "uploaded_at": now_iso
    }

def save_forensic_result(evidence_id: str, case_id: str, analysis_data: Dict[str, Any]) -> str:
    result_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO forensic_results (
            id, evidence_id, case_id, risk_score, risk_level,
            verified_facts, estimates, ela_summary, fft_summary, noise_summary,
            metadata_summary, c2pa_summary, candidate_matches, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result_id,
        evidence_id,
        case_id,
        analysis_data.get("risk_score", 0.0),
        analysis_data.get("risk_level", "Undetermined"),
        json.dumps(analysis_data.get("verified_facts", [])),
        json.dumps(analysis_data.get("estimates", [])),
        json.dumps(analysis_data.get("ela_summary", {})),
        json.dumps(analysis_data.get("fft_summary", {})),
        json.dumps(analysis_data.get("noise_summary", {})),
        json.dumps(analysis_data.get("metadata_summary", {})),
        json.dumps(analysis_data.get("c2pa_summary", {})),
        json.dumps(analysis_data.get("candidate_matches", [])),
        now_iso
    ))
    conn.commit()
    conn.close()
    return result_id

def add_custody_log(case_id: str, evidence_id: Optional[str], action: str, actor: str, details: str, hash_verified: bool = True):
    log_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO custody_logs (id, case_id, evidence_id, action, actor, timestamp, hash_verified, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, case_id, evidence_id, action, actor, now_iso, 1 if hash_verified else 0, details))
    conn.commit()
    conn.close()
