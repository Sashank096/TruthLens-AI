from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from database import get_case
from reporting.pdf_generator import generate_forensic_pdf_report
from config import REPORTS_DIR

router = APIRouter(prefix="/api/reports", tags=["Forensic Reports"])

@router.get("/{case_id}/pdf")
def download_case_pdf(case_id: str):
    """Generates and serves the downloadable forensic investigation PDF report."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    forensic_results = case.get("forensic_results", [])
    latest_analysis = forensic_results[0] if forensic_results else {}

    # Generate fresh PDF
    pdf_path = generate_forensic_pdf_report(case, latest_analysis)

    return FileResponse(
        path=str(pdf_path),
        filename=pdf_path.name,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{pdf_path.name}"'}
    )

@router.get("/{case_id}/preview")
def preview_case_pdf(case_id: str):
    """Streams the forensic investigation PDF inline for in-browser viewing."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    forensic_results = case.get("forensic_results", [])
    latest_analysis = forensic_results[0] if forensic_results else {}

    pdf_path = generate_forensic_pdf_report(case, latest_analysis)

    return FileResponse(
        path=str(pdf_path),
        filename=pdf_path.name,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{pdf_path.name}"'}
    )
