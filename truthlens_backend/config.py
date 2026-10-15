import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env from backend directory or parent directories
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR.parent / ".env.local")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ruewkkyeynnfgkhoabzu.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_gwCBALVL3MhDAu-VDpe7fg_jUemU96m")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Storage directories for digital evidence vault
VAULT_DIR = BASE_DIR / "vault"
ORIGINALS_DIR = VAULT_DIR / "originals"
ARTIFACTS_DIR = VAULT_DIR / "artifacts"
REPORTS_DIR = VAULT_DIR / "reports"
SEEDS_DIR = BASE_DIR / "seeds"

for d in [VAULT_DIR, ORIGINALS_DIR, ARTIFACTS_DIR, REPORTS_DIR, SEEDS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Application secret
SECRET_KEY = os.getenv("SECRET_KEY", "truthlens_digital_evidence_secret_key_2026")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]
