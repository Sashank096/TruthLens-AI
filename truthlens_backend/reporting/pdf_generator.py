import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

from config import REPORTS_DIR, VAULT_DIR

class NumberedCanvas(canvas.Canvas):
    """Canvas that adds running header and page numbers (Page X of Y)"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "TRUTHLENS AI — DIGITAL EVIDENCE & IMAGE FORENSICS REPORT")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Running Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 36, "CONFIDENTIAL & PRIVILEGED INVESTIGATIVE WORK PRODUCT — FOR OFFICIAL USE ONLY")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)
        self.restoreState()


def generate_forensic_pdf_report(case_data: Dict[str, Any], analysis_data: Dict[str, Any]) -> Path:
    """
    Generates a courtroom-grade digital forensics evidence report as a downloadable PDF.
    """
    case_number = case_data.get("case_number", "CASE-REPORT")
    report_filename = f"TruthLens_Report_{case_number}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = REPORTS_DIR / report_filename

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    title_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a")
    )
    subtitle_style = ParagraphStyle(
        "BrandSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0284c7")
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1e293b")
    )
    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []

    # 1. HEADER BANNER
    header_table_data = [
        [
            Paragraph("<b>TRUTHLENS AI</b><br/><font color='#0284c7' size='8'>DIGITAL FORENSICS & EVIDENCE INVESTIGATION PLATFORM</font>", title_style),
            Paragraph(f"<b>CASE #:</b> {case_number}<br/><b>DATE:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}<br/><b>EXAMINER:</b> {case_data.get('examiner', 'Forensic Investigator')}", body_style)
        ]
    ]
    header_table = Table(header_table_data, colWidths=[310, 194])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceBefore=2, spaceAfter=8))

    # 2. EVIDENCE CUSTODY & CHAIN SUMMARY
    evidence = case_data.get("evidence", [{}])[0] if case_data.get("evidence") else {}
    sha256 = evidence.get("sha256_hash", analysis_data.get("sha256_hash", "Pending Verification"))
    
    custody_data = [
        [Paragraph("<b>Evidence File:</b>", table_cell), Paragraph(evidence.get("file_name", "Ingested Digital Image"), table_cell),
         Paragraph("<b>Physical Size:</b>", table_cell), Paragraph(f"{evidence.get('file_size', 0):,} bytes", table_cell)],
        [Paragraph("<b>SHA-256 Hash:</b>", table_cell), Paragraph(f"<font face='Courier' size='7'>{sha256}</font>", table_cell),
         Paragraph("<b>Integrity Status:</b>", table_cell), Paragraph("<font color='#059669'><b>Preserved & Verified</b></font>", table_cell)],
        [Paragraph("<b>Case Title:</b>", table_cell), Paragraph(case_data.get("title", "Forensic Investigation"), table_cell),
         Paragraph("<b>Priority:</b>", table_cell), Paragraph(case_data.get("priority", "Medium"), table_cell)]
    ]
    custody_table = Table(custody_data, colWidths=[80, 230, 80, 114])
    custody_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(custody_table)
    story.append(Spacer(1, 10))

    # 3. EXECUTIVE AUTHENTICITY EVALUATION
    risk_score = analysis_data.get("risk_score", 0.0)
    risk_level = analysis_data.get("risk_level", "Undetermined")
    
    # Pick color based on risk score
    if risk_score >= 70:
        bg_col = colors.HexColor("#fee2e2")
        border_col = colors.HexColor("#ef4444")
        text_col = colors.HexColor("#991b1b")
    elif risk_score >= 45:
        bg_col = colors.HexColor("#fef3c7")
        border_col = colors.HexColor("#f59e0b")
        text_col = colors.HexColor("#92400e")
    elif risk_score >= 20:
        bg_col = colors.HexColor("#dbeafe")
        border_col = colors.HexColor("#3b82f6")
        text_col = colors.HexColor("#1e40af")
    else:
        bg_col = colors.HexColor("#dcfce7")
        border_col = colors.HexColor("#10b981")
        text_col = colors.HexColor("#065f46")

    score_box_data = [
        [
            Paragraph(f"<font color='{text_col.hexval()}'><b>AUTHENTICITY RISK EVALUATION: {risk_score} / 100</b></font><br/>"
                      f"<font color='{text_col.hexval()}'><b>Classification:</b> {risk_level}</font><br/>"
                      f"<font size='8'>{analysis_data.get('summary_verdict', 'Analysis completed.')}</font>", body_style)
        ]
    ]
    score_box = Table(score_box_data, colWidths=[504])
    score_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_col),
        ('BOX', (0, 0), (-1, -1), 1, border_col),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(score_box)
    story.append(Spacer(1, 10))

    # 4. VERIFIED FACTS VS. FORENSIC ESTIMATES
    story.append(Paragraph("1. Technical & Cryptographic Findings (Verified Facts vs. Forensic Estimates)", heading_style))
    
    facts_rows = [[Paragraph("Verified Technical Facts (Deterministic)", table_header), Paragraph("Status / Verification", table_header)]]
    for vf in analysis_data.get("verified_facts", []):
        facts_rows.append([
            Paragraph(f"<b>[{vf.get('category')}]</b> {vf.get('fact')}", table_cell),
            Paragraph(f"<font color='#059669'><b>{vf.get('status')}</b></font>", table_cell)
        ])
    facts_table = Table(facts_rows, colWidths=[384, 120])
    facts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(facts_table)
    story.append(Spacer(1, 6))

    estimates_rows = [[Paragraph("Forensic Layer / Heuristic Model", table_header), Paragraph("Statistical Finding", table_header), Paragraph("Confidence", table_header)]]
    for est in analysis_data.get("estimates", []):
        estimates_rows.append([
            Paragraph(f"<b>{est.get('layer')}</b>", table_cell),
            Paragraph(f"{est.get('estimate')}<br/><font color='#64748b' size='7'>{est.get('interpretation')}</font>", table_cell),
            Paragraph(est.get("confidence", "N/A"), table_cell)
        ])
    estimates_table = Table(estimates_rows, colWidths=[140, 304, 60])
    estimates_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(estimates_table)
    story.append(Spacer(1, 10))

    # 5. FORENSIC VISUALIZATIONS (Embedded)
    story.append(Paragraph("2. Forensic Artifact Visualizations", heading_style))
    
    # Try embedding original, ELA heatmap, FFT spectrum, and Noise map
    def _safe_image(rel_path: str, max_w=235, max_h=150):
        if not rel_path:
            return Paragraph("<i>Artifact Pending</i>", table_cell)
        full_p = VAULT_DIR / rel_path
        if full_p.exists():
            try:
                return RLImage(str(full_p), width=max_w, height=max_h)
            except Exception:
                pass
        return Paragraph(f"<i>File Reference: {rel_path}</i>", table_cell)

    orig_rel = evidence.get("storage_rel_path")
    ela_rel = analysis_data.get("ela_summary", {}).get("heatmap_artifact_rel_path")
    fft_rel = analysis_data.get("fft_summary", {}).get("fft_artifact_rel_path")
    noise_rel = analysis_data.get("noise_summary", {}).get("noise_artifact_rel_path")

    vis_data = [
        [
            Paragraph("<b>Original Evidence Sample</b>", table_cell),
            Paragraph("<b>Error Level Analysis (ELA) Heatmap</b>", table_cell)
        ],
        [
            _safe_image(orig_rel),
            _safe_image(ela_rel)
        ],
        [
            Paragraph("<b>2D FFT Frequency Spectrogram</b>", table_cell),
            Paragraph("<b>Sensor Noise Variance Map</b>", table_cell)
        ],
        [
            _safe_image(fft_rel),
            _safe_image(noise_rel)
        ]
    ]
    vis_table = Table(vis_data, colWidths=[250, 254])
    vis_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(KeepTogether(vis_table))
    story.append(Spacer(1, 10))

    # 6. REVERSE SEARCH & CANDIDATE SOURCES (Up to 3 matches)
    candidates = analysis_data.get("candidate_matches", [])
    if candidates:
        story.append(Paragraph("3. Source Discovery & Candidate Matches", heading_style))
        cand_rows = [[
            Paragraph("Candidate Reference / Title", table_header),
            Paragraph("Source URL / Domain", table_header),
            Paragraph("Similarity %", table_header),
            Paragraph("Relationship", table_header)
        ]]
        for c in candidates[:3]:
            cand_rows.append([
                Paragraph(f"<b>{c.get('title', 'Unknown Source')}</b>", table_cell),
                Paragraph(f"<font color='#0284c7' size='7'>{c.get('source_url', 'N/A')[:45]}</font>", table_cell),
                Paragraph(f"<b>{c.get('similarity_percentage')}%</b> (SSIM: {c.get('ssim', 0)})", table_cell),
                Paragraph(c.get("relationship", "Similar"), table_cell)
            ])
        cand_table = Table(cand_rows, colWidths=[160, 164, 90, 90])
        cand_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(cand_table)
        story.append(Spacer(1, 10))

    # 7. INVESTIGATOR NOTES & CASE CUSTODY TIMELINE
    if case_data.get("notes"):
        story.append(Paragraph("4. Investigator Observations & Case Notes", heading_style))
        story.append(Paragraph(case_data.get("notes"), body_style))
        story.append(Spacer(1, 6))

    # 8. LEGAL & FORENSIC METHODOLOGY DISCLAIMER
    disclaimer_text = analysis_data.get("legal_disclaimer", (
        "TruthLens AI assists human forensic investigations. The software measures technical, compression, "
        "and perceptual artifacts. Forensic estimates do not establish criminal culpability or author identity."
    ))
    disclaimer_data = [[
        Paragraph(f"<b>FORENSIC METHODOLOGY & NON-ACCUSATORY NOTICE:</b><br/>{disclaimer_text}", ParagraphStyle(
            "Disc", parent=styles["Normal"], fontName="Helvetica", fontSize=7, leading=9, textColor=colors.HexColor("#475569")
        ))
    ]]
    disclaimer_box = Table(disclaimer_data, colWidths=[504])
    disclaimer_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(Spacer(1, 8))
    story.append(disclaimer_box)

    # Build document with running page numbers
    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path
