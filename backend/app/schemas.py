from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# The schemas (Pydantic Schemas) are the datastructures FastAPI uses to validate what comes in and out of the DB.
# These are seperate from SQLAlchemy models - the models describe the database, the schemas describe the API


# Auth schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Measurements schemas
class PlantReading(BaseModel):
    plant_id: int
    soil_moisture: int

class WateringEntry(BaseModel):
    plant_id: int
    duration_sec: int

class MeasurementIn(BaseModel):
    sensor_module_id: int
    timestamp: datetime
    temperature: Optional[float]
    humidity: Optional[float]
    lux: Optional[int]
    plants: List[PlantReading] = []
    watering_events: List[WateringEntry] = []
    lamp_on: bool = False
