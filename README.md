# 🔍 TruthLens AI — AI-Powered Image Forensics & Digital Evidence Investigation Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80" alt="TruthLens AI Forensic Hero" width="100%" style="border-radius: 12px; max-height: 380px; object-fit: cover;" />
</p>

<div align="center">

> **"Investigate the image. Discover the evidence. Verify the source."**

[![CI Build & Forensics Tests](https://github.com/Sashank096/truthlens-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Sashank096/truthlens-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![C2PA Standard](https://img.shields.io/badge/C2PA-Provenance%20Standard-purple.svg)](https://c2pa.org/)
[![ReportLab](https://img.shields.io/badge/ReportLab-5.0%20PDF-red.svg)](https://www.reportlab.com/)

**[🌐 Live GitHub Repository](https://github.com/Sashank096/truthlens-ai)** • **[⚡ Quick Triage Engine](http://127.0.0.1:5173)** • **[📑 Interactive Swagger API](http://127.0.0.1:8000/docs)** • **[📦 Docker Deployment](#-docker--container-deployment)**

</div>

---

## 📑 Table of Contents

- [🚨 The Problem Statement](#-the-problem-statement)
- [💡 What TruthLens AI Solves](#-what-truthlens-ai-solves)
- [🔬 Core Forensic Capabilities](#-core-forensic-capabilities)
- [📐 7-Layer Forensic Architecture](#-7-layer-forensic-architecture)
- [🖼️ Visual Forensic Deep-Dive & Examples](#️-visual-forensic-deep-dive--examples)
  - [1. Error Level Analysis (ELA) & False-Color Heatmaps](#1-error-level-analysis-ela--false-color-heatmaps)
  - [2. 2D Fast Fourier Transform (FFT) Log-Power Spectrum](#2-2d-fast-fourier-transform-fft-log-power-spectrum)
  - [3. Sensor Noise & PRNU Residual Dispersion](#3-sensor-noise--prnu-residual-dispersion)
  - [4. Reverse Source Discovery & Split-Slider Diffing](#4-reverse-source-discovery--split-slider-diffing)
- [⚖️ Verified Technical Facts vs. Forensic Estimates](#️-verified-technical-facts-vs-forensic-estimates)
- [📱 Responsive & Mobile-Optimized UX](#-responsive--mobile-optimized-ux)
- [📄 Courtroom-Ready PDF Dossier](#-courtroom-ready-pdf-dossier)
- [🚀 Quickstart & Local Setup](#-quickstart--local-setup)
- [🐳 Docker & Container Deployment](#-docker--container-deployment)
- [☁️ Cloud Deployment (Vercel, Render, Railway, Supabase)](#️-cloud-deployment-vercel-render-railway-supabase)
- [🛡️ Ethical Forensic Principles & Legal Disclaimer](#️-ethical-forensic-principles--legal-disclaimer)

---

## 🚨 The Problem Statement

In today's digital information ecosystem, manipulated media travels at lightning speed. From weaponized political deepfakes and fraudulent cyber insurance claims to identity impersonation, social engineering, and counterfeit war imagery:

1. **The "Cheapfake" & Deepfake Explosion**: Modern generative AI (Stable Diffusion, Midjourney, FLUX) and consumer editing tools allow anyone to alter, composite, or synthesize photo-realistic images in seconds.
2. **The Evidentiary Vacuum**: Standard photo viewers and social media platforms automatically re-encode images and wipe EXIF metadata, making superficial visual inspection completely useless.
3. **Black-Box AI Fallacy**: Existing "AI detectors" output arbitrary percentages without transparent explanations. They fail under scrutiny in legal or intelligence contexts because they cannot explain **why** an image is flagged or produce an unassailable **chain of custody**.
4. **Disjointed Forensic Tooling**: Investigators are forced to juggle 6+ disconnected command-line scripts: one for EXIF, one for ELA, one for reverse search, and another for provenance manifests.

> **TruthLens AI was built to solve this crisis.** It transforms fragmented forensic techniques into a unified, transparent, courtroom-ready digital evidence workstation.

---

## 💡 What TruthLens AI Solves

TruthLens AI provides a deterministic, multi-modal evidence pipeline that bridges the gap between raw bytes and defensible investigative conclusions:

| Traditional Image Inspection | TruthLens AI Digital Forensic Workstation |
|:---|:---|
| ❌ Superficial visual inspection prone to human bias | ✅ **Multi-Layer Physics & Signal Analysis** (ELA, 2D FFT, PRNU noise variance) |
| ❌ Black-box "AI detector" scores with zero explainability | ✅ **Strict Separation** of **Verified Facts** (cryptographic SHA-256) vs **Forensic Estimates** |
| ❌ Broken chain of custody; evidence easily challenged in court | ✅ **Immutable SHA-256 Vaulting** & ISO-compliant chronological audit logs |
| ❌ Blind to C2PA Content Credentials provenance | ✅ **Native C2PA JUMBF Manifest Verification** (`c2pa-python`) |
| ❌ Generic search engines returning irrelevant social posts | ✅ **Perceptual Reverse Source Discovery** (pHash, SSIM, ORB feature matching) |
| ❌ Screenshotting dashboards to produce informal evidence | ✅ **Automated Courtroom-Ready PDF Reports** via ReportLab with embedded heatmaps |
| ❌ Desktop-only command-line tools inaccessible in the field | ✅ **Modern, Touch-Friendly, Responsive App** operable on mobile, tablet, and PC |

---

## 🔬 Core Forensic Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TRUTHLENS AI FORENSIC ARSENAL                        │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. VAULT & CHAIN  │ 2. SENSOR & EXIF  │ 3. PROVENANCE MANIFEST         │
│ • SHA-256 Hash    │ • Camera & Lens   │ • C2PA / CAI Content Creds     │
│ • Zero Alteration │ • Exposure Optics │ • Digital Signature Authority  │
│ • Audit Custody   │ • GPS Coordinates │ • Edit Assertion History       │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. COMPRESSION    │ 5. FREQUENCY DOM  │ 6. SENSOR NOISE / PRNU         │
│ • Error Level     │ • 2D FFT Spectrum │ • Laplacian Noise Dispersion   │
│ • Dynamic Quality │ • Resampling Grid │ • Splicing Variance Detector   │
│ • False-Color Jet │ • AI Latent Spikes│ • Luminance Sobel Edges        │
├───────────────────┴───────────────────┴────────────────────────────────┤
│ 7. SOURCE DISCOVERY & REVERSE CORPUS MATCHING                          │
│ • Perceptual Hash (pHash/dHash/wHash) • Structural Similarity (SSIM)   │
│ • ORB Feature Keypoints • Interactive Swipe Split-Slider & Diff Heatmap│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 7-Layer Forensic Architecture

```
                                      [ INGESTION ]
                                            │
                              Raw Evidence Image Upload
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │      Layer 1: Immutable SHA-256 Vault         │
                    │  Zero-alteration byte preservation & hashing  │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
    ┌───────────────────────────────┐               ┌───────────────────────────────┐
    │ Layer 2: Hardware & Metadata  │               │ Layer 3: C2PA Provenance      │
    │  • Camera model, Lens & ISO   │               │  • Content Credentials (CAI)  │
    │  • Embedded GPS coordinates   │               │  • Signer certificate chain   │
    │  • Software tag detection     │               │  • Assertion edit history     │
    └───────────────┬───────────────┘               └───────────────┬───────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │      PHYSICAL & FREQUENCY SIGNAL FORENSICS    │
                    ├───────────────────────────────────────────────┤
                    │ Layer 4: Multi-Channel Error Level (ELA)      │
                    │  • Differential quantization compression      │
                    │  • 18x residual magnification & Jet heatmap   │
                    ├───────────────────────────────────────────────┤
                    │ Layer 5: 2D Fast Fourier Transform (FFT)      │
                    │  • Shifted log-magnitude power spectrum       │
                    │  • Periodic AI generator lattice detection    │
                    ├───────────────────────────────────────────────┤
                    │ Layer 6: Sensor Noise Variance (PRNU)         │
                    │  • Laplacian residual kernel (3x3 high-pass)  │
                    │  • Block-wise variance & splicing detection   │
                    ├───────────────────────────────────────────────┤
                    │ Layer 7: Luminance Gradient & Edge Coherence  │
                    │  • Sobel gradient & directional sharpness     │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │ Layer 8: Perceptual Reverse Source Discovery  │
                    │  • Multi-hash distance (pHash, dHash, wHash)  │
                    │  • SSIM & ORB keypoint feature matching       │
                    │  • Candidate Wire vs Evidence Diff Heatmap    │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │   EXPLAINABLE FORENSIC SYNTHESIS ENGINE       │
                    │  • Deterministic Facts vs Heuristic Estimates │
                    │  • Non-accusatory objective risk assessment   │
                    └───────────────────────┬───────────────────────┘
                                            │
                           ┌────────────────┴────────────────┐
                           ▼                                 ▼
             ┌───────────────────────────┐     ┌───────────────────────────┐
             │ Interactive Web & Mobile  │     │ Courtroom-Ready PDF       │
             │ Full Forensic Workstation │     │ ReportLab Certified File  │
             └───────────────────────────┘     └───────────────────────────┘
```

---

## 🖼️ Visual Forensic Deep-Dive & Examples

### 1. Error Level Analysis (ELA) & False-Color Heatmaps
When an image is saved in JPEG format, an 8x8 pixel Discrete Cosine Transform (DCT) quantization grid is applied. When an attacker splices an object into an image and resaves it, the spliced region possesses a different compression error rate than the surrounding authentic background.

```
Authentic Image (Uniform Error)       Spliced Image (Localized Hotspot)
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│  █████████████████████████████  │   │  █████████████████████████████  │
│  █████████████████████████████  │   │  █████████╔═══════╗███████████  │
│  █████████████████████████████  │   │  █████████║ HOT!  ║███████████  │
│  █████████████████████████████  │   │  █████████║  ELA  ║███████████  │
│  █████████████████████████████  │   │  █████████╚═══════╝███████████  │
│  █████████████████████████████  │   │  █████████████████████████████  │
└─────────────────────────────────┘   └─────────────────────────────────┘
  Residual: 1.2% (Uniform Cool)         Residual: 14.8% (Spliced Anomaly)
```

TruthLens AI generates:
- **Raw ELA Difference Matrix**: Magnified 18x across selectable JPEG quality steps (70% to 98%).
- **False-Color Jet Heatmap**: Maps elevated residual energy into glowing red/yellow contours for instantaneous visual identification by investigators.

---

### 2. 2D Fast Fourier Transform (FFT) Log-Power Spectrum
Natural optical cameras capture continuous spatial variations. Conversely, Generative Adversarial Networks (GANs) and Latent Diffusion Models (Stable Diffusion, Midjourney, DALL-E) introduce periodic upsampling and deconvolution artifacts:

$$\mathcal{F}(u, v) = \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} f(x, y) e^{-j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)}$$

- **Natural Photographs**: Concentrated central low-frequency Gaussian roll-off with continuous decay.
- **AI-Synthesized Images**: Symmetrical periodic spikes, cruciform coordinate spikes, and unnatural high-frequency harmonic lattices.

---

### 3. Sensor Noise & PRNU Residual Dispersion
Every camera sensor possesses Photo-Response Non-Uniformity (PRNU) — a microscopic, physical "fingerprint" left by silicon substrate variations.
TruthLens AI applies a 2D Laplacian high-pass filter:

$$\nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2}$$

It computes the spatial dispersion (Coefficient of Variation) across image blocks:
- **Single-Source Authentic Image**: Uniform noise variance across entire frame ($CV < 0.85$).
- **Composite / Cut-and-Paste Tampering**: Inconsistent noise variance where the inserted element exhibits significantly higher or lower sensor grain ($CV > 1.25$).

---

### 4. Reverse Source Discovery & Split-Slider Diffing
Finding the original wire image is the gold standard of digital forensics. TruthLens AI evaluates perceptual hashes and feature descriptors against reference corpora:

| Algorithm | Type | Primary Purpose |
|:---|:---|:---|
| **pHash** | Discrete Cosine Transform | Perceptual frequency invariance across crops/filters |
| **dHash** | Difference Gradient | High-speed structural gradient tracking |
| **wHash** | Haar Wavelet Transform | Multi-resolution sub-band spatial matching |
| **SSIM** | Structural Similarity | Human visual perception index ($0.00$ to $1.00$) |
| **ORB** | Oriented FAST & Rotated BRIEF | 500-point keypoint rotation/scale invariant feature matching |

The web interface provides an interactive **Split-Slider** allowing investigators to swipe directly between the suspicious evidence and the authentic candidate, alongside an automated **Pixel Difference Heatmap**.

---

## ⚖️ Verified Technical Facts vs. Forensic Estimates

In accordance with strict forensic guidelines (SWGDE, ENFSI, and NIST), TruthLens AI separates deterministic facts from heuristic estimates:

```
┌───────────────────────────────────┬───────────────────────────────────┐
│     VERIFIED TECHNICAL FACTS      │        FORENSIC ESTIMATES         │
│     (Deterministic & Exact)       │   (Statistical & Probabilistic)   │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Cryptographic SHA-256 Digest    │ • Error Level Analysis Anomaly %  │
│ • File Size & Header Container    │ • 2D FFT Spectral Harmonic Energy │
│ • Valid C2PA Cryptographic Certs  │ • PRNU Sensor Noise Dispersion CV │
│ • EXIF Camera Sensor Parameters   │ • Perceptual Hash Match Proximity │
│ • Embedded GPS Coordinates        │ • Overall Risk Tier Assessment    │
└───────────────────────────────────┴───────────────────────────────────┘
```

> **Forensic Ethics Notice**: *TruthLens AI outputs are scientific estimates designed to assist qualified investigators. An image alone does not prove who authored it or establish criminal intent.*

---

## 📱 Responsive & Mobile-Optimized UX

TruthLens AI was designed from the ground up to operate smoothly on mobile devices, tablets, and high-resolution desktop forensic monitors:

- **Touch-Friendly Split-Slider**: Full support for single-finger touch dragging (`onTouchStart`, `onTouchMove`, `touch-none`) so slider swipes do not trigger accidental page scrolling.
- **Adaptive Breakpoint Canvases**: Dynamic viewport heights (`h-[270px] sm:h-[380px] md:h-[450px]`) that prevent clipping on compact phone screens.
- **Horizontal Swipeable Sub-Navs**: Clean tab carousels for ELA, FFT, Noise, EXIF, C2PA, and Source Candidates with smooth horizontal touch-scrolling.
- **Mobile Card Triage View**: Instant transformation from multi-column tables to responsive cards on smartphone viewports.
- **Client-Side Fallback Engine**: If the Python backend is cold-starting or offline, an in-browser WebCrypto & HTML5 Canvas engine seamlessly processes uploads so field investigators never get blocked.

---

## 📄 Courtroom-Ready PDF Dossier

Every investigation can be exported with a single click into a cryptographically sealed, multi-page PDF report generated via ReportLab:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRUTHLENS AI FORENSICS                          │
│                    DIGITAL EVIDENCE DOSSIER REPORT                     │
│                       CASE ID: TL-20261015-88A9F2                      │
├────────────────────────────────────────────────────────────────────────┤
│ • Lead Examiner: Senior Forensic Specialist                            │
│ • Evidence File: suspect_alteration_final.jpg                          │
│ • Immutable SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677... │
│ • Chain-of-Custody Events: 3 Chronological Entries Verified            │
├────────────────────────────────────────────────────────────────────────┤
│ [EXECUTIVE VERDICT]                                                    │
│ Overall Risk: HIGH LIKELIHOOD OF MANIPULATION (Score: 78/100)          │
│ Localized ELA block compression variance indicates spliced subject.    │
├────────────────────────────────────────────────────────────────────────┤
│ [EMBEDDED HIGH-RESOLUTION FORENSIC ARTIFACTS]                          │
│ ┌──────────────────────┐  ┌──────────────────────┐                     │
│ │   Original Evidence  │  │   ELA Jet Heatmap    │                     │
│ └──────────────────────┘  └──────────────────────┘                     │
│ ┌──────────────────────┐  ┌──────────────────────┐                     │
│ │  2D FFT Spectrogram  │  │ Sensor Noise Matrix  │                     │
│ └──────────────────────┘  └──────────────────────┘                     │
├────────────────────────────────────────────────────────────────────────┤
│ [FORMAL LEGAL & STATISTICAL DISCLAIMER]                                │
│ Output produced pursuant to computational forensic standards.          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Python**: `3.10` or `3.11`
- **Node.js**: `18.x` or `20.x` with `npm`
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Sashank096/truthlens-ai.git
cd truthlens-ai
```

### 2. Backend Setup (`truthlens_backend`)
```bash
# Enter backend directory
cd truthlens_backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scriptsctivate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API running at: `http://127.0.0.1:8000`
- Interactive OpenAPI Swagger Docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup (`truthlens_frontend`)
In a new terminal:
```bash
cd truthlens_frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Open application in browser: `http://127.0.0.1:5173`

### 4. Run Automated Test Suite
TruthLens AI includes a complete automated test suite verifying all 7 forensic layers:
```bash
cd truthlens_backend
python -m pytest test_backend.py -v
```

---

## 🐳 Docker & Container Deployment

TruthLens AI includes a production-grade multi-stage Dockerfile and Docker Compose configuration:

### Run with Docker Compose
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Health Check: `http://localhost:8000/api/health`

### Build Backend Container Standalone
```bash
cd truthlens_backend
docker build -t truthlens-backend .
docker run -p 8000:8000 -v $(pwd)/vault:/app/vault truthlens-backend
```

---

## ☁️ Cloud Deployment

### 1. Deploy Frontend on Vercel
1. Push repository to your GitHub account.
2. Import project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `truthlens_frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://truthlens-api.onrender.com`).
5. Deploy! Vercel handles automated CDN caching and builds.

### 2. Deploy Backend on Render / Railway
A pre-configured `render.yaml` is included:
1. Connect repository on [Render](https://render.com).
2. Create a new **Web Service** pointing to `truthlens_backend/Dockerfile`.
3. Add a persistent disk mounted to `/app/vault` (to preserve forensic evidence).
4. Set Environment Variables:
   - `SECRET_KEY`: Random 64-character hex key.
   - `STORAGE_BACKEND`: `local` or `supabase`.

### 3. Supabase Integration (Optional PostgreSQL & Cloud Storage)
TruthLens AI supports Supabase for distributed enterprise custody:
1. Run the database migration script:
   ```sql
   -- Found in supabase/migrations/20261015000000_truthlens_schema.sql
   ```
2. Configure credentials in `truthlens_backend/.env`:
   ```env
   STORAGE_BACKEND=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-service-key
   SUPABASE_BUCKET=truthlens-vault
   ```

---

## 📂 Repository Structure

```
truthlens-ai/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated CI tests for backend and frontend
├── supabase/
│   └── migrations/
│       └── 20261015000000_truthlens_schema.sql  # Supabase PostgreSQL schema & RLS
├── truthlens_backend/
│   ├── forensics/                 # 7-layer computational forensics engine
│   │   ├── metadata_extractor.py  # EXIF, GPS, and software tag inspection
│   │   ├── provenance.py          # Native C2PA manifest verification
│   │   ├── ela.py                 # Multi-channel ELA & Jet heatmaps
│   │   ├── frequency.py           # 2D FFT shifted log-power spectrum
│   │   ├── noise.py               # Laplacian sensor noise & PRNU dispersion
│   │   ├── gradient.py            # Sobel luminance edge analysis
│   │   ├── similarity.py          # pHash, SSIM, and ORB keypoint matching
│   │   └── synthesizer.py         # Explainable findings & risk calculation
│   ├── reverse_search/
│   │   ├── engine.py              # Perceptual search against reference corpus
│   │   └── seeds/                 # Authentic wire originals & benchmark variants
│   ├── reporting/
│   │   └── pdf_generator.py       # Courtroom ReportLab PDF dossier builder
│   ├── config.py                  # Environment & settings configuration
│   ├── database.py                # SQLite / PostgreSQL custody ledger
│   ├── storage.py                 # Local disk & Supabase storage drivers
│   ├── main.py                    # FastAPI entrypoint & REST API endpoints
│   ├── test_backend.py            # Comprehensive 10/10 automated test suite
│   ├── requirements.txt           # Python dependencies
│   ├── render.yaml                # Render cloud deployment blueprint
│   └── Dockerfile                 # Production backend container build
├── truthlens_frontend/
│   ├── src/
│   │   ├── components/            # UI components (SplitSlider, Heatmap, RiskMeter)
│   │   ├── pages/                 # Dashboard, CaseDetail, NewInvestigation, QuickScan
│   │   ├── services/              # API clients & client-side fallback forensics
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Main router & layout shell
│   │   └── main.tsx               # React DOM entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml             # Full-stack container orchestration
├── LICENSE                        # MIT License
└── README.md                      # Platform documentation & forensic reference
```

---

## 🛡️ Ethical Forensic Principles & Legal Disclaimer

TruthLens AI is dedicated to the ethical, objective, and reproducible evaluation of digital media. We strictly uphold the following investigative principles:

1. **Non-Accusatory Analysis**: An image analysis algorithm identifies physical and mathematical anomalies; it does not determine intent, motive, or criminal guilt. Findings are phrased objectively (e.g., *"Elevated block variance in region X indicates recompression"* rather than *"Suspect forged document"*).
2. **Deterministic Transparency**: Every mathematical transformation (FFT, ELA, Laplacian) is open-source, deterministic, and can be independently replicated by third-party defense or prosecution experts.
3. **Chain-of-Custody Integrity**: Original evidence bytes are preserved with zero modification, verified by SHA-256 digests.

> **LEGAL NOTICE**: *TruthLens AI provides computational evidence analysis designed to assist human investigators. Algorithmic outputs are scientific estimates and do not constitute conclusive legal proof of authorship or intent. Final conclusions should always be reached in conjunction with investigative corroboration.*

---

<div align="center">

**Built for investigators, journalists, intelligence analysts, and digital truth.**  
Made with ❤️ by the **TruthLens AI Team** • [GitHub Repository](https://github.com/Sashank096/truthlens-ai)

</div>
