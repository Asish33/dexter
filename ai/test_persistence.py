import chromadb
import os
import shutil
import sys

# Test Path
TEST_DB_PATH = "./test_chroma_db"

def test_persistence():
    if os.path.exists(TEST_DB_PATH):
        shutil.rmtree(TEST_DB_PATH)

    print(f"Testing with chromadb version: {chromadb.__version__}")

    # 1. Initialize 'Client' with settings (old way / potential issue)
    print("Initializing Client 1...")
    try:
        # Mimicking current implementation options
        client1 = chromadb.Client(
            chromadb.config.Settings(
                persist_directory=TEST_DB_PATH,
                is_persistent=True # Trying to force it if supported
            )
        )
    except Exception as e:
        # Fallback to how it is in the code
        print(f"Client init failed with is_persistent=True: {e}")
        try:
             client1 = chromadb.Client(
                chromadb.config.Settings(
                    persist_directory=TEST_DB_PATH
                )
            )
        except Exception as e2:
             # Just default client
             print(f"Client init failed with settings: {e2}")
             client1 = chromadb.Client()

    col1 = client1.get_or_create_collection("test_col")
    col1.add(ids=["1"], documents=["test"])
    print("Added document '1' to Client 1")

    # 2. Check if data persisted
    print("Initializing Client 2...")
    # Re-create client
    try:
         client2 = chromadb.Client(
            chromadb.config.Settings(
                persist_directory=TEST_DB_PATH
            )
        )
    except:
        client2 = chromadb.Client()

    col2 = client2.get_or_create_collection("test_col")
    count = col2.count()
    print(f"Client 2 count: {count}")

    if count == 0:
        print("FAIL: Data did not persist with chromadb.Client()")
    else:
        print("SUCCESS: Data persisted with chromadb.Client()")
    
    # Clean up
    if os.path.exists(TEST_DB_PATH):
        shutil.rmtree(TEST_DB_PATH)

if __name__ == "__main__":
    test_persistence()
