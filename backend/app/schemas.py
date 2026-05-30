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
    duration_sec: int = 5
    pump_pwm: int = 100

class RelayCommand(BaseModel):
    relay_action: int

class PlantCreate(BaseModel):
    plant_idx: int
    name: str
    type: Optional[str] = None
    location: Optional[str] = None
    note: Optional[str] = None
    soil_threshold: Optional[int] = None
    pump_pwm: Optional[int] = None
    watering_duration_sec: Optional[int] = None

class PlantUpdate(BaseModel):
    plant_idx: Optional[int] = None 
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    note: Optional[str] = None
    soil_threshold: Optional[int] = None
    pump_pwm: Optional[int] = None
    watering_duration_sec: Optional[int] = None

class LightSettingsUpdate(BaseModel):
    lux_threshold_low: Optional[int] = None
    lux_threshold_high: Optional[int] = None
    light_period: Optional[int] = None
    light_start_hour: Optional[int] = None
    enabled: Optional[int] = None
    relay_state: Optional[int] = None

class PlantSettings(BaseModel):
    plant_idx: int
    soil_threshold: Optional[int] = 30
    pump_pwm: Optional[int] = 100
    watering_duration_sec: Optional[int] = 5
    
class LightSettingsResponse(BaseModel):
    lux_threshold_low: int
    lux_threshold_high: int
    light_period: int
    light_start_hour: int
    enabled: int
    relay_state: int = 0

class SettingsResponse(BaseModel):
    plants: List[PlantSettings]
    light: LightSettingsResponse

class CommandResponse(BaseModel):
    command_type: str
    plant_idx: Optional[int] = None
    duration_sec: Optional[int] = None
    relay_action: Optional[int] = None
    pump_pwm: Optional[int] = None
    duration_min: Optional[int] = None

    class Config:
        from_attributes = True