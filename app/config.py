from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    WHATSAPP_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str
    WHATSAPP_BUSINESS_ACCOUNT_ID: str
    VERIFY_TOKEN: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
