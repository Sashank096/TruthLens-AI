from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import cv2
import numpy as np
from PIL import Image
import imagehash
from storage import save_artifact_file

def compute_image_fingerprints(image_path: Path) -> Dict[str, str]:
    """
    Computes multi-algorithm cryptographic and perceptual fingerprints:
    - pHash (perceptual DCT hash)
    - dHash (gradient difference hash)
    - aHash (average intensity hash)
    - wHash (discrete wavelet transform hash)
    """
    with Image.open(image_path) as img:
        phash = str(imagehash.phash(img))
        dhash = str(imagehash.dhash(img))
        ahash = str(imagehash.average_hash(img))
        whash = str(imagehash.whash(img))
    
    return {
        "phash": phash,
        "dhash": dhash,
        "ahash": ahash,
        "whash": whash
    }

def calculate_hash_distance(hash1_str: str, hash2_str: str) -> int:
    """Calculates Hamming distance between two hex hash strings."""
    try:
        h1 = imagehash.hex_to_hash(hash1_str)
        h2 = imagehash.hex_to_hash(hash2_str)
        return int(h1 - h2)
    except Exception:
        return 64

def calculate_ssim(img1_np: np.ndarray, img2_np: np.ndarray) -> float:
    """Computes basic Structural Similarity Index (SSIM) between two grayscale images."""
    try:
        C1 = (0.01 * 255)**2
        C2 = (0.03 * 255)**2
        
        img1 = img1_np.astype(np.float64)
        img2 = img2_np.astype(np.float64)
        
        mu1 = cv2.GaussianBlur(img1, (11, 11), 1.5)
        mu2 = cv2.GaussianBlur(img2, (11, 11), 1.5)
        
        mu1_sq = mu1**2
        mu2_sq = mu2**2
        mu1_mu2 = mu1 * mu2
        
        sigma1_sq = cv2.GaussianBlur(img1**2, (11, 11), 1.5) - mu1_sq
        sigma2_sq = cv2.GaussianBlur(img2**2, (11, 11), 1.5) - mu2_sq
        sigma12 = cv2.GaussianBlur(img1 * img2, (11, 11), 1.5) - mu1_mu2
        
        ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2))
        return float(np.mean(ssim_map))
    except Exception:
        return 0.0

def compare_images(orig_path: Path, candidate_path: Path) -> Dict[str, Any]:
    """
    Detailed forensic comparison between uploaded image and candidate source image:
    1. Multi-hash Hamming distances
    2. Perceptual similarity %
    3. Feature keypoint matching (ORB)
    4. Structural Similarity Index (SSIM)
    5. Visual difference overlay heatmap
    """
    orig_fingerprints = compute_image_fingerprints(orig_path)
    cand_fingerprints = compute_image_fingerprints(candidate_path)

    phash_dist = calculate_hash_distance(orig_fingerprints["phash"], cand_fingerprints["phash"])
    dhash_dist = calculate_hash_distance(orig_fingerprints["dhash"], cand_fingerprints["dhash"])
    whash_dist = calculate_hash_distance(orig_fingerprints["whash"], cand_fingerprints["whash"])

    # Perceptual similarity score (0 - 100%)
    perceptual_similarity = max(0.0, round((1.0 - (phash_dist / 64.0)) * 100.0, 1))

    # Computer Vision alignment and diff
    orig_img = cv2.imread(str(orig_path))
    cand_img = cv2.imread(str(candidate_path))

    ssim_val = 0.0
    feature_matches_count = 0
    diff_artifact_rel_path = None

    if orig_img is not None and cand_img is not None:
        # Resize candidate to match original dimensions for direct diff comparison
        h, w = orig_img.shape[:2]
        cand_resized = cv2.resize(cand_img, (w, h), interpolation=cv2.INTER_AREA)

        orig_gray = cv2.cvtColor(orig_img, cv2.COLOR_BGR2GRAY)
        cand_gray = cv2.cvtColor(cand_resized, cv2.COLOR_BGR2GRAY)

        # SSIM
        ssim_val = round(calculate_ssim(orig_gray, cand_gray), 3)

        # ORB Keypoint matching
        orb = cv2.ORB_create(nfeatures=500)
        kp1, des1 = orb.detectAndCompute(orig_gray, None)
        kp2, des2 = orb.detectAndCompute(cand_gray, None)

        if des1 is not None and des2 is not None:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            feature_matches_count = len(matches)

        # Visual difference heatmap
        diff = cv2.absdiff(orig_img, cand_resized)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        diff_scaled = np.clip(diff_gray * 3, 0, 255).astype(np.uint8)
        diff_heat = cv2.applyColorMap(diff_scaled, cv2.COLORMAP_HOT)

        # Overlay diff onto original for forensic context
        blend = cv2.addWeighted(orig_img, 0.6, diff_heat, 0.4, 0)

        # Save visual diff artifact
        diff_filename = f"diff_{orig_path.stem}_vs_{candidate_path.stem}.jpg"
        _, encoded = cv2.imencode(".jpg", blend)
        diff_artifact_rel_path, _ = save_artifact_file(encoded.tobytes(), diff_filename)

    # Classification of relationship
    relationship = "Unrelated / Low Similarity"
    if phash_dist <= 5 and ssim_val > 0.85:
        relationship = "Near Identical (Lossless or Mild Transcode)"
    elif phash_dist <= 12 or ssim_val > 0.70:
        relationship = "Derivative / Edited Variant (Crop, Filter, or Splicing)"
    elif phash_dist <= 22:
        relationship = "Visually Similar Subject / Composition"

    return {
        "phash_distance": phash_dist,
        "dhash_distance": dhash_dist,
        "whash_distance": whash_dist,
        "perceptual_similarity_percentage": perceptual_similarity,
        "ssim": ssim_val,
        "feature_matches_count": feature_matches_count,
        "relationship": relationship,
        "diff_artifact_rel_path": diff_artifact_rel_path
    }
