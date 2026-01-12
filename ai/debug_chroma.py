import sys
import os

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

from app.vectorstore.chroma import collection

try:
    count = collection.count()
    print(f"Collection count: {count}")
    
    if count > 0:
        peek = collection.peek(limit=5)
        print("Peek:", peek)
    else:
        print("Collection is empty.")
except Exception as e:
    print(f"Error accessing collection: {e}")
