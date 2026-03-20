import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

router = APIRouter()

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


async def _proxy_stream(
    request: Request,
    *,
    upstream_base: str,
    upstream_path: str,
) -> StreamingResponse:
    query = request.url.query
    upstream_url = f"{upstream_base}/{upstream_path.lstrip('/')}"
    if query:
        upstream_url = f"{upstream_url}?{query}"

    body = await request.body()
    headers = _filter_request_headers(request.headers)
    # Avoid transparent encoding differences when proxying streaming responses.
    headers.pop("accept-encoding", None)

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            resp = await client.request(
                request.method,
                upstream_url,
                follow_redirects=True,
                params=request.query_params,
                headers=headers,
                content=await request.body(),
            )
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Upstream not reachable at {upstream_base}: {e}",
            ) from e

        response_headers = _filter_response_headers(resp.headers)
        media_type = resp.headers.get("content-type")
        status_code = resp.status_code

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


@router.api_route("/ollama/api/tags", methods=["GET", "POST", "OPTIONS"])
async def ollama_tags_proxy(request: Request) -> StreamingResponse:
    # Tags responses are small JSON; streaming proxy is still fine and simpler.
    return await _proxy_stream(
        request,
        upstream_base="http://localhost:11434",
        upstream_path="api/tags",
    )


@router.api_route("/ollama/api/generate", methods=["POST", "OPTIONS"])
async def ollama_generate_proxy(request: Request) -> StreamingResponse:
    # Streaming must be preserved for `stream: true`.
    return await _proxy_stream(
        request,
        upstream_base="http://localhost:11434",
        upstream_path="api/generate",
    )


@router.api_route("/grafana/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def grafana_proxy(path: str, request: Request) -> StreamingResponse:
    return await _proxy_stream(
        request,
        upstream_base="http://localhost:3000",
        upstream_path=path,
    )


@router.api_route("/grafana", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def grafana_proxy_root(request: Request) -> StreamingResponse:
    return await _proxy_stream(
        request,
        upstream_base="http://localhost:3000",
        upstream_path="",
    )

