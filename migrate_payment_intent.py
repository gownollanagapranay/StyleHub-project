
import sqlite3

DATABASE_PATH = "stylehub.db"

connection = sqlite3.connect(DATABASE_PATH)

try:
    cursor = connection.cursor()

    columns = [
        row[1]
        for row in cursor.execute(
            "PRAGMA table_info(orders)"
        ).fetchall()
    ]

    if "payment_intent_id" not in columns:
        cursor.execute(
            "ALTER TABLE orders ADD COLUMN payment_intent_id VARCHAR"
        )
        print("Added payment_intent_id column.")
    else:
        print("payment_intent_id column already exists.")

    cursor.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS
        ux_orders_payment_intent_id
        ON orders(payment_intent_id)
    """)

    connection.commit()
    print("Database migration completed successfully.")

except Exception:
    connection.rollback()
    raise

finally:
    connection.close()
