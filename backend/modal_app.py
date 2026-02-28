import modal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = modal.App("campuscoin")

image = (
    modal.Image.debian_slim()
    .pip_install(
        "fastapi",
        "uvicorn",
        "google-generativeai",
        "httpx",
        "pydantic>=2.0",
        "python-multipart",
    )
)


def create_app() -> FastAPI:
    from services.runway import router as runway_router
    from services.gemini import router as gemini_router
    from services.nessie import router as nessie_router
    from services.supermemory import router as supermemory_router
    from services.profile import router as profile_router

    fastapi_app = FastAPI(title="CampusCoin API", version="1.0.0")

    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    fastapi_app.include_router(runway_router, prefix="/api/runway")
    fastapi_app.include_router(gemini_router, prefix="/api/ai")
    fastapi_app.include_router(nessie_router, prefix="/api/nessie")
    fastapi_app.include_router(supermemory_router, prefix="/api/memory")
    fastapi_app.include_router(profile_router, prefix="/api/profile")

    @fastapi_app.get("/api/health")
    async def health():
        return {"status": "ok"}

    return fastapi_app


@app.function(
    image=image,
    secrets=[modal.Secret.from_name("campuscoin-secrets")],
)
@modal.asgi_app()
def fastapi_app():
    return create_app()
