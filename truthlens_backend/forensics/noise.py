from pathlib import Path
from typing import Dict, Any
import cv2
import numpy as np
from storage import save_artifact_file

def run_noise_analysis(image_path: Path) -> Dict[str, Any]:
    """
    Performs High-Frequency Residual & Noise Variance Inconsistency Analysis:
    - Extracts high-pass sensor noise residual via Laplacian operator
    - Computes local block-wise variance across the frame
    - Detects noise discontinuities indicative of spliced compositing or AI inpainting
    - Produces a color-coded noise variance map artifact
    """
    filename_stem = image_path.stem
    
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # Resize if excessive for performance
    max_dim = 1024
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = gray.shape

    # Extract high-frequency noise residual using Laplacian
    laplacian = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
    abs_lap = np.abs(laplacian)

    # Compute block-wise variance map (32x32 blocks)
    block_size = 32
    var_map = np.zeros((h // block_size, w // block_size), dtype=np.float32)

    for i in range(var_map.shape[0]):
        for j in range(var_map.shape[1]):
            block = abs_lap[i*block_size:(i+1)*block_size, j*block_size:(j+1)*block_size]
            var_map[i, j] = np.var(block)

    # Normalize variance map to 0-255 for visualization
    min_v, max_v = np.min(var_map), np.max(var_map)
    if max_v > min_v:
        norm_var = ((var_map - min_v) / (max_v - min_v) * 255.0).astype(np.uint8)
    else:
        norm_var = np.zeros_like(var_map, dtype=np.uint8)

    # Upscale variance map smoothly back to image dimensions
    smooth_var_map = cv2.resize(norm_var, (w, h), interpolation=cv2.INTER_CUBIC)
    noise_colored = cv2.applyColorMap(smooth_var_map, cv2.COLORMAP_VIRIDIS)

    # Save artifact
    noise_filename = f"noise_map_{filename_stem}.jpg"
    _, encoded = cv2.imencode(".jpg", noise_colored)
    noise_rel_path, _ = save_artifact_file(encoded.tobytes(), noise_filename)

    # Statistical evaluation of noise uniformity
    mean_var = float(np.mean(var_map))
    std_var = float(np.std(var_map))
    # Coefficient of variation (dispersion)
    cv = (std_var / (mean_var + 1e-6)) if mean_var > 0 else 0.0

    # Inconsistency score
    noise_inconsistency_score = 0.0
    splicing_detected = False
    if cv > 1.4:
        noise_inconsistency_score = min(85.0, cv * 45.0)
        splicing_detected = True
    elif cv > 0.9:
        noise_inconsistency_score = min(50.0, cv * 35.0)
    else:
        noise_inconsistency_score = min(25.0, cv * 20.0)

    return {
        "noise_artifact_rel_path": noise_rel_path,
        "mean_sensor_noise_var": round(mean_var, 2),
        "noise_variance_std": round(std_var, 2),
        "coefficient_of_variation": round(cv, 2),
        "noise_inconsistency_score": round(noise_inconsistency_score, 1),
        "splicing_detected": splicing_detected,
        "finding_summary": "High noise variance discontinuity detected across image blocks (potential splicing or local AI infill)" if splicing_detected else "Uniform sensor noise distribution consistent with single-source capture"
    }
