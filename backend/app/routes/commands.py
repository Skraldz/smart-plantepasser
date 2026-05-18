from fastapi import status, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import WaterCommand, RelayCommand
from app.crud import save_command, get_pending_commands
from app.auth import get_current_user
from app.models import Modules, User
import os

DEVICE_SECRET = os.environ["DEVICE_SECRET"]

router = APIRouter(prefix="/api/v1", tags=["commands"])


@router.post("/commands/water")
def activate_water(
    body: WaterCommand,
    db: Session = Depends(get_db),
    get_current_user: User = Depends(get_current_user)
):
    watering_module = db.query(Modules).filter(Modules.module_type == "watering").first()
    if not watering_module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watering module not found")
    incoming_command = save_command(db, module_id=watering_module.id, command_type="water", plant_idx=body.plant_idx, duration_sec=body.duration_sec)
    return {"status": "ok", "command_id": incoming_command.id}


@router.post("/commands/relay")
def activate_relay(
    body: RelayCommand,
    db: Session = Depends(get_db),
    get_current_user: User = Depends(get_current_user)
):
    relay_module = db.query(Modules).filter(Modules.module_type == "relay").first()
    if not relay_module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relay module not found")
    incoming_command = save_command(db, module_id=relay_module.id, command_type="relay", relay_action=body.relay_action)
    return {"status": "ok", "command_id": incoming_command.id}

@router.get("/commands/pending")
def show_pending_commands(
    db: Session = Depends(get_db),
    x_device_secret: str = Header(...)
):
    if x_device_secret != DEVICE_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Device secret does not match")
    show_pending = get_pending_commands(db)
    return show_pending
