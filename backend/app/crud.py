# Library Imports
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import models
import schemas

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


# Work in Progress, do not use yet
def save_measurement(db: Session, data: MeasurementIn):
    new_measurement = Measurement(
        sensor_module_id = sensor_module_id,
        timestamp = timestamp,
        temperature = temperature,
        humidity = humidity,
        lux = lux,
        lamp_on = lamp_on
    )

    new_soil_reading = SoilReading(
        measurement_id = measurement_id,
        plant_id = plant_id,
        soil_moisture = soil_moisture
    )

    new_watering_event = WateringEvent(
        plant_id = plant_id,
        timestamp = timestamp,
        duration_sec = duration_sec
    )
    db.add(new_measurement, new_soil_reading, new_watering_event)
    db.commit()
    db.refresh(new_measurement, new_soil_reading, new_watering_event)
    return new_measurement, new_soil_reading, new_watering_event