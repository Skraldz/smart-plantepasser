# Library Imports
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import User, Measurement, SoilReading, WateringEvent, Plant, Command
from app.schemas import MeasurementIn, WaterCommand, RelayCommand

# This function searches the User table for a user with the typed e-mail
# It either returns the user with a matching e-mail or None if no match was found
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

# This function creates a new user in the User table with 2 fields: email and hashed_password
def create_user(db: Session, email: str, hashed_password: str):
    new_user = User(
        email = email,
        password = hashed_password 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def save_command(db: Session, module_id: int, command_type: str, plant_idx: int = None, duration_sec: int = None, relay_action: int = None):
    new_command = Command(
        module_id = module_id,
        command_type = command_type,
        plant_idx = plant_idx,
        duration_sec = duration_sec,
        relay_action = relay_action,
        status = "pending"
    )

    db.add(new_command)
    db.commit()
    db.refresh(new_command)
    return new_command

# This function takes MeasurementIn from Schemas.py (the pydantic schemas that act with the API) and uses it as data
# This data then gets added to the database as a new measurement
# It also loops over the SoilReading and WateringEvent tables, entering data for all plants in both tables
def save_measurement(db: Session, data: MeasurementIn):
    new_measurement = Measurement(
        sensor_module_id = data.sensor_module_id,
        timestamp = data.timestamp,
        temperature = data.temperature,
        humidity = data.humidity,
        lux = data.lux,
        lamp_on = data.lamp_on
    )
    
    db.add(new_measurement)
    db.flush()                      # The database is flushed so measurements gets and ID without being committed

    for plant in data.plants:
        db_plant = db.query(Plant).filter(
            Plant.sensor_module_id == data.sensor_module_id,
            Plant.plant_idx == plant.plant_id
        ).first()

        if db_plant is None:
            continue

        new_soil_reading = SoilReading(
            measurement_id = new_measurement.id,
            plant_id = db_plant.id,
            soil_moisture = plant.soil_moisture
        )
        db.add(new_soil_reading)

    for event in data.watering_events:    
        new_watering_event = WateringEvent(
            plant_id = event.plant_id,
            duration_sec = event.duration_sec
        )
        db.add(new_watering_event)
    
    db.commit()
    db.refresh(new_measurement)
    return new_measurement


# This function gets the measurements from one specific sensor module in a given frame of time
# It works by subtracting the to and from hours from the actual time of request,
# Then it returns the measurements in ascending order from start time to finish time. 
def get_measurements(db: Session, sensor_module_id: int, from_hours: int, to_hours: int):
    measurement_from = datetime.utcnow() - timedelta(hours=from_hours)
    measurement_to = datetime.utcnow() - timedelta(hours=to_hours)
    return db.query(Measurement).filter(Measurement.timestamp >= measurement_from, Measurement.timestamp <= measurement_to).order_by(Measurement.timestamp.asc()).all()
    
def get_pending_commands(db: Session):
    pending_commands = db.query(Command).filter(Command.status == "pending").all()
    for command in pending_commands:
        command.status = "executed"
    db.commit()
    return pending_commands