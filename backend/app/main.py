from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import auth, chat
from .websockets import router as ws_router

app = FastAPI(title=settings.PROJECT_NAME)

# CORS (Keep existing configuration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(ws_router.router, tags=["websockets"])

@app.get("/")
async def root():
    return {"message": "Welcome to Realtime Chat API"}
