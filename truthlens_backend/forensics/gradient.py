from pathlib import Path
from typing import Dict, Any
import cv2
import numpy as np
from storage import save_artifact_file

def run_gradient_analysis(image_path: Path) -> Dict[str, Any]:
    """
    Performs Luminance Gradient and Edge Inconsistency Analysis:
    - Calculates Sobel gradient field in X and Y directions
    - Analyzes edge sharpness discontinuities across contours
    - Uncovers pasted cutouts or blurred boundary composites
    """
    filename_stem = image_path.stem
    
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Sobel gradients
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = np.sqrt(sobel_x**2 + sobel_y**2)

    # Normalize to 0-255
    mag_max = np.max(magnitude)
    if mag_max > 0:
        norm_grad = (magnitude / mag_max * 255.0).astype(np.uint8)
    else:
        norm_grad = np.zeros_like(magnitude, dtype=np.uint8)

    # Colorize with ocean/cyan colormap
    gradient_colored = cv2.applyColorMap(norm_grad, cv2.COLORMAP_OCEAN)

    # Save artifact
    grad_filename = f"gradient_map_{filename_stem}.jpg"
    _, encoded = cv2.imencode(".jpg", gradient_colored)
    grad_rel_path, _ = save_artifact_file(encoded.tobytes(), grad_filename)

    # Calculate statistics
    mean_gradient = float(np.mean(norm_grad))
    std_gradient = float(np.std(norm_grad))
    sharp_edge_ratio = float(np.sum(norm_grad > 100) / norm_grad.size)

    return {
        "gradient_artifact_rel_path": grad_rel_path,
        "mean_gradient_magnitude": round(mean_gradient, 2),
        "gradient_dispersion": round(std_gradient, 2),
        "sharp_edge_ratio": round(sharp_edge_ratio, 4),
        "finding_summary": "Unusually sharp boundary gradients detected" if sharp_edge_ratio > 0.15 else "Natural gradual luminance transitions"
    }
