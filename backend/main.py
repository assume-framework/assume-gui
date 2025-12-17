from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from .process import process_data

app = FastAPI()


@app.post("/api/submit")
def send_data(data: dict):
    try:
        world = process_data(data)
        world.run()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))
    return {"status": "success"}


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="frontend",
)


def cli():
    uvicorn.run(app, host="0.0.0.0", port=9090)


if __name__ == "__main__":
    cli()
