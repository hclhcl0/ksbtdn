import sqlite3

try:
    db = sqlite3.connect('D:/CDC/webcq/payload-data.db')
    tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    print("Tables:", [t[0] for t in tables])
    
    for t in ['articles', 'media']:
        if any(table[0] == t for table in tables):
            count = db.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
            print(f"{t} count: {count}")
        else:
            print(f"{t} table not found.")
except Exception as e:
    print("Error:", e)
