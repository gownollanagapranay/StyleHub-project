from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#Sqlite database is used
DATABASE_URL = "sqlite:///./stylehub.db"

# engine is responsible for communicating with database
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False})


# database session is basically our working connection with the database.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()