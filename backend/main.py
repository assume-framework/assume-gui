import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from process import process_data

app = FastAPI()


@app.post("/api/submit")
def send_data(data: dict):
    # print("Received data:", data)
    world = process_data(data)
    world.run()

    # with open("data.txt", "a") as f:
    #     f.write(json.dumps(data))
    #     f.flush()


app.mount("/", StaticFiles(directory="./dist", html=True), name="frontend")
