from fastapi import FastAPI, HTTPException, Depends, Body , Header
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, User, Account
from schemas import UserRegister, UserLogin, Token, Payment, BalanceUpdate
from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from datetime import timedelta


DATABASE_URL = "sqlite:///../resources/dataStore.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)
app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_pwd = hash_password(user.password)
    new_user = User(username=user.username, password_hash=hashed_pwd, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # create account
    new_account = Account(user_id=new_user.id, balance=0.00)
    db.add(new_account)
    db.commit()
    return {"message": f"{user.role.capitalize()} registered successfully"}

@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(
        data={"sub": user.username, "role": db_user.role},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/balance")
def get_balance(username: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    account = db.query(Account).filter(Account.user_id == db_user.id).first()
    return {"username": db_user.username, "balance": float(account.balance)}

@app.put("/updateBalance")
def update_balance(balance_update: BalanceUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == balance_update.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    account = db.query(Account).filter(Account.user_id == db_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account.balance = balance_update.new_balance
    db.commit()


@app.post("/pay")
def pay(sender_username: str, payment: Payment, db: Session = Depends(get_db)):
    sender = db.query(User).filter(User.username == sender_username).first()
    receiver = db.query(User).filter(User.username == payment.receiver_username).first()
    if not sender or not receiver:
        raise HTTPException(status_code=404, detail="Sender or receiver not found")
    sender_account = db.query(Account).filter(Account.user_id == sender.id).first()
    receiver_account = db.query(Account).filter(Account.user_id == receiver.id).first()
    if sender_account.balance < payment.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    sender_account.balance -= payment.amount
    receiver_account.balance += payment.amount
    db.commit()
    return {"message": f"Transferred {payment.amount} from {sender.username} to {receiver.username}"}
