import sqlite3
import os

db_path = "alterego.db"

def migrate():
    if not os.path.exists(db_path):
        print("Database file not found. It will be created on startup.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Update conversations table
    print("Updating conversations table...")
    try:
        cursor.execute("ALTER TABLE conversations ADD COLUMN importance FLOAT DEFAULT 0.5")
    except sqlite3.OperationalError:
        print("Column 'importance' already exists.")
    
    try:
        cursor.execute("ALTER TABLE conversations ADD COLUMN feedback INTEGER")
    except sqlite3.OperationalError:
        print("Column 'feedback' already exists.")

    # 2. Create new tables if they don't exist
    print("Creating new tables...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            pattern TEXT,
            frequency INTEGER DEFAULT 1,
            last_triggered FLOAT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflows (
            id INTEGER PRIMARY KEY,
            goal TEXT NOT NULL,
            plan_json TEXT NOT NULL,
            success_count INTEGER DEFAULT 1
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            progress FLOAT DEFAULT 0.0,
            deadline FLOAT,
            created_at FLOAT,
            updated_at FLOAT,
            metadata_json TEXT
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Migration complete.")

if __name__ == "__main__":
    migrate()
