import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from process import process_data

app = FastAPI()


@app.post("/api/submit")
def send_data(data: dict):
    json.dump(data, open("backend/data.json", "w"))
    world = process_data(data)
    world.run()

app.mount("/", StaticFiles(directory="./dist", html=True), name="frontend")
