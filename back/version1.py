from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
from keras.api.models import load_model
from urllib import parse

model1_router = APIRouter()

# Definir las clases (números y letras)
class_names = [chr(i) for i in range(48, 58)] + [chr(i) for i in range(65, 91)] + [chr(i) for i in range(97, 123)]

# Cargar el modelo guardado
model1 = load_model('mnist.h5')
model2 = load_model('emnist_final_model.keras')

# Definir el esquema del cuerpo de la solicitud
class ImageData(BaseModel):
    pixeles: str

@model1_router.post("/predict/")
async def predict(data: ImageData):
    try:
        # Limpiar los datos recibidos
        data = parse.unquote(data.pixeles)

        # Realizar transformación para dejar igual que los ejemplos que usa EMNIST
        arr = np.fromstring(data, np.float32, sep=",")
        arr = arr.reshape(28, 28)
        arr = np.array(arr)
        arr = arr.reshape(1, 28, 28, 1)

        # Realizar y obtener la predicción
        prediction_values = model1.predict(arr, batch_size=1)
        for i in range(len(prediction_values[0])):
            print(class_names[i] + ": " + str(prediction_values[0][i]))
        prediction_index = np.argmax(prediction_values)
        prediction = class_names[prediction_index]
        print("Prediccion final: " + prediction)

        return {"prediction": prediction}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@model1_router.post("/predict2/")
async def predict(data: ImageData):
    try:
        # Limpiar los datos recibidos
        data = parse.unquote(data.pixeles)

        # Realizar transformación para dejar igual que los ejemplos que usa EMNIST
        arr = np.fromstring(data, np.float32, sep=",")
        arr = arr.reshape(28, 28)
        arr = np.array(arr)
        arr = arr.reshape(1, 28, 28, 1)

        # Realizar y obtener la predicción
        prediction_values = model2.predict(arr, batch_size=1)
        for i in range(len(prediction_values[0])):
            print(class_names[i] + ": " + str(prediction_values[0][i]))
        prediction_index = np.argmax(prediction_values)
        prediction = class_names[prediction_index]
        print("Prediccion final: " + prediction)

        return {"prediction": prediction}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))