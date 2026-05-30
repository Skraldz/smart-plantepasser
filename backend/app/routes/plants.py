from fastapi import status, APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import create_plant, update_plant, delete_plant, get_settings, update_light_settings
from app.schemas import PlantCreate, PlantUpdate, LightSettingsUpdate, PlantSettings, LightSettingsResponse, SettingsResponse 
from app.auth import get_current_user
from app.models import User, LightSettings
import os

router = APIRouter(prefix="/api/v1", tags=["plants"])

DEVICE_SECRET = os.environ["DEVICE_SECRET"]

@router.post("/plants")
def create_plant_command(
    body: PlantCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    sensor_module_id: int = 1
):
    incoming_create_plant = create_plant(db, sensor_module_id, body)
    if incoming_create_plant is None:
        raise HTTPException(status_code=409, detail="A plant with this plant_idx already exists")
    return {"status": "ok", "plant_id": incoming_create_plant.id}

@router.put("/plants/{plant_idx}")
def update_plant_command(
    plant_idx: int,
    body: PlantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    sensor_module_id: int = 1
    
):
    incoming_plant_update = update_plant(db, plant_idx, sensor_module_id, body)
    return {"status": "ok", "plant_id": incoming_plant_update.id}

@router.delete("/plants/{plant_idx}")
def delete_plant_command(
    plant_idx: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    sensor_module_id: int = 1
):
    incoming_plant_delete = delete_plant(db, plant_idx, sensor_module_id)
    if incoming_plant_delete is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return {"status": "ok"}

@router.get("/settings")
def get_settings_command(
    db: Session = Depends(get_db),
    x_device_secret: str = Header(...),
    sensor_module_id: int = 1
):
    if x_device_secret != DEVICE_SECRET:
        raise HTTPException(status_code=401, detail="Device Secret does not match")
    settings = get_settings(db, sensor_module_id)
    if settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@router.put("/light_settings")
def update_light_settings_command(
    body: LightSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    sensor_module_id: int = 3
):
    incoming_light_update = update_light_settings(db, sensor_module_id, body)
    if incoming_light_update is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return incoming_light_update

@router.get("/light_settings")
def get_light_settings_command(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    sensor_module_id: int = 3
):
    light = db.query(LightSettings).filter(LightSettings.module_id == sensor_module_id).first()
    if light is None:
        raise HTTPException(status_code=404, detail="Light settings not found")
    return light