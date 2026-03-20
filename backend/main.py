import logging
import uuid
from pathlib import Path

import uvicorn
from assume.common.exceptions import ValidationError
from backend.process import process_data
from backend.proxy_routes import router as proxy_router
from backend.utils import write_file
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.include_router(proxy_router)


@app.post("/api/submit")
async def send_data(data: dict):
    try:
        world = process_data(data)
        world.run()
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "message": str(e),
                "id": e.id,
                "field": e.field,
            },
        )
    except ValueError as e:
        logging.error("Value error: ", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error("Internal server error: ", e)
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success"}


@app.post("/api/upload")
async def upload_file(file: UploadFile):
    uid = str(uuid.uuid4())
    content = await file.read()
    write_file(uid, content.decode("utf-8"))
    return {"id": uid}


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="frontend",
)


def cli():
    uvicorn.run(app, host="0.0.0.0", loop="asyncio")


if __name__ == "__main__":
    cli()
