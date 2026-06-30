import csv
from io import StringIO

REQUIRED_COLUMNS = {"title", "description", "priority"}
VALID_PRIORITIES = {"Low", "Medium", "High"}


def parse_csv(content: bytes) -> dict:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(StringIO(text))
    if not reader.fieldnames or not REQUIRED_COLUMNS.issubset(set(reader.fieldnames)):
        return {"valid": [], "failed": [], "errors": ["CSV must include title, description, priority columns"]}
    valid, failed, errors = [], [], []
    for index, row in enumerate(reader, start=2):
        row_errors = []
        if len((row.get("title") or "").strip()) < 3:
            row_errors.append("Title must be at least 3 characters")
        if len((row.get("description") or "").strip()) < 10:
            row_errors.append("Description must be at least 10 characters")
        if row.get("priority") not in VALID_PRIORITIES:
            row_errors.append("Priority must be Low, Medium, or High")
        normalized = {
            "title": (row.get("title") or "").strip(),
            "description": (row.get("description") or "").strip(),
            "priority": (row.get("priority") or "").strip(),
            "tenant_id": (row.get("tenant_id") or "").strip() or None,
        }
        if row_errors:
            failed.append({"row": index, "data": row, "errors": row_errors})
            errors.extend([f"Row {index}: {error}" for error in row_errors])
        else:
            valid.append(normalized)
    return {"valid": valid, "failed": failed, "errors": errors}
