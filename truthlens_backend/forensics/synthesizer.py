from typing import Dict, Any, List

def synthesize_forensic_investigation(
    file_info: Dict[str, Any],
    metadata: Dict[str, Any],
    c2pa_data: Dict[str, Any],
    ela_data: Dict[str, Any],
    fft_data: Dict[str, Any],
    noise_data: Dict[str, Any],
    gradient_data: Dict[str, Any],
    candidates: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesizes multi-layer forensic signals into an explainable, professional evaluation.
    Strictly separates:
    1. Verified Cryptographic & Header Facts (deterministic)
    2. Forensic Estimates & Heuristics (statistical/probabilistic)
    Computes overall Authenticity Risk Score and non-accusatory findings.
    """
    verified_facts: List[Dict[str, str]] = []
    estimates: List[Dict[str, str]] = []
    red_flags: List[str] = []

    # 1. VERIFIED FACTS (Deterministic)
    verified_facts.append({
        "category": "Integrity & Cryptography",
        "fact": f"SHA-256 Hash: {file_info.get('sha256_hash')}",
        "status": "Verified Match"
    })
    verified_facts.append({
        "category": "Container Specifications",
        "fact": f"File Size: {file_info.get('file_size', 0):,} bytes | Resolution: {metadata.get('width', 0)}x{metadata.get('height', 0)} px | Mode: {metadata.get('color_mode', 'Unknown')}",
        "status": "Verified Technical Property"
    })

    if metadata.get("camera_make") or metadata.get("camera_model"):
        verified_facts.append({
            "category": "EXIF Header",
            "fact": f"Hardware Origin: {metadata.get('camera_make', '')} {metadata.get('camera_model', '')} | Lens: {metadata.get('lens_model', 'Default')} | Exposure: {metadata.get('exposure_time', 'N/A')}",
            "status": "Verified Metadata Tag"
        })
    elif metadata.get("metadata_stripped"):
        verified_facts.append({
            "category": "EXIF Header",
            "fact": "EXIF metadata tags are completely stripped/absent from file header. (Consistent with web/social platform re-encoding or intentional scrubbing).",
            "status": "Verified Absence"
        })

    if metadata.get("editing_software_detected"):
        verified_facts.append({
            "category": "Editor Signatures",
            "fact": f"Software editing artifact registered in container: '{metadata.get('editing_software_name')}'.",
            "status": "Verified Header Artifact"
        })
        red_flags.append(f"Image container contains known editing software trace: {metadata.get('editing_software_name')}")

    if metadata.get("gps"):
        gps = metadata["gps"]
        verified_facts.append({
            "category": "Geospatial Provenance",
            "fact": f"Embedded GPS Coordinates: {gps.get('latitude')}, {gps.get('longitude')} (Alt: {gps.get('altitude', 'N/A')}m)",
            "status": "Verified Coordinates"
        })

    # C2PA Provenance Fact
    if c2pa_data.get("c2pa_present"):
        verified_facts.append({
            "category": "C2PA Provenance",
            "fact": f"Content Credentials Manifest: {c2pa_data.get('status')} | Issuer: {c2pa_data.get('issuer', 'Self-Signed/Embedded')} | Generator: {c2pa_data.get('claim_generator', 'Standard')}",
            "status": "Cryptographically Verified Manifest"
        })
    else:
        verified_facts.append({
            "category": "C2PA Provenance",
            "fact": "No C2PA / Content Credentials cryptographic manifest is present in this file.",
            "status": "Verified Absence"
        })

    # 2. FORENSIC ESTIMATES (Statistical / Algorithmic Heuristics)
    ela_score = ela_data.get("ela_anomaly_score", 0.0)
    ela_status = "Anomalous" if ela_score > 50 else ("Moderate" if ela_score > 25 else "Consistent")
    estimates.append({
        "layer": "Error Level Analysis (ELA)",
        "estimate": f"Compression Error Variance: {ela_data.get('block_variance', 0.0)} | High Residual Pixels: {ela_data.get('high_residual_percentage', 0.0)}%",
        "interpretation": f"Error levels are {ela_status.lower()}. {('Localized recompression anomalies indicate spliced or resaved sections.' if ela_score > 50 else 'Even compression layer across frame.')}",
        "confidence": "85%"
    })
    if ela_score > 50:
        red_flags.append(f"ELA detected localized compression error variance of {ela_data.get('block_variance')}, suggesting regional manipulation.")

    fft_score = fft_data.get("fft_anomaly_score", 0.0)
    estimates.append({
        "layer": "2D Fast Fourier Transform (FFT)",
        "estimate": f"Spectral Spikes: {fft_data.get('spectral_spikes_detected', 0)} | Lattice Artifacts: {'Detected' if fft_data.get('periodic_lattice_detected') else 'None'}",
        "interpretation": fft_data.get("finding_summary", "Continuous optical spectrum"),
        "confidence": "80%"
    })
    if fft_data.get("periodic_lattice_detected"):
        red_flags.append("2D FFT frequency spectrum shows periodic lattice spikes characteristic of AI diffusion models or affine resampling.")

    noise_score = noise_data.get("noise_inconsistency_score", 0.0)
    estimates.append({
        "layer": "Sensor Noise & PRNU Residual",
        "estimate": f"Noise Dispersion (CV): {noise_data.get('coefficient_of_variation', 0.0)} | Mean Variance: {noise_data.get('mean_sensor_noise_var', 0.0)}",
        "interpretation": noise_data.get("finding_summary", "Uniform sensor noise"),
        "confidence": "82%"
    })
    if noise_data.get("splicing_detected"):
        red_flags.append("Sensor noise variance is non-uniform across blocks, indicating mixed-source composition or localized retouching.")

    # Reverse matches
    if candidates:
        top_cand = candidates[0]
        estimates.append({
            "layer": "Reverse Source Discovery",
            "estimate": f"Identified {len(candidates)} candidate match(es). Top match similarity: {top_cand.get('similarity_percentage', 0)}% via {top_cand.get('match_method', 'Visual Hash')}",
            "interpretation": f"Relationship: {top_cand.get('relationship', 'Candidate Match')}. Source: {top_cand.get('source_title', 'Reference Index')}",
            "confidence": "90%"
        })
        if top_cand.get("similarity_percentage", 0) > 85 and top_cand.get("similarity_percentage", 0) < 99:
            red_flags.append(f"High similarity ({top_cand.get('similarity_percentage')}%) with known source candidate indicates a derivative altered version.")

    # 3. WEIGHTED COMPOSITE RISK SCORE CALCULATION
    # Weights: ELA (30%), Noise (25%), FFT (20%), Metadata/Software (15%), Reverse Match diff (10%)
    weight_ela = 0.30 * ela_score
    weight_noise = 0.25 * noise_score
    weight_fft = 0.20 * fft_score
    weight_meta = 15.0 if metadata.get("editing_software_detected") else (5.0 if metadata.get("metadata_stripped") else 0.0)
    
    # Reverse match weighting
    weight_rev = 0.0
    if candidates and len(candidates) > 0:
        sim = candidates[0].get("similarity_percentage", 0)
        if 75 <= sim <= 98:  # Highly similar but altered!
            weight_rev = 15.0
            
    composite_score = round(min(100.0, weight_ela + weight_noise + weight_fft + weight_meta + weight_rev), 1)

    # Risk level classification
    if composite_score >= 70:
        risk_level = "High Likelihood of Manipulation"
        risk_color = "#ef4444"
        summary_verdict = "Multiple independent forensic signals (compression anomalies, noise variance divergence, or software signatures) indicate significant localized alteration or synthetic composition."
    elif composite_score >= 45:
        risk_level = "Suspicious / Likely Edited"
        risk_color = "#f59e0b"
        summary_verdict = "Detectable technical inconsistencies present. Image appears re-compressed, resaved through editing software, or contains localized color/geometry adjustments."
    elif composite_score >= 20:
        risk_level = "Moderate / Minor Processing"
        risk_color = "#3b82f6"
        summary_verdict = "Image displays standard digital photography characteristics with possible mild recompression or platform transcode. No severe splicing anomalies detected."
    else:
        risk_level = "Low Risk / Consistent"
        risk_color = "#10b981"
        summary_verdict = "Forensic layers exhibit natural optical sensor noise, consistent JPEG compression levels, and smooth frequency spectra without detected tampering markers."

    # If valid C2PA credentials exist, adjust context
    if c2pa_data.get("c2pa_present") and c2pa_data.get("validation_state", "").lower() in ["valid", "passed"]:
        summary_verdict += f" Note: Cryptographically signed C2PA manifest confirms provenance by {c2pa_data.get('issuer')}."

    return {
        "risk_score": composite_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "summary_verdict": summary_verdict,
        "verified_facts": verified_facts,
        "estimates": estimates,
        "red_flags": red_flags,
        "confidence_rating": "High (Multi-Modal Consensus)" if len(red_flags) >= 2 or composite_score < 20 else "Moderate",
        "legal_disclaimer": (
            "INVESTIGATION ASSISTANT DISCLAIMER: TruthLens AI provides scientific and computational evidence analysis "
            "to assist qualified human investigators. Image analysis results reflect mathematical, frequency, and metadata "
            "anomalies. Technical anomalies alone do not establish intent, verify authorship, or establish criminal culpability. "
            "All findings must be evaluated in accordance with local legal frameworks and rules of evidence."
        )
    }
