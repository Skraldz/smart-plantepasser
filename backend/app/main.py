from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware              # Allows cross-origin source sharing - Browsers block requests between different origins by default
from app.database import Base, engine
import app.models



app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[                                              # Allows requests to come from these IP
        "http://localhost:5173",                                 # For local requests during frontend development
        "https://plantcloud.mandingo.dk",                        # For requests when in production
    ],
    allow_methods=["*"],                                         # Allows all HTTP methods
    allow_headers=["*"],                                         # Allows all headers
)

@app.get("/")                                                    # Function to show if the backend is connectable
def root():
        return {"status": "ok"}