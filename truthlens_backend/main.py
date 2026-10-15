from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn

from config import VAULT_DIR, ALLOWED_ORIGINS, API_HOST, API_PORT
from routers.investigation import router as investigation_router
from routers.forensics import router as forensics_router
from routers.comparison import router as comparison_router
from routers.reports import router as reports_router
from routers.reference import router as reference_router

app = FastAPI(
    title="TruthLens AI Forensic Engine",
    description="AI-Powered Image Forensics, Cryptographic Evidence Preservation, and Provenance Verification API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount evidence vault as static directory for artifacts and heatmaps
app.mount("/vault", StaticFiles(directory=str(VAULT_DIR)), name="vault")

# Mount API Routers
app.include_router(investigation_router)
app.include_router(forensics_router)
app.include_router(comparison_router)
app.include_router(reports_router)
app.include_router(reference_router)

@app.get("/")
def root():
    return {
        "platform": "TruthLens AI",
        "tagline": "Investigate the image. Discover the evidence. Verify the source.",
        "status": "Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "modules": {
            "cryptographic_hashing": "SHA-256 Enabled",
            "metadata_extraction": "EXIF/GPS/XMP Active",
            "c2pa_provenance": "c2pa-python Native Engine Active",
            "error_level_analysis": "OpenCV Multi-Channel ELA Active",
            "frequency_analysis": "2D Fast Fourier Transform (FFT) Active",
            "noise_analysis": "Sensor PRNU & Laplacian Residual Active",
            "perceptual_similarity": "Multi-Hash & ORB Descriptors Active",
            "pdf_reporting": "ReportLab 5.0 Courtroom Generator Active"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=True)
