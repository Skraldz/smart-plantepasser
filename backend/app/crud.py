# Library Imports
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import User, Measurement, SoilReading, WateringEvent, Plant, Command, LightSettings
from app.schemas import MeasurementIn, WaterCommand, RelayCommand, PlantUpdate, PlantCreate, PlantSettings, LightSettingsResponse, SettingsResponse, LightSettingsUpdate

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


def get_plants(db: Session, sensor_module_id: int):
    plants = db.query(Plant).filter(Plant.sensor_module_id == sensor_module_id).all()
    return plants

def get_latest_soil_reading(db: Session, plant_idx: int, sensor_module_id: int):
    db_plant = db.query(Plant).filter(
        Plant.plant_idx == plant_idx,
        Plant.sensor_module_id == sensor_module_id
    ).first()
    if db_plant is None:
        return None
    return db.query(SoilReading).filter(SoilReading.plant_id == db_plant.id).order_by(SoilReading.id.desc()).first()


def get_latest_measurement(db: Session, sensor_module_id: int):
    latest_measurement = db.query(Measurement).filter(Measurement.sensor_module_id == sensor_module_id).order_by(Measurement.id.desc()).first()
    return latest_measurement

def get_latest_watering(db: Session, plant_idx:int, sensor_module_id:int):
    db_plant = db.query(Plant).filter(
        Plant.plant_idx == plant_idx,
        Plant.sensor_module_id == sensor_module_id
    ).first()
    if db_plant is None:
        return None
    return db.query(WateringEvent).filter(WateringEvent.plant_id == db_plant.id).order_by(WateringEvent.id.desc()).first()

def create_plant(db: Session, sensor_module_id: int, data: PlantCreate):
    new_plant = Plant(
        sensor_module_id = sensor_module_id,
        plant_idx = data.plant_idx,
        name = data.name,
        type = data.type,
        location = data.location,
        note = data.note,
        soil_threshold = data.soil_threshold,
        pump_pwm = data.pump_pwm,
        watering_duration_sec = data.watering_duration_sec
    )
    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)
    return new_plant

def update_plant(db: Session, plant_idx: int, sensor_module_id: int, data: PlantUpdate):
    plant = db.query(Plant).filter(
        Plant.plant_idx == plant_idx,
        Plant.sensor_module_id == sensor_module_id
    ).first()
    if plant is None:
        return None
    if data.name is not None:
        plant.name = data.name
    if data.type is not None:
        plant.type = data.type
    if data.location is not None:
        plant.location = data.location
    if data.note is not None:
        plant.note = data.note
    if data.soil_threshold is not None:
        plant.soil_threshold = data.soil_threshold
    if data.pump_pwm is not None:
        plant.pump_pwm = data.pump_pwm
    if data.watering_duration_sec is not None:
        plant.watering_duration_sec = data.watering_duration_sec
    db.commit()
    db.refresh(plant)
    return plant

def delete_plant(db: Session, plant_idx: int, sensor_module_id: int):
    plant = db.query(Plant).filter(
        Plant.plant_idx == plant_idx,
        Plant.sensor_module_id == sensor_module_id
    ).first()
    if plant is None:
        return None
    db.delete(plant)
    db.commit()
    return {"status": "ok"}

def get_settings(db: Session, sensor_module_id: int):
    plants = get_plants(db, sensor_module_id)
    light = db.query(LightSettings).filter(LightSettings.module_id == sensor_module_id).first()
    if light is None:
        return None
    plant_settings = [
        PlantSettings(
            plant_idx=p.plant_idx,
            soil_threshold=p.soil_threshold,
            pump_pwm=p.pump_pwm,
            watering_duration_sec=p.watering_duration_sec
        ) for p in plants
    ]
    light_response = LightSettingsResponse(
        lux_threshold_low=light.lux_threshold_low,
        lux_threshold_high=light.lux_threshold_high,
        light_period=light.light_period,
        light_start_hour=light.light_start_hour,
        enabled=light.enabled
    )

    return SettingsResponse(plants=plant_settings, light=light_response)

def update_light_settings(db: Session, sensor_module_id: int, data: LightSettingsUpdate):
    light = db.query(LightSettings).filter(LightSettings.module_id == sensor_module_id).first()
    if light is None:
        return None
    if data.lux_threshold_low is not None:
        light.lux_threshold_low = data.lux_threshold_low
    if data.lux_threshold_high is not None:
        light.lux_threshold_high = data.lux_threshold_high
    if data.light_period is not None:
        light.light_period = data.light_period
    if data.light_start_hour is not None:
        light.light_start_hour = data.light_start_hour
    if data.enabled is not None:
        light.enabled = data.enabled
    db.commit()
    db.refresh(light)
    return light