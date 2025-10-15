from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from process import process_data

app = FastAPI()

@app.post("/api/submit")
def send_data(data: dict):
    world = process_data(data)
    world.run()
    return {"status": "success"}

app.mount("/", StaticFiles(directory="./dist", html=True), name="frontend")
