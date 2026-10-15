# TruthLens AI — AI-Powered Image Forensics & Digital Evidence Investigation Platform

> **Tagline:** *"Investigate the image. Discover the evidence. Verify the source."*

TruthLens AI is an end-to-end, enterprise-grade digital forensics platform engineered for investigators, intelligence analysts, journalists, and cybersecurity response teams. It unifies cryptographic evidence preservation, deep metadata extraction, C2PA Content Credentials verification, multi-layer image forensics (ELA, 2D FFT, sensor noise variance), perceptual reverse source discovery, and courtroom-ready ReportLab PDF report generation into a single streamlined investigation workflow.

---

## Key Features

1. **Cryptographic Evidence Preservation & Vaulting**:
   - Ingests suspicious images with zero recompression or bit alterations.
   - Calculates immutable SHA-256 hashes immediately upon byte reception.
   - Tamper-evident chain of custody audit logging for every action and report.

2. **Hardware Metadata & Geospatial Dossier**:
   - Deep EXIF and TIFF tag extraction (Camera make/model, lens, exposure, focal length, ISO).
   - GPS coordinate conversion to decimal degrees with direct Google Maps locator links.
   - Detection of container software tampering signatures (Photoshop, GIMP, Canva, Midjourney, Stable Diffusion).
   - Flagging of stripped or sanitized metadata (common in social media uploads).

3. **C2PA Content Credentials Verification**:
   - Native verification of C2PA / CAI digital provenance manifests using `c2pa-python`.
   - Inspection of digital signature certificates, claim generators, and certified assertion histories.
   - Transparent, honest reporting when manifests are absent (with educational guidance).

4. **Multi-Layer Forensic Analysis Suite**:
   - **Error Level Analysis (ELA)**: Dynamic recompression (70% - 98%) with difference magnification and false-color Jet heatmaps to expose spliced regions.
   - **2D Fast Fourier Transform (FFT)**: Log-magnitude power spectrum analysis to uncover periodic resampling lattices and AI diffusion generator grid artifacts.
   - **Sensor Noise & PRNU Residual**: High-frequency Laplacian filtering and block-wise variance dispersion to detect multi-source compositing.
   - **Luminance Gradient & Edge Inconsistency**: Sobel gradient analysis across boundary contours to identify sharp cutouts or feathered masks.

5. **Reverse Source Discovery & Candidate Visual Diffing**:
   - Multi-algorithm perceptual fingerprinting (`pHash`, `dHash`, `aHash`, `wHash`).
   - Structural Similarity Index (SSIM) and ORB computer vision feature keypoint matching.
   - Discovers top 3 matching candidate images from a forensic reference corpus.
   - Interactive swipe **Split Slider** and pixel-level **Difference Heatmap**.

6. **Explainable Findings & Forensic Ethics**:
   - Strictly separates **Verified Technical Facts** (deterministic cryptographic truths) from **Forensic Estimates** (statistical/probabilistic heuristics).
   - Formulates non-accusatory findings adhering to the core principle: *an image alone never proves who created it or establishes that a person committed a crime*.

7. **Courtroom-Ready PDF Report Generation**:
   - Certified PDF report generated via ReportLab containing case header, chain of custody record, executive verdict, verified facts table, forensic estimates table, embedded high-resolution forensic heatmaps, reverse search matches, and formal legal notices.

---

## Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRUTHLENS AI PLATFORM                           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
      ┌──────────────────────────────┴──────────────────────────────┐
      ▼                                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     truthlens_frontend        │             │      truthlens_backend        │
│  - React 18 + Vite + TS       │  REST API   │  - FastAPI + Python 3.10+     │
│  - Tailwind CSS (Navy/Cyan)   │◄───────────►│  - OpenCV, Pillow, ImageHash  │
│  - Lucide React Icons         │             │  - PyWavelets, c2pa-python    │
│  - Recharts Visualizations    │             │  - NumPy, SciPy, ReportLab    │
│  - Interactive Split-Slider   │             │  - SQLite & Supabase Storage  │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## Quickstart & Local Setup

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+ and NPM

### 1. Backend Setup (`truthlens_backend`)
```bash
cd truthlens_backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation is accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (`truthlens_frontend`)
```bash
cd truthlens_frontend
npm install
npm run dev
```
Open application in browser: `http://127.0.0.1:5173`

---

## Supabase Database Integration & Migrations

TruthLens AI supports Supabase PostgreSQL with private storage and Row Level Security.
To apply the database schema:
1. Open your Supabase project SQL Editor.
2. Run the migration script located at:
   `supabase/migrations/20261015000000_truthlens_schema.sql`
3. Configure your Supabase credentials in `truthlens_backend/.env`:
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   ```
*(Note: If Supabase credentials are not provided, TruthLens AI automatically uses its resilient local SQLite vault without any disruption).*

---

## Deployment Guide

- **Frontend (Vercel)**:
  - Connect the `truthlens_frontend` directory to Vercel.
  - Framework Preset: `Vite`.
  - Build Command: `npm run build`.
  - Output Directory: `dist`.
  - Set environment variable `VITE_API_URL` to your deployed backend URL.

- **Backend (Python Host / Render / Railway / Fly.io)**:
  - Dockerfile or native Python runtime using `uvicorn main:app --host 0.0.0.0 --port $PORT`.
  - Python version: `3.10` or `3.11`.
