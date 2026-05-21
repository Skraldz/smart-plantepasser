from fastapi import HTTPException, status, APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.crud import get_user_by_email, create_user
from app.auth import hash_password, create_token, verify_password
import os

router = APIRouter(prefix="/auth", tags=["auth"])

DEVICE_SECRET = os.environ["DEVICE_SECRET"]



# This function registers a user via the RegisterRequest Pydantic Schema and opens the database via Depends(get_db) from database.py
# It will take the email from the RegisterRequest body and run the get_user_by_email function to see if a user already exists in the db with the same email
# If the e-mail is already registered, it will raise a HTTP 400 status code
# If the e-mail isn't registered, it runs the create_user function, hash the entered password and put it in the User table
@router.post("/register")
def register(body: RegisterRequest,
    x_device_secret: str = Header(...),
    db: Session = Depends(get_db)
):
    if x_device_secret != DEVICE_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized product key")
    existing_user = get_user_by_email(db, body.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user has already been registered with this e-mail.")
    create_user(db, body.email, hash_password(body.password))
    return {"status": "ok"}


# This function lets a user login via the LoginRequest Pydantic Schema and opens the db via Depends(get_db)
# First it takes the email from the LoginRequest body and checks if it matches an existing user in the db, if there is not match it gives a 401 error
# If the email matches a db entry, it calls the verify_password function and matches the LoginRequest body.password with existing_user.hash_password
# If the hashed passwords do not match, it gives the 401 error, if it matches, it creates an acces token and returns it to the user via TokenResponse 
@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, body.email)
    if not existing_user or not verify_password(body.password, existing_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="The e-mail or password is incorrect")
    token = create_token(existing_user.id)
    return TokenResponse (access_token=token)

