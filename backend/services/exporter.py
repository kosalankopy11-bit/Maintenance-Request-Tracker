import csv
from datetime import datetime
from io import BytesIO, StringIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def requests_to_csv(rows: list[dict]) -> str:
    buffer = StringIO()
    fieldnames = ["request_id", "title", "priority", "status", "tenant_name", "staff_name", "created_at"]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow({key: row.get(key) for key in fieldnames})
    return buffer.getvalue()


def requests_to_pdf(rows: list[dict]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 48
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(42, y, "MaintainHub Requests Report")
    pdf.setFont("Helvetica", 9)
    y -= 20
    pdf.drawString(42, y, f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    y -= 28
    pdf.setFont("Helvetica-Bold", 8)
    pdf.drawString(42, y, "ID")
    pdf.drawString(78, y, "Title")
    pdf.drawString(250, y, "Priority")
    pdf.drawString(315, y, "Status")
    pdf.drawString(405, y, "Tenant")
    y -= 14
    pdf.setFont("Helvetica", 8)
    for row in rows:
        if y < 52:
            pdf.showPage()
            y = height - 48
            pdf.setFont("Helvetica", 8)
        pdf.drawString(42, y, str(row.get("request_id", "")))
        pdf.drawString(78, y, str(row.get("title", ""))[:35])
        pdf.drawString(250, y, str(row.get("priority", "")))
        pdf.drawString(315, y, str(row.get("status", "")))
        pdf.drawString(405, y, str(row.get("tenant_name", ""))[:22])
        y -= 14
    pdf.save()
    buffer.seek(0)
    return buffer.read()
