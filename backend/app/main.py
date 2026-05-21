from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware              # Allows cross-origin source sharing - Browsers block requests between different origins by default
from app.database import Base, engine
import app.models
from app.routes.measurements import router as measurements_router
from app.routes.auth import router as auth_router
from app.routes.commands import router as commands_router


app = FastAPI()

Base.metadata.create_all(bind=engine)                            # Tells SQLalchemy to create all defined tables if they dont exist already

app.include_router(auth_router)
app.include_router(measurements_router)
app.include_router(commands_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[                                              # Allows requests to come from these IP
        "http://localhost:5173",                                 # For local requests during frontend development
        "https://plantcloud.mandingo.dk",
        "https://plantapi.mandingo.dk",                        # For requests when in production
    ],
    allow_methods=["*"],                                         # Allows all HTTP methods
    allow_headers=["*"],                                         # Allows all headers
)

@app.get("/")                                                    # Function to show if the backend is connectable
def root():
        return {"status": "ok"}