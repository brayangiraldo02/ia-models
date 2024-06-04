from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from version1 import model1_router

# Inicializa la aplicación FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(model1_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}