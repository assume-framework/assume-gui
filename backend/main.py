import logging
import shutil
import tempfile
import uuid
from pathlib import Path

import uvicorn
from assume.common.exceptions import ValidationError
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask

from backend.io.scenario_adapter import csv_to_flow, flow_to_csv
from backend.io.zip_utils import scenario_root, unzip_to_temp, zip_folder
from backend.process import process_data
from backend.proxy_routes import router as proxy_router
from backend.utils import write_file

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
        logging.error("Value error: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.exception("Internal server error")
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success"}


@app.post("/api/upload")
async def upload_file(file: UploadFile):
    uid = str(uuid.uuid4())
    content = await file.read()
    write_file(uid, content.decode("utf-8"))
    return {"id": uid}


@app.post("/api/import")
async def import_scenario(file: UploadFile):
    tmp_dir = None
    try:
        tmp_dir = unzip_to_temp(file.file)
        return csv_to_flow(scenario_root(tmp_dir))
    except Exception as e:
        logging.error("Import error: %s", e)
        raise HTTPException(status_code=400, detail=f"Could not import scenario: {e}")
    finally:
        if tmp_dir is not None:
            shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/api/export")
async def export_scenario(flow: dict):
    work_dir = Path(tempfile.mkdtemp())
    try:
        target = work_dir / "scenario"
        flow_to_csv(flow, target)
        zip_path = zip_folder(target)
        return FileResponse(
            path=zip_path,
            media_type="application/zip",
            filename="scenario.zip",
            background=BackgroundTask(shutil.rmtree, work_dir, ignore_errors=True),
        )
    except Exception as e:
        shutil.rmtree(work_dir, ignore_errors=True)
        logging.error("Export error: %s", e)
        raise HTTPException(status_code=400, detail=f"Could not export scenario: {e}")


app.mount(
    "/",
    StaticFiles(directory=Path(__file__).parent / "static", html=True),
    name="frontend",
)


def cli():
    uvicorn.run(app, host="0.0.0.0", loop="asyncio")


if __name__ == "__main__":
    cli()
