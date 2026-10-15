from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from pathlib import Path
import json

from database import (
    create_case, get_case, list_cases, update_case_notes, 
    add_evidence_item, save_forensic_result, add_custody_log
)
from storage import preserve_evidence_file, verify_file_integrity
from forensics.metadata_extractor import extract_metadata
from forensics.provenance import inspect_c2pa_manifest
from forensics.ela import run_ela
from forensics.frequency import run_frequency_analysis
from forensics.noise import run_noise_analysis
from forensics.gradient import run_gradient_analysis
from forensics.synthesizer import synthesize_forensic_investigation
from reverse_search.engine import search_candidate_sources
from reporting.pdf_generator import generate_forensic_pdf_report

router = APIRouter(prefix="/api/cases", tags=["Investigations"])

@router.get("")
def get_all_cases():
    """Lists all forensic investigation cases."""
    return {"cases": list_cases()}

@router.post("")
def create_new_case(
    title: str = Form(...),
    examiner: str = Form(...),
    priority: str = Form("Medium"),
    tags: Optional[str] = Form(None),
    notes: Optional[str] = Form("")
):
    """Creates a new digital forensics investigation case container."""
    parsed_tags = []
    if tags:
        try:
            parsed_tags = json.loads(tags) if tags.startswith("[") else [t.strip() for t in tags.split(",") if t.strip()]
        except Exception:
            parsed_tags = [tags]

    case = create_case(title, examiner, priority, parsed_tags, notes or "")
    return {"case": case}

@router.get("/{case_id}")
def get_case_details(case_id: str):
    """Retrieves full case details including evidence items, forensic results, and custody log."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"case": case}

@router.patch("/{case_id}")
def update_case(
    case_id: str,
    notes: Optional[str] = Form(None),
    status: Optional[str] = Form(None)
):
    """Updates investigator notes or case status."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    current_notes = notes if notes is not None else case.get("notes", "")
    update_case_notes(case_id, current_notes, status)
    add_custody_log(case_id, None, "CASE_UPDATED", case.get("examiner", "Investigator"), f"Case notes/status updated to: {status or case.get('status')}")
    return {"status": "success", "message": "Case updated successfully"}

@router.post("/{case_id}/evidence")
async def ingest_case_evidence(
    case_id: str,
    file: UploadFile = File(...),
    ela_quality: int = Form(95),
    ela_scale: int = Form(18)
):
    """
    Ingests suspicious digital image evidence into a case:
    1. Preserves original bytes & calculates cryptographic SHA-256
    2. Extracts deep EXIF/GPS/Software metadata
    3. Inspects C2PA Content Credentials provenance
    4. Executes ELA with false-color heatmap
    5. Performs 2D FFT spectral frequency analysis
    6. Measures sensor noise & PRNU residual inconsistency
    7. Evaluates luminance edge gradients
    8. Discovers matching candidate sources (up to 3 matches)
    9. Synthesizes explainable findings (Verified Facts vs Estimates)
    10. Logs custody event, saves results, and generates downloadable PDF report
    """
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # 1. Cryptographic Preservation
    sha256_hash, safe_filename, rel_storage_path, abs_path = preserve_evidence_file(file_bytes, file.filename)
    
    # Verify hash integrity
    integrity_ok = verify_file_integrity(abs_path, sha256_hash)

    # Add evidence record
    evidence = add_evidence_item(
        case_id=case["id"],
        file_name=file.filename,
        file_size=len(file_bytes),
        sha256_hash=sha256_hash,
        mime_type=file.content_type or "image/jpeg",
        storage_rel_path=rel_storage_path
    )

    add_custody_log(
        case_id=case["id"],
        evidence_id=evidence["id"],
        action="EVIDENCE_PRESERVED",
        actor=case.get("examiner", "Investigator"),
        details=f"Preserved original file '{file.filename}' with SHA-256 {sha256_hash}",
        hash_verified=integrity_ok
    )

    # 2. Extract Metadata
    metadata = extract_metadata(abs_path)

    # 3. Provenance / C2PA Verification
    c2pa_data = inspect_c2pa_manifest(abs_path)

    # 4. Error Level Analysis (ELA)
    ela_data = run_ela(abs_path, quality=ela_quality, scale_factor=ela_scale)

    # 5. 2D FFT Frequency Analysis
    fft_data = run_frequency_analysis(abs_path)

    # 6. Sensor Noise Analysis
    noise_data = run_noise_analysis(abs_path)

    # 7. Edge & Gradient Analysis
    gradient_data = run_gradient_analysis(abs_path)

    # 8. Source Discovery (Reverse search against reference index)
    candidate_matches = search_candidate_sources(abs_path, max_results=3)

    # 9. Explainable Synthesis
    file_info = {
        "file_name": file.filename,
        "file_size": len(file_bytes),
        "sha256_hash": sha256_hash,
        "mime_type": file.content_type
    }
    synthesis = synthesize_forensic_investigation(
        file_info=file_info,
        metadata=metadata,
        c2pa_data=c2pa_data,
        ela_data=ela_data,
        fft_data=fft_data,
        noise_data=noise_data,
        gradient_data=gradient_data,
        candidates=candidate_matches
    )

    # Aggregate full result payload
    full_analysis = {
        "evidence_id": evidence["id"],
        "case_id": case["id"],
        "sha256_hash": sha256_hash,
        "file_name": file.filename,
        "file_size": len(file_bytes),
        "storage_rel_path": rel_storage_path,
        "risk_score": synthesis["risk_score"],
        "risk_level": synthesis["risk_level"],
        "risk_color": synthesis["risk_color"],
        "summary_verdict": synthesis["summary_verdict"],
        "verified_facts": synthesis["verified_facts"],
        "estimates": synthesis["estimates"],
        "red_flags": synthesis["red_flags"],
        "confidence_rating": synthesis["confidence_rating"],
        "legal_disclaimer": synthesis["legal_disclaimer"],
        "metadata_summary": metadata,
        "c2pa_summary": c2pa_data,
        "ela_summary": ela_data,
        "fft_summary": fft_data,
        "noise_summary": noise_data,
        "gradient_summary": gradient_data,
        "candidate_matches": candidate_matches
    }

    # Save to persistent database
    result_id = save_forensic_result(evidence["id"], case["id"], full_analysis)

    # 10. Generate PDF report
    updated_case = get_case(case_id)
    pdf_path = generate_forensic_pdf_report(updated_case or case, full_analysis)

    add_custody_log(
        case_id=case["id"],
        evidence_id=evidence["id"],
        action="REPORT_GENERATED",
        actor="TruthLens AI Engine",
        details=f"Courtroom-ready PDF report generated: {pdf_path.name}"
    )

    return {
        "status": "success",
        "evidence": evidence,
        "analysis": full_analysis,
        "report_file": pdf_path.name
    }
