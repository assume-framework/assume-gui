from __future__ import annotations

import os
import shutil
import stat
import tempfile
import zipfile
from pathlib import Path

MAX_ZIP_UPLOAD_SIZE = 100 * 1024 * 1024
MAX_ZIP_FILES = 1_000
MAX_ZIP_MEMBER_SIZE = 256 * 1024 * 1024
MAX_ZIP_TOTAL_SIZE = 1024 * 1024 * 1024
MAX_ZIP_COMPRESSION_RATIO = 200
_COPY_CHUNK_SIZE = 1024 * 1024


def _archive_size(file_obj) -> int:
    if isinstance(file_obj, (str, os.PathLike)):
        return Path(file_obj).stat().st_size
    try:
        position = file_obj.tell()
        file_obj.seek(0, os.SEEK_END)
        size = file_obj.tell()
        file_obj.seek(position)
        return size
    except (AttributeError, OSError) as exc:
        raise ValueError("ZIP upload must be seekable") from exc


def _validated_members(z: zipfile.ZipFile, root: Path) -> list[zipfile.ZipInfo]:
    members = z.infolist()
    if len(members) > MAX_ZIP_FILES:
        raise ValueError(f"ZIP contains too many entries (maximum {MAX_ZIP_FILES})")

    total_size = 0
    total_compressed_size = 0
    targets: set[Path] = set()
    for info in members:
        target = (root / info.filename).resolve()
        if not target.is_relative_to(root):
            raise ValueError(f"unsafe zip path refused: {info.filename!r}")
        if target in targets:
            raise ValueError(f"duplicate zip path refused: {info.filename!r}")
        targets.add(target)

        mode = info.external_attr >> 16
        if stat.S_ISLNK(mode):
            raise ValueError(f"zip symlink refused: {info.filename!r}")
        if info.flag_bits & 0x1:
            raise ValueError(f"encrypted zip entry refused: {info.filename!r}")
        if info.is_dir():
            continue
        if info.file_size > MAX_ZIP_MEMBER_SIZE:
            raise ValueError(
                f"ZIP entry {info.filename!r} is too large "
                f"(maximum {MAX_ZIP_MEMBER_SIZE} bytes)"
            )

        total_size += info.file_size
        total_compressed_size += info.compress_size
        if total_size > MAX_ZIP_TOTAL_SIZE:
            raise ValueError(f"ZIP expands beyond the {MAX_ZIP_TOTAL_SIZE} byte limit")
        ratio = info.file_size / max(info.compress_size, 1)
        if ratio > MAX_ZIP_COMPRESSION_RATIO:
            raise ValueError(
                f"ZIP entry {info.filename!r} has an unsafe compression ratio"
            )

    total_ratio = total_size / max(total_compressed_size, 1)
    if total_ratio > MAX_ZIP_COMPRESSION_RATIO:
        raise ValueError("ZIP has an unsafe overall compression ratio")
    return members


def unzip_to_temp(file_obj) -> Path:
    upload_size = _archive_size(file_obj)
    if upload_size > MAX_ZIP_UPLOAD_SIZE:
        raise ValueError(
            f"ZIP upload is too large (maximum {MAX_ZIP_UPLOAD_SIZE} bytes)"
        )

    tmp = Path(tempfile.mkdtemp())
    root = tmp.resolve()
    try:
        with zipfile.ZipFile(file_obj) as z:
            members = _validated_members(z, root)
            extracted_size = 0
            for info in members:
                target = (root / info.filename).resolve()
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                member_size = 0
                with z.open(info) as source, target.open("wb") as destination:
                    while chunk := source.read(_COPY_CHUNK_SIZE):
                        member_size += len(chunk)
                        extracted_size += len(chunk)
                        if member_size > MAX_ZIP_MEMBER_SIZE:
                            raise ValueError(
                                f"ZIP entry {info.filename!r} exceeds its size limit"
                            )
                        if extracted_size > MAX_ZIP_TOTAL_SIZE:
                            raise ValueError("ZIP exceeds its total extraction limit")
                        destination.write(chunk)
        return tmp
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise


def scenario_root(folder: Path) -> Path:
    folder = Path(folder)
    if (folder / "config.yaml").exists():
        return folder
    for found in folder.rglob("config.yaml"):
        return found.parent
    return folder


def zip_folder(folder: Path) -> Path:
    folder = Path(folder)
    zip_path = folder.with_suffix(".zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for file in sorted(folder.rglob("*")):
            if file.is_file():
                z.write(file, file.relative_to(folder))
    return zip_path
