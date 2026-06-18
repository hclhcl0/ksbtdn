import sqlite3
import json

db = sqlite3.connect('D:/CDC/webcq/payload-data.db')
cursor = db.cursor()
cursor.execute("SELECT id, title, content FROM articles WHERE content LIKE '%13 hành vi%'")
rows = cursor.fetchall()
for r in rows:
    content = json.loads(r[2])
    with open('scratch/found-text.json', 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
