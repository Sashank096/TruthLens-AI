import io
from pathlib import Path
from typing import Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from storage import save_artifact_file

def run_ela(image_path: Path, quality: int = 95, scale_factor: int = 18) -> Dict[str, Any]:
    """
    Performs Error Level Analysis (ELA) on an image:
    1. Recompresses image at a set JPEG quality level
    2. Measures pixel-wise error difference across RGB channels
    3. Multiplies difference by scale_factor for visual clarity
    4. Computes false-color forensic heatmap (Jet colormap)
    5. Analyzes regional block variance to identify tampered/spliced segments
    """
    filename_stem = image_path.stem
    
    # Open original with PIL
    original = Image.open(image_path).convert("RGB")
    orig_np = np.array(original)

    # Recompress to in-memory JPEG
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer).convert("RGB")
    resaved_np = np.array(resaved)

    # Calculate absolute difference
    diff_np = cv2.absdiff(orig_np, resaved_np)
    
    # Amplified ELA image
    ela_amplified = np.clip(diff_np * scale_factor, 0, 255).astype(np.uint8)
    
    # Create false-color heatmap
    diff_gray = cv2.cvtColor(diff_np, cv2.COLOR_RGB2GRAY)
    diff_gray_scaled = np.clip(diff_gray * (scale_factor * 1.5), 0, 255).astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(diff_gray_scaled, cv2.COLORMAP_JET)

    # Save artifacts
    ela_filename = f"ela_{filename_stem}_q{quality}.jpg"
    heatmap_filename = f"heatmap_{filename_stem}_q{quality}.jpg"

    # Encode ELA amplified image to JPEG
    _, ela_encoded = cv2.imencode(".jpg", cv2.cvtColor(ela_amplified, cv2.COLOR_RGB2BGR))
    ela_rel_path, _ = save_artifact_file(ela_encoded.tobytes(), ela_filename)

    # Encode heatmap
    _, heat_encoded = cv2.imencode(".jpg", heatmap_colored)
    heat_rel_path, _ = save_artifact_file(heat_encoded.tobytes(), heatmap_filename)

    # Statistical forensic analysis
    mean_error = float(np.mean(diff_gray))
    std_error = float(np.std(diff_gray))
    max_error = float(np.max(diff_gray))
    high_residual_ratio = float(np.sum(diff_gray > 15) / diff_gray.size)

    # Regional block variance (8x8 grid)
    h, w = diff_gray.shape
    bh, bw = max(1, h // 8), max(1, w // 8)
    block_means = []
    for y in range(0, h - bh + 1, bh):
        for x in range(0, w - bw + 1, bw):
            block = diff_gray[y:y+bh, x:x+bw]
            block_means.append(np.mean(block))
            
    block_variance = float(np.std(block_means)) if block_means else 0.0

    # Risk assessment heuristic
    # High regional block variance combined with high residual clusters suggests tampering
    ela_risk_score = 0.0
    if block_variance > 3.5:
        ela_risk_score += min(50.0, block_variance * 8.0)
    if high_residual_ratio > 0.05:
        ela_risk_score += min(40.0, high_residual_ratio * 400.0)
    ela_risk_score = min(100.0, round(ela_risk_score, 1))

    return {
        "quality_evaluated": quality,
        "scale_factor": scale_factor,
        "mean_error": round(mean_error, 2),
        "std_error": round(std_error, 2),
        "max_error": round(max_error, 2),
        "block_variance": round(block_variance, 2),
        "high_residual_percentage": round(high_residual_ratio * 100, 2),
        "ela_anomaly_score": ela_risk_score,
        "ela_artifact_rel_path": ela_rel_path,
        "heatmap_artifact_rel_path": heat_rel_path,
        "suspicious_regions_detected": block_variance > 4.0 or high_residual_ratio > 0.08
    }
