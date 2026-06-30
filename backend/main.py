from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import Staff, Tenant
from .routers import auth, comments, history, notifications, requests, uploads, users
from .security import hash_password


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(requests.router)
app.include_router(comments.router)
app.include_router(history.router)
app.include_router(uploads.router)
app.include_router(notifications.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Staff).filter(Staff.email == "staff@maintainhub.com").first()
        if not existing:
            db.add(
                Staff(
                    name="MaintainHub Admin",
                    email="staff@maintainhub.com",
                    password=hash_password("Admin@123"),
                    department="Operations",
                )
            )
            db.commit()
        tenant = db.query(Tenant).filter(Tenant.email == "tenant@example.com").first()
        if not tenant:
            db.add(
                Tenant(
                    name="Demo Tenant",
                    email="tenant@example.com",
                    password=hash_password("Tenant@123"),
                    phone="+1 555 0100",
                )
            )
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}
