import os

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

router = APIRouter()

_openai_base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com").rstrip("/")
if _openai_base_url.endswith("/v1"):
    _openai_base_url = _openai_base_url[:-3]
OPENAI_UPSTREAM_BASE_URL = _openai_base_url
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
GRAFANA_UPSTREAM_BASE_URL = os.getenv(
    "GRAFANA_BASE_URL", "http://localhost:3000"
).rstrip("/")

HOP_BY_HOP_HEADERS = {
    "host",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "content-length",
    "content-encoding",
}


def _filter_request_headers(headers: httpx.Headers) -> dict[str, str]:
    return {k: v for k, v in headers.items() if k.lower() not in HOP_BY_HOP_HEADERS}


def _filter_response_headers(headers: httpx.Headers) -> dict[str, str]:
    # Preserve content-type/charset, drop hop-by-hop and length headers.
    return {
        k: v
        for k, v in headers.items()
        if k.lower() not in HOP_BY_HOP_HEADERS and k.lower() != "content-length"
    }


def _openai_headers(headers: httpx.Headers) -> dict[str, str]:
    filtered = _filter_request_headers(headers)
    filtered.pop("accept-encoding", None)
    filtered["authorization"] = f"Bearer {OPENAI_API_KEY}"
    return filtered


async def _proxy_stream(
    request: Request,
    *,
    upstream_base: str,
    upstream_path: str,
    request_headers: dict[str, str] | None = None,
) -> StreamingResponse:
    query = request.url.query
    upstream_url = f"{upstream_base}/{upstream_path.lstrip('/')}"
    if query:
        upstream_url = f"{upstream_url}?{query}"

    headers = request_headers or _filter_request_headers(request.headers)
    body = await request.body()

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            request_obj = client.build_request(
                request.method,
                upstream_url,
                headers=headers,
                content=body,
            )
            resp = await client.send(request_obj, stream=True, follow_redirects=True)
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Upstream not reachable at {upstream_base}: {e}",
            ) from e

        response_headers = _filter_response_headers(resp.headers)
        media_type = resp.headers.get("content-type")
        status_code = resp.status_code

        if status_code >= 400:
            text = await resp.aread()
            await resp.aclose()
            detail = text.decode("utf-8", errors="replace").strip()
            raise HTTPException(
                status_code=status_code,
                detail=detail or f"Request failed ({status_code})",
            )

        async def iter_bytes():
            try:
                async for chunk in resp.aiter_bytes():
                    yield chunk
            finally:
                await resp.aclose()

        return StreamingResponse(
            iter_bytes(),
            status_code=status_code,
            media_type=media_type,
            headers=response_headers,
        )


@router.api_route("/rag/{path:path}", methods=["GET", "POST", "OPTIONS"])
async def openai_proxy(path: str, request: Request) -> StreamingResponse:
    headers = _openai_headers(request.headers)
    return await _proxy_stream(
        request,
        upstream_base=OPENAI_UPSTREAM_BASE_URL,
        upstream_path=path,
        request_headers=headers,
    )


@router.api_route(
    "/grafana/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def grafana_proxy(path: str, request: Request) -> StreamingResponse:
    return await _proxy_stream(
        request,
        upstream_base=GRAFANA_UPSTREAM_BASE_URL,
        upstream_path=path,
    )


@router.api_route(
    "/grafana", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
)
async def grafana_proxy_root(request: Request) -> StreamingResponse:
    return await _proxy_stream(
        request,
        upstream_base=GRAFANA_UPSTREAM_BASE_URL,
        upstream_path="",
    )
