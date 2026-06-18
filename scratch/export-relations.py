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
    
    # 1. Fetch 20 articles
    articles = db.execute("SELECT * FROM articles LIMIT 20").fetchall()
    
    # 2. Extract referenced categories and media
    category_ids = {a['category_id'] for a in articles if a.get('category_id')}
    media_ids = {a['image_id'] for a in articles if a.get('image_id')}
    
    categories = []
    if category_ids:
        placeholders = ','.join(['?'] * len(category_ids))
        categories = db.execute(f"SELECT * FROM categories WHERE id IN ({placeholders})", list(category_ids)).fetchall()
        
    media = []
    if media_ids:
        placeholders = ','.join(['?'] * len(media_ids))
        media = db.execute(f"SELECT * FROM media WHERE id IN ({placeholders})", list(media_ids)).fetchall()
        
    export_data = {
        'articles': articles,
        'categories': categories,
        'media': media
    }
    
    with open('scratch/export-test-20.json', 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
        
    print(f"Exported {len(articles)} articles, {len(categories)} categories, {len(media)} media!")
except Exception as e:
    print("Error:", e)
