from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import json
from config import SEEDS_DIR

router = APIRouter(prefix="/api/reference", tags=["Reference Corpus"])

@router.get("/list")
def list_reference_items():
    """Lists all reference benchmark images in the forensic corpus."""
    idx_path = SEEDS_DIR / "reference_index.json"
    if not idx_path.exists():
        return {"items": []}
    with open(idx_path, "r") as f:
        items = json.load(f)
    return {"items": items}

@router.get("/file/{filename}")
def get_reference_file(filename: str):
    """Serves a reference benchmark image file."""
    file_path = SEEDS_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Reference file not found")
    return FileResponse(path=str(file_path), media_type="image/jpeg")
