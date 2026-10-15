import os
import sys
from pathlib import Path
import numpy as np
import cv2
from PIL import Image

# Ensure backend directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from storage import preserve_evidence_file, calculate_sha256, verify_file_integrity
from forensics.metadata_extractor import extract_metadata
from forensics.provenance import inspect_c2pa_manifest
from forensics.ela import run_ela
from forensics.frequency import run_frequency_analysis
from forensics.noise import run_noise_analysis
from forensics.gradient import run_gradient_analysis
from forensics.similarity import compute_image_fingerprints, compare_images
from forensics.synthesizer import synthesize_forensic_investigation
from reverse_search.engine import search_candidate_sources
from reporting.pdf_generator import generate_forensic_pdf_report
from database import create_case, add_evidence_item, get_case

def test_full_pipeline():
    print("[1/10] Generating test synthetic test image...")
    test_img_path = BASE_DIR / "test_sample.jpg"
    h, w = 400, 500
    img = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(h):
        img[y, :, 0] = int(30 + 70 * (y / h))
        img[y, :, 1] = int(50 + 90 * (y / h))
        img[y, :, 2] = int(80 + 110 * (y / h))
    cv2.circle(img, (250, 200), 80, (220, 210, 190), -1)
    cv2.putText(img, "TruthLens Test", (160, 210), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (20, 20, 20), 2)
    # Add spliced colored patch
    cv2.rectangle(img, (320, 50), (450, 150), (0, 0, 255), -1)
    cv2.imwrite(str(test_img_path), img, [cv2.IMWRITE_JPEG_QUALITY, 90])

    with open(test_img_path, "rb") as f:
        file_bytes = f.read()

    print("[2/10] Testing Cryptographic Preservation & SHA-256...")
    sha256, safe_name, rel_path, abs_path = preserve_evidence_file(file_bytes, "test_sample.jpg")
    assert len(sha256) == 64, f"Invalid SHA-256 length: {len(sha256)}"
    assert verify_file_integrity(abs_path, sha256), "Integrity verification failed"
    print(f"       -> SHA-256: {sha256[:16]}... OK")

    print("[3/10] Testing Metadata Extractor...")
    meta = extract_metadata(abs_path)
    assert meta["width"] == 500 and meta["height"] == 400, "Dimension mismatch"
    print(f"       -> Dimensions: {meta['width']}x{meta['height']}, Format: {meta['format']} OK")

    print("[4/10] Testing C2PA Provenance Inspector...")
    c2pa_res = inspect_c2pa_manifest(abs_path)
    assert "status" in c2pa_res, "C2PA status missing"
    print(f"       -> C2PA status: {c2pa_res['status']} OK")

    print("[5/10] Testing Error Level Analysis (ELA)...")
    ela_res = run_ela(abs_path, quality=95, scale_factor=18)
    assert "ela_artifact_rel_path" in ela_res, "ELA artifact path missing"
    print(f"       -> ELA anomaly score: {ela_res['ela_anomaly_score']} OK")

    print("[6/10] Testing 2D FFT Frequency Analysis...")
    fft_res = run_frequency_analysis(abs_path)
    assert "fft_artifact_rel_path" in fft_res, "FFT artifact path missing"
    print(f"       -> FFT spectral spikes: {fft_res['spectral_spikes_detected']} OK")

    print("[7/10] Testing Sensor Noise Variance Analysis...")
    noise_res = run_noise_analysis(abs_path)
    assert "noise_artifact_rel_path" in noise_res, "Noise artifact path missing"
    print(f"       -> Noise inconsistency: {noise_res['noise_inconsistency_score']} OK")

    print("[8/10] Testing Gradient & Similarity Descriptors...")
    grad_res = run_gradient_analysis(abs_path)
    fprints = compute_image_fingerprints(abs_path)
    candidates = search_candidate_sources(abs_path, max_results=3)
    print(f"       -> pHash: {fprints['phash']}, Candidate matches found: {len(candidates)} OK")

    print("[9/10] Testing Decision Synthesizer...")
    case = create_case("Test Cyber Incident Investigation", "Senior Examiner Jane Doe", "High")
    evidence = add_evidence_item(case["id"], "test_sample.jpg", len(file_bytes), sha256, "image/jpeg", rel_path)
    
    file_info = {"file_name": "test_sample.jpg", "file_size": len(file_bytes), "sha256_hash": sha256}
    synthesis = synthesize_forensic_investigation(
        file_info, meta, c2pa_res, ela_res, fft_res, noise_res, grad_res, candidates
    )
    assert "risk_score" in synthesis, "Risk score missing"
    assert len(synthesis["verified_facts"]) > 0, "Verified facts missing"
    assert len(synthesis["estimates"]) > 0, "Estimates missing"
    print(f"       -> Risk Score: {synthesis['risk_score']} ({synthesis['risk_level']}) OK")

    print("[10/10] Testing PDF Forensic Report Generation...")
    case_full = get_case(case["id"])
    full_analysis = {
        "evidence_id": evidence["id"],
        "case_id": case["id"],
        "sha256_hash": sha256,
        "risk_score": synthesis["risk_score"],
        "risk_level": synthesis["risk_level"],
        "summary_verdict": synthesis["summary_verdict"],
        "verified_facts": synthesis["verified_facts"],
        "estimates": synthesis["estimates"],
        "legal_disclaimer": synthesis["legal_disclaimer"],
        "ela_summary": ela_res,
        "fft_summary": fft_res,
        "noise_summary": noise_res,
        "candidate_matches": candidates
    }
    pdf_path = generate_forensic_pdf_report(case_full, full_analysis)
    assert pdf_path.exists() and pdf_path.stat().st_size > 1000, "PDF generation failed"
    print(f"       -> PDF generated successfully at: {pdf_path.name} ({pdf_path.stat().st_size:,} bytes) OK")

    print("\n>>> ALL 10 BACKEND & FORENSIC PIPELINE TESTS PASSED!")

if __name__ == "__main__":
    test_full_pipeline()
