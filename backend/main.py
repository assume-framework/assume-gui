import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .process import process_data

app = FastAPI()


@app.post("/api/submit")
def send_data(data: dict):
    world = process_data(data)
    world.run()
    return {"status": "success"}


app.mount("/", StaticFiles(directory="./dist", html=True), name="frontend")


def cli():
    uvicorn.run(app, host="0.0.0.0", port=9090)


if __name__ == "__main__":
    cli()
