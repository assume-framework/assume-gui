import logging
import uuid
from pathlib import Path

import uvicorn
from assume.common.exceptions import ValidationError
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles

from backend.process import process_data

app = FastAPI()


@app.post("/api/submit")
async def send_data(data: dict):
    try:
        world = process_data(data)
        world.run()
    except ValidationError as e:
        raise HTTPException(status_code=400, detail={
            "message": str(e),
            "id": e.id,
            "field": e.field,
        })
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Internal server error: ",e)
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success"}


@app.post("/api/upload")
async def upload_file(file: UploadFile):
    uid = str(uuid.uuid4())
    tmpfile = Path(__file__).parent / "tmp" / f"{uid}.csv"
    tmpfile.parent.mkdir(exist_ok=True, parents=True)
    content = (await file.read()).decode("utf-8")
    tmpfile.open("w+").write(content)
    return {"id": uid}


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="frontend",
)


def cli():
    uvicorn.run(app, host="0.0.0.0", port=9090)


if __name__ == "__main__":
    cli()
