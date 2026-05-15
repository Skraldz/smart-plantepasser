from fastapi import status, APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import save_measurement, get_measurements
from app.schemas import MeasurementIn
from app.auth import get_current_user
from app.models import User
import os


router = APIRouter(prefix="/api/v1", tags=["measurements"])
DEVICE_SECRET = os.environ["DEVICE_SECRET"]

# This function allows measurements to be sent from the hub directly to the backend and adds them to the db
# The body is MeasurementIn, and it requires a header with x_device_secret (shown via "...")
# It takes DEVICE_SECRET from the .env file and checks if it matches with the x_device_secret in the header
# if it doesn't match a HTTP401 status comes up. If it matches, it calls the save_measurement function from crud.py
# When the measurement is saved in the DB it returns status: ok and the incoming_measurement ID
@router.post("/measurements")
def receive_measurement(
    body: MeasurementIn,
    x_device_secret: str = Header(...),
    db: Session = Depends(get_db)
):
    if x_device_secret != DEVICE_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Device secret does not match")
    incoming_measurement = save_measurement(db, body)
    return {"status": "ok", "measurement_id": incoming_measurement.id}



# This function lets the frontend get measurements in a specific timeframe via get_measurements in crud.py
# It takes 3 parameters - sensor_module_id, from_hours and to_hours, each with a default if no parameters are sent
# It also validates the user via get_current_user in app/auth.py to check if the JWT is missing or invalid
@router.get("/measurements")
def show_measurement(
    sensor_module_id: int = 1,
    from_hours: int = 24,
    to_hours: int = 0,
    db: Session = Depends(get_db),
    get_current_user: User = Depends(get_current_user)
):
    return get_measurements(db, sensor_module_id=sensor_module_id, from_hours=from_hours, to_hours=to_hours)