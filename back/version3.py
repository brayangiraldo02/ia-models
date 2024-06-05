from fastapi import FastAPI, File, UploadFile, APIRouter
from fastapi.responses import JSONResponse
import pytesseract
from PIL import Image
import cv2
import numpy as np
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

model3_router = APIRouter()

def upgrade_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresholded = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    return thresholded

def extract_text(image):
    img = upgrade_image(image)
    texto = pytesseract.image_to_string(img)
    cv2.imwrite('temp2.jpg', img)
    return texto, img

@model3_router.post("/upload-image-model3/")
async def upload_image(file: UploadFile = File(...)):
    # Leer el contenido del archivo subido
    contents = await file.read()

    # Guardar la imagen recibida localmente
    with open('temp1.jpg', 'wb') as f:
        f.write(contents)

    # Convertir el contenido en un array numpy
    nparr = np.frombuffer(contents, np.uint8)

    # Leer la imagen desde el array numpy
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return JSONResponse(content={"error": "La imagen no pudo ser decodificada."}, status_code=400)

     # Recortar la imagen
    cuadroX = 125
    cuadroY = 90
    cuadroWidth = 400
    cuadroHeight = 300
    cropped_img = img[cuadroY:cuadroY+cuadroHeight, cuadroX:cuadroX+cuadroWidth]
    
    # Extraer el texto de la imagen
    texto, processed_img = extract_text(cropped_img)

    # Convertir la imagen procesada a formato JPEG
    _, img_encoded = cv2.imencode('.jpg', processed_img)
    img_bytes = img_encoded.tobytes()

    # Guardar la imagen procesada localmente
    cv2.imwrite('temp.jpg', processed_img)

    return JSONResponse(content={"text": texto, "image": img_bytes.hex()})
