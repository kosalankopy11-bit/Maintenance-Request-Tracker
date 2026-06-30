from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from ..dependencies import get_current_user
from fastapi import Depends
from ..services.storage import storage

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("")
async def upload(file: UploadFile = File(...), current=Depends(get_current_user)):
    filename = await storage.save(file)
    return {"filename": filename, "url": f"/upload/{filename}"}


@router.get("/{filename}")
def get_upload(filename: str):
    return FileResponse(storage.path_for(filename))
