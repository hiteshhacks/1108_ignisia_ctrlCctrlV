from fastapi import APIRouter, HTTPException
from database import get_all_tests_for_patient

router = APIRouter()

@router.get("/patient/{patient_name}/chart-data")
async def get_patient_chart_data(patient_name: str):
    """
    Fetches all medical tests for a specific patient and formats them into a 
    clean JSON structure perfectly optimized for frontend charting libraries (like Chart.js/Recharts).
    """
    tests = get_all_tests_for_patient(patient_name)
    
    if not tests:
        raise HTTPException(status_code=404, detail=f"No data found for patient: {patient_name}")
    
    # Group data by test name to make charting super easy
    chart_data = {}
    for t in tests:
        t_name = t.get("test_name", "Unknown Test")
        
        # Attempt to safely convert the test_value into a float for charting
        raw_val = t.get("test_value", "")
        try:
            # Strip out any random text/spaces and keep digits and decimals
            clean_val = "".join(c for c in raw_val if c.isdigit() or c == '.')
            num_val = float(clean_val) if clean_val else 0.0
        except ValueError:
            num_val = raw_val # Fallback to string if completely un-parseable
            
        if t_name not in chart_data:
            chart_data[t_name] = {
                "unit": t.get("unit", ""),
                "reference_range": t.get("reference_range", ""),
                "data": []
            }
        
        # Append the specific data point (date + numerical value)
        chart_data[t_name]["data"].append({
            "date": t.get("test_date", "Unknown Date"),
            "value": num_val,
            "raw_value_string": raw_val
        })
        
    return {
        "success": True,
        "patient": patient_name.upper(),
        "chart_data": chart_data,
        "raw_tests": tests
    }
