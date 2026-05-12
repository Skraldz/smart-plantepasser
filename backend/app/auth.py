# Library Imports
import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Defines which cryptation hash-algorithm to use
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 


# This function is used when a user registers
# It hashes the password before saving it in the database
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# This function is used when a user logs in
# It hashes the entered password and verifies if it matches the hashed pw in the db and returns a bool
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# JWT (JSON Web Token)
# Manages who is logged in. 
# When a user logs in a JWT is generated and sent back to the user
# Frontend saves this token and sends it on all future requests
# This means that the backend knows who is requesting without having to check the database each time

SECRET_KEY = os.environ["SECRET_KEY"]                                   # Picks the secret key from the .env file
ALGORITHM = "HS256"                                                     # Defines which algorithm is used 
TOKEN_EXPIRE_DAYS = 7                                                   # Defines how many days a token is valid


# This function does 3 things:
# 1 - calculates when the token will expire
# 2 - builds the payload we put into the token (user ID and token expiry)
# 3 - returns the generated token with the header and payload, signs with the secret key and encrypts it in the chosen algorithm
def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)