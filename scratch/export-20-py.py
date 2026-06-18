import sqlite3
import json

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

try:
    db = sqlite3.connect('D:/CDC/webcq/payload-data.db')
    db.row_factory = dict_factory
    
    # Fetch 20 articles
    articles = db.execute("SELECT * FROM articles LIMIT 20").fetchall()
    
    with open('scratch/export-20-articles-raw.json', 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
        
    print(f"Exported {len(articles)} articles!")
except Exception as e:
    print("Error:", e)
