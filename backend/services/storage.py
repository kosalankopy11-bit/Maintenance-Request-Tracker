from pathlib import Path
from uuid import uuid4
from fastapi import HTTPException, UploadFile
from ..config import get_settings


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


class LocalStorage:
    def __init__(self) -> None:
        self.root = Path(get_settings().upload_dir)
        self.root.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile) -> str:
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only jpg, png, and pdf uploads are allowed")
        name = f"{uuid4().hex}{ext}"
        target = self.root / name
        content = await file.read()
        target.write_bytes(content)
        return name

    def path_for(self, filename: str) -> Path:
        path = (self.root / filename).resolve()
        if self.root.resolve() not in path.parents and path != self.root.resolve():
            raise HTTPException(status_code=400, detail="Invalid file path")
        if not path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return path


storage = LocalStorage()
