import json
import os
import uuid

import models
from auth import get_current_user
from config import UPLOAD_DIR
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .database import get_db

router = APIRouter()


@router.post("/api/listings/{listing_id}/capture")
async def capture_image(
    listing_id: int,
    file: UploadFile = File(...),
    metadata: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        meta = json.loads(metadata)
    except Exception:
        raise HTTPException(400, "invalid metadata")

    # simple enforcement: require session_hash and timestamp
    if not meta.get("session_hash") or not meta.get("timestamp"):
        raise HTTPException(400, "missing capture metadata")

    # save file locally first
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{listing_id}_{uuid.uuid4().hex}.jpg"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())

    # create ProductImage DB record (minimal)
    img = models.ProductImage(
        product_id=listing_id,
        image_url=f"/uploads/{filename}",
        uploaded_by_id=current_user.id,
        metadata=meta,
    )
    db.add(img)
    db.commit()
    db.refresh(img)

    # enqueue processing - here we just create a placeholder file for worker
    # In production, push to queue (Redis/RabbitMQ)
    # Return accepted response
    return {"status": "accepted", "image_id": img.id, "url": img.image_url}
