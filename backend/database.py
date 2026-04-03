import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "medical_data.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create Patients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            age TEXT,
            gender TEXT
        )
    ''')
    
    # Create Medical Tests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS medical_tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            test_name TEXT,
            test_value TEXT,
            unit TEXT,
            reference_range TEXT,
            test_date TEXT,
            lab_name TEXT,
            doctor_name TEXT,
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def save_medical_data(parsed_data: dict):
    """
    Saves extracted medical JSON to the SQLite db.
    If patient already exists (by name), tests are appended.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    patient_info = parsed_data.get("patient", {})
    
    # Extract patient identity. Default if missing to gracefully handle bad LLM responses
    name = str(patient_info.get("name", "Unknown")).strip().upper()
    age = str(patient_info.get("age", ""))
    gender = str(patient_info.get("gender", ""))
    
    # 1. Lookup or create patient
    cursor.execute("SELECT id FROM patients WHERE name = ?", (name,))
    row = cursor.fetchone()
    
    if row:
        patient_id = row[0]
        # Option: Update age/gender if it was blank before
    else:
        cursor.execute("INSERT INTO patients (name, age, gender) VALUES (?, ?, ?)", (name, age, gender))
        patient_id = cursor.lastrowid
        
    # 2. Insert extracted tests
    tests = parsed_data.get("tests", [])
    lab_name = parsed_data.get("lab_name", "")
    doctor_name = parsed_data.get("doctor_name", "")
    
    for test in tests:
        cursor.execute('''
            INSERT INTO medical_tests (
                patient_id, test_name, test_value, unit, reference_range, test_date, lab_name, doctor_name
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            patient_id,
            str(test.get("name", "")),
            str(test.get("value", "")),
            str(test.get("unit", "")),
            str(test.get("reference_range", "")),
            str(test.get("date", "")),
            lab_name,
            doctor_name
        ))
        
    conn.commit()
    conn.close()

def get_all_tests_for_patient(name: str):
    """Returns all medical tests for a patient across all uploads"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM patients WHERE name = ?", (name.strip().upper(),))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return []
        
    patient_id = row[0]
    cursor.execute('''
        SELECT test_name, test_value, unit, reference_range, test_date, lab_name, doctor_name 
        FROM medical_tests 
        WHERE patient_id = ?
    ''', (patient_id,))
    
    columns = [desc[0] for desc in cursor.description]
    results = [dict(zip(columns, r)) for r in cursor.fetchall()]
    
    conn.close()
    return results
