from pathlib import Path
from typing import Dict, Any
import cv2
import numpy as np
from storage import save_artifact_file

def run_frequency_analysis(image_path: Path) -> Dict[str, Any]:
    """
    Performs 2D Fast Fourier Transform (FFT) Power Spectrum Analysis:
    - Uncovers periodic resampling artifacts (scaling, rotation, affine transforms)
    - Detects unnatural spectral peaks common in diffusion/GAN generation and compositing
    - Generates log-magnitude spectrogram visualization
    """
    filename_stem = image_path.stem
    
    # Read as grayscale
    img_gray = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    if img_gray is None:
        raise ValueError(f"Could not load image at {image_path}")

    # Resize if very large for fast, stable FFT
    h, w = img_gray.shape
    max_dim = 1024
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img_gray = cv2.resize(img_gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = img_gray.shape

    # Apply 2D FFT
    dft = np.fft.fft2(img_gray.astype(np.float32))
    dft_shift = np.fft.fftshift(dft)
    
    # Calculate magnitude spectrum (log scaled for dynamic range visibility)
    magnitude = 20.0 * np.log(np.abs(dft_shift) + 1.0)
    
    # Normalize to 0-255
    mag_min = np.min(magnitude)
    mag_max = np.max(magnitude)
    if mag_max > mag_min:
        norm_mag = ((magnitude - mag_min) / (mag_max - mag_min) * 255.0).astype(np.uint8)
    else:
        norm_mag = np.zeros_like(magnitude, dtype=np.uint8)

    # Colorize with magma/inferno colormap
    spectrogram_colored = cv2.applyColorMap(norm_mag, cv2.COLORMAP_MAGMA)

    # Save artifact
    fft_filename = f"fft_spectrum_{filename_stem}.jpg"
    _, encoded = cv2.imencode(".jpg", spectrogram_colored)
    fft_rel_path, _ = save_artifact_file(encoded.tobytes(), fft_filename)

    # Spectral peak anomaly detection
    # Mask out central DC component (low frequencies)
    cy, cx = h // 2, w // 2
    r = min(h, w) // 16
    y, x = np.ogrid[:h, :w]
    dc_mask = (x - cx)**2 + (y - cy)**2 <= r**2
    
    ac_magnitude = norm_mag.copy()
    ac_magnitude[dc_mask] = 0

    # Calculate statistics on high/mid frequency components
    ac_mean = float(np.mean(ac_magnitude))
    ac_std = float(np.std(ac_magnitude))
    ac_max = float(np.max(ac_magnitude))

    # Identify unnatural periodic spikes (pixels exceeding mean + 4*std)
    spike_threshold = ac_mean + 4.0 * ac_std
    spikes_count = int(np.sum(ac_magnitude > spike_threshold))
    lattice_detected = spikes_count > 45

    # Frequency anomaly score (0-100)
    fft_anomaly_score = 0.0
    if lattice_detected:
        fft_anomaly_score = min(85.0, 30.0 + (spikes_count / 10.0))
    else:
        fft_anomaly_score = min(35.0, (ac_std / 10.0) * 8.0)

    return {
        "fft_artifact_rel_path": fft_rel_path,
        "ac_mean_energy": round(ac_mean, 2),
        "ac_spectral_variance": round(ac_std, 2),
        "spectral_spikes_detected": spikes_count,
        "periodic_lattice_detected": lattice_detected,
        "fft_anomaly_score": round(fft_anomaly_score, 1),
        "finding_summary": "Unnatural periodic frequency grid detected (indicative of AI diffusion lattice or periodic resampling)" if lattice_detected else "Standard continuous natural optical frequency spectrum"
    }
