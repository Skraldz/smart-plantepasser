from fastapi import HTTPException, status, APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.crud import get_user_by_email, create_user
from app.auth import hash_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, body.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user has already been registered with this e-mail.")
    create_user(db, body.email, hash_password(body.password))
    return {"status": "ok"}