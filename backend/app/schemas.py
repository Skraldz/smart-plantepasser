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

class WaterCommand(BaseModel):
    plant_idx: int
    duration_sec: int

class RelayCommand(BaseModel):
    relay_action: int

class PlantCreate(BaseModel):
    plant_idx: int
    name: str
    type: Optional[str]
    location: Optional[str]
    note: Optional[str]
    soil_threshold: Optional[int]
    pump_pwm: Optional[int]
    watering_duration_sec: Optional[int]

class PlantUpdate(BaseModel):
    plant_idx: Optional[int]
    name: Optional[str]
    type: Optional[str]
    location: Optional[str]
    note: Optional[str]
    soil_threshold: Optional[int]
    pump_pwm: Optional[int]
    watering_duration_sec: Optional[int]

class LightSettingsUpdate(BaseModel):
    lux_threshold_low: Optional[int]
    lux_threshold_high: Optional[int]
    light_period: Optional[int]
    light_start_hour: Optional[int]
    enabled: Optional[int]

class PlantSettings(BaseModel):
    plant_idx: int
    soil_threshold: int
    pump_pwm: int
    watering_duration_sec: int
    
class LightSettingsResponse(BaseModel):
    lux_threshold_low: int
    lux_threshold_high: int
    light_period: int
    light_start_hour: int
    enabled: int

class SettingsResponse(BaseModel):
    plants: List[PlantSettings]
    light: LightSettingsResponse