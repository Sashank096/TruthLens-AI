import hashlib
import os
import shutil
from pathlib import Path
from typing import Tuple, Optional
from config import ORIGINALS_DIR, ARTIFACTS_DIR, REPORTS_DIR, VAULT_DIR

def calculate_sha256(data: bytes) -> str:
    """Calculates cryptographic SHA-256 hash of raw byte data."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()

def preserve_evidence_file(file_bytes: bytes, original_filename: str) -> Tuple[str, str, str, Path]:
    """
    Preserves original uploaded evidence file:
    - Calculates SHA-256
    - Determines safe extension
    - Writes immutable original to ORIGINALS_DIR
    Returns: (sha256_hash, safe_filename, relative_storage_path, absolute_path)
    """
    sha256_hash = calculate_sha256(file_bytes)
    ext = Path(original_filename).suffix.lower()
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"]:
        ext = ".jpg"
    
    safe_filename = f"{sha256_hash}{ext}"
    dest_path = ORIGINALS_DIR / safe_filename
    
    # Save original without any modification
    if not dest_path.exists():
        with open(dest_path, "wb") as f:
            f.write(file_bytes)
            
    rel_path = f"originals/{safe_filename}"
    return sha256_hash, safe_filename, rel_path, dest_path

def verify_file_integrity(file_path: Path, expected_hash: str) -> bool:
    """Verifies that the stored evidence matches its cryptographic hash."""
    if not file_path.exists():
        return False
    with open(file_path, "rb") as f:
        actual_hash = calculate_sha256(f.read())
    return actual_hash.lower() == expected_hash.lower()

def save_artifact_file(data: bytes, filename: str) -> Tuple[str, Path]:
    """Saves a forensic artifact (e.g. ELA heatmap, FFT spectrum) to ARTIFACTS_DIR."""
    dest_path = ARTIFACTS_DIR / filename
    with open(dest_path, "wb") as f:
        f.write(data)
    rel_path = f"artifacts/{filename}"
    return rel_path, dest_path

def get_vault_file_path(relative_path: str) -> Optional[Path]:
    """Resolves relative vault path safely preventing directory traversal."""
    target = (VAULT_DIR / relative_path).resolve()
    if VAULT_DIR.resolve() in target.parents or target == VAULT_DIR.resolve():
        if target.exists():
            return target
    return None
