# Library Imports
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import User, Measurement, SoilReading, WateringEvent
from app.schemas import MeasurementIn

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
        new_soil_reading = SoilReading(
            measurement_id = new_measurement.id,
            plant_id = plant.plant_id,
            soil_moisture = plant.soil_moisture
        )
        db.add(new_soil_reading)

    for event in data.watering_events:    
        new_watering_event = WateringEvent(
            plant_id = plant.plant_id,
            duration_sec = plant.duration_sec
        )
        db.add(new_watering_event)
    
    db.commit()
    db.refresh(new_measurement)
    return new_measurement