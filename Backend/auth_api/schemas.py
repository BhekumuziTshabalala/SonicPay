from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    password: str
    role: str  # "user" or "merchant"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Payment(BaseModel):
    receiver_username: str
    amount: float

class BalanceUpdate(BaseModel):
    username: str
    amount: float
