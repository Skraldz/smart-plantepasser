from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, SmallInteger, Float
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255))
    password = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

class Hub(Base):
    __tablename__ = "hubs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))

class Modules(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True)
    hub_id = Column(Integer, ForeignKey("hubs.id"))
    sensor_module_id = Column(Integer)
    name = Column(String(255))
    module_type = Column(String(255))

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True)
    sensor_module_id = Column(Integer, ForeignKey("modules.id"))
    plant_idx = Column(Integer)
    name = Column(String(255))

class Measurement(Base):
    __tablename__ = "measurements"
    id = Column(Integer, primary_key=True)
    sensor_module_id = Column(Integer, ForeignKey("modules.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    temperature = Column(Float)
    humidity = Column(Float)
    lux = Column(Integer)
    lamp_on = Column(SmallInteger, default=0)

class SoilReading(Base):
    __tablename__ = "soil_readings"
    id = Column(Integer, primary_key=True)
    measurement_id = Column(Integer, ForeignKey("measurements.id"))
    plant_id = Column(Integer, ForeignKey("plants.id"))
    soil_moisture = Column(Integer)

class WateringEvent(Base):
    __tablename__ = "watering_events"
    id = Column(Integer, primary_key=True)
    plant_id = Column(Integer, ForeignKey("plants.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    duration_sec = Column(Integer)
