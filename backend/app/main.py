from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import Base, engine
from app.api import auth, dashboard, logs, alerts, incidents, rules, threat_intel, simulations, health

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SOC Sentinel — Cybersecurity SOC Threat Detection & Analysis Platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(logs.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(rules.router, prefix=settings.API_V1_STR)
app.include_router(threat_intel.router, prefix=settings.API_V1_STR)
app.include_router(simulations.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to SOC Sentinel API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
