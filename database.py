import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_connection():
    """
    Create and return a connection to the database based on environment variables
    """
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_name = os.environ.get('DB_NAME', 'postgres')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', '12434')
    db_port = os.environ.get('DB_PORT', '5432')
    
    connection = psycopg2.connect(
        host=db_host,
        database=db_name,
        user=db_user,
        password=db_password,
        port=db_port
    )
    
    return connection 