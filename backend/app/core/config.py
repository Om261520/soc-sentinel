import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SOC Sentinel"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "soc_sentinel_super_secret_jwt_key_2026_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./soc_sentinel.db")
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
