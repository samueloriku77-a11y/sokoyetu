import os
from PIL import Image
import imagehash
import time
from ..database import SessionLocal
from .. import models

UPLOAD_DIR = os.getenv('UPLOAD_DIR', os.path.join(os.path.dirname(__file__), '..', '..', 'uploads'))

def process_image_file(image_record_id: int):
    db = SessionLocal()
    try:
        img_rec = db.query(models.ProductImage).filter(models.ProductImage.id == image_record_id).first()
        if not img_rec:
            print('Image record not found', image_record_id)
            return

        local_path = os.path.join(UPLOAD_DIR, os.path.basename(img_rec.image_url))
        if not os.path.exists(local_path):
            print('Local file missing', local_path)
            return

        img = Image.open(local_path).convert('RGB')
        ph = str(imagehash.phash(img))
        # generate thumbnail
        thumb = img.copy()
        thumb.thumbnail((400,400))
        base = os.path.basename(local_path)
        name, ext = os.path.splitext(base)
        thumb_name = f"{name}_thumb.jpg"
        thumb_path = os.path.join(UPLOAD_DIR, thumb_name)
        thumb.save(thumb_path, format='JPEG', quality=80)

        img_rec.phash = ph
        img_rec.thumbnail_url = f"/uploads/{thumb_name}"
        db.commit()
        print('Processed image', image_record_id, 'phash', ph, 'thumb', thumb_name)
    except Exception as e:
        print('Processing error', e)
    finally:
        db.close()

if __name__ == '__main__':
    # simple CLI: process most recent unprocessed image
    db = SessionLocal()
    rec = db.query(models.ProductImage).order_by(models.ProductImage.id.desc()).first()
    if rec:
        process_image_file(rec.id)
    else:
        print('No images to process')
