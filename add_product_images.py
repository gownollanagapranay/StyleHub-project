
from sqlalchemy import inspect, text
from app.database import engine

inspector = inspect(engine)
columns = [column["name"] for column in inspector.get_columns("products")]

if "image_url" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE products ADD COLUMN image_url VARCHAR")
        )
    print("image_url column added successfully.")
else:
    print("image_url column already exists.")