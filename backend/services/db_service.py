import sqlite3

def get_patient_data(patient_name):
    conn = sqlite3.connect("medical_data.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, age, gender FROM patients WHERE name=?", (patient_name.upper(),))
    patient = cursor.fetchone()

    if not patient:
        return None

    patient_id = patient[0]

    cursor.execute("""
        SELECT test_name, test_value, unit,reference_range, test_date 
        FROM medical_tests
        WHERE patient_id=?
        ORDER BY test_date
    """, (patient_id,))

    tests = cursor.fetchall()
    conn.close()

    return {
        "patient": {
            "id": patient_id,
            "name": patient_name,
            "age": patient[1],
            "gender": patient[2]
        },
        "tests": tests
    }