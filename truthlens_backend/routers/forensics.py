from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
from storage import preserve_evidence_file
from forensics.metadata_extractor import extract_metadata
from forensics.provenance import inspect_c2pa_manifest
from forensics.ela import run_ela
from forensics.frequency import run_frequency_analysis
from forensics.noise import run_noise_analysis
from forensics.gradient import run_gradient_analysis
from forensics.synthesizer import synthesize_forensic_investigation
from reverse_search.engine import search_candidate_sources
from config import VAULT_DIR

router = APIRouter(prefix="/api/forensics", tags=["Forensic Tools"])

@router.post("/quick-scan")
async def quick_forensic_scan(
    file: UploadFile = File(...),
    ela_quality: int = Form(95),
    ela_scale: int = Form(18)
):
    """
    Rapid forensic triage without binding to a permanent case record.
    Returns complete multi-layer anomaly heatmaps, metadata, C2PA, and risk evaluation.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty image uploaded")

    sha256_hash, safe_filename, rel_path, abs_path = preserve_evidence_file(file_bytes, file.filename)

    metadata = extract_metadata(abs_path)
    c2pa_data = inspect_c2pa_manifest(abs_path)
    ela_data = run_ela(abs_path, quality=ela_quality, scale_factor=ela_scale)
    fft_data = run_frequency_analysis(abs_path)
    noise_data = run_noise_analysis(abs_path)
    gradient_data = run_gradient_analysis(abs_path)
    candidates = search_candidate_sources(abs_path, max_results=3)

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
        candidates=candidates
    )

    return {
        "sha256_hash": sha256_hash,
        "file_name": file.filename,
        "file_size": len(file_bytes),
        "storage_rel_path": rel_path,
        "risk_score": synthesis["risk_score"],
        "risk_level": synthesis["risk_level"],
        "risk_color": synthesis["risk_color"],
        "summary_verdict": synthesis["summary_verdict"],
        "verified_facts": synthesis["verified_facts"],
        "estimates": synthesis["estimates"],
        "red_flags": synthesis["red_flags"],
        "confidence_rating": synthesis["confidence_rating"],
        "legal_disclaimer": synthesis["legal_disclaimer"],
        "metadata": metadata,
        "c2pa": c2pa_data,
        "ela": ela_data,
        "fft": fft_data,
        "noise": noise_data,
        "gradient": gradient_data,
        "candidates": candidates
    }

@router.post("/recompute-ela")
def recompute_ela_params(
    storage_rel_path: str = Form(...),
    quality: int = Form(95),
    scale_factor: int = Form(18)
):
    """Dynamically recomputes ELA at custom recompression quality and scale factor."""
    target_path = (VAULT_DIR / storage_rel_path).resolve()
    if not target_path.exists():
        raise HTTPException(status_code=404, detail="Original image not found")

    result = run_ela(target_path, quality=quality, scale_factor=scale_factor)
    return {"status": "success", "ela": result}
