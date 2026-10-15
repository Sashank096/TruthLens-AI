from fastapi import APIRouter, Form, HTTPException
from pathlib import Path
from forensics.similarity import compare_images
from config import VAULT_DIR, SEEDS_DIR

router = APIRouter(prefix="/api/comparison", tags=["Visual Comparison"])

@router.post("/compare")
def compare_two_images(
    image_a_path: str = Form(...),
    image_b_path: str = Form(...)
):
    """
    Compares two images: computes perceptual hash distance, SSIM, ORB feature matches,
    and returns a pixel-level visual difference heatmap.
    """
    path_a = VAULT_DIR / image_a_path
    if not path_a.exists():
        path_a = SEEDS_DIR / Path(image_a_path).name

    path_b = VAULT_DIR / image_b_path
    if not path_b.exists():
        path_b = SEEDS_DIR / Path(image_b_path).name

    if not path_a.exists() or not path_b.exists():
        raise HTTPException(status_code=404, detail="One or both comparison images could not be located")

    comparison = compare_images(path_a, path_b)
    return {
        "status": "success",
        "comparison": comparison
    }
