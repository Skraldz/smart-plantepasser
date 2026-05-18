# Library Imports
from sqlalchemy import create_engine                                 # imports the create_engine function from sqlalchemy
import os                                                            # A library that gives access to the OS environment variables (the .env file)
from sqlalchemy.orm import sessionmaker, DeclarativeBase             # imports the sessionmaker function

DATABASE_URL = os.environ["DATABASE_URL"]           # Gets the database url from the .env file

# This creates the engine for the db, so it can interact with main.py
# pool_recycle tells SQL alchemy to reuse connections for a max of one hour, so it doesnt have an open connection that MariaDB already closed
# pool_pre_ping sends a ping to before connecting, to guarantee that the connection is alive before sending data
engine = create_engine(DATABASE_URL, pool_recycle=3600, pool_pre_ping=True)

# Makes a session and binds it to the engine variable, so it can interact with the tables
# autocommit=False makes sure that changes wont be saved automatically, but has to be done with db.commit()
# autoflush=False makes sure that changes wont be sent to the db before it is ready
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# The main interaction between the database and python.
# Declarative Base passes on arguments to the tables in the DB
class Base(DeclarativeBase):
    pass

# A generator function that yields a database session and closes it afterwards
# This prevents having to manually open and close the db in each function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()