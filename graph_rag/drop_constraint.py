from app.core.neo4j import get_driver

driver = get_driver()

def drop_old_constraint(tx):
    try:
        tx.run("DROP CONSTRAINT keyword_name_unique IF EXISTS")
        print("Dropped old constraint keyword_name_unique")
    except Exception as e:
        print(f"Error dropping constraint: {e}")

with driver.session() as session:
    session.execute_write(drop_old_constraint)

driver.close()
