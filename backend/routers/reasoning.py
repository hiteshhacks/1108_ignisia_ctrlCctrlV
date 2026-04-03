from fastapi import APIRouter, HTTPException
import json
from models.schemas import ReasoningRequest, ReasoningResponse
from models.team_model import reason_medical_data
from database import get_all_tests_for_patient

router = APIRouter()

@router.post("/reason-medical", response_model=ReasoningResponse)
async def reason_medical_endpoint(request: ReasoningRequest):
    """
    Fetches the patient's entire medical history from SQLite and uses the Agno agent team to reason over it.
    """
    try:
        # Fetch all tests from SQLite
        tests = get_all_tests_for_patient(request.patient_name)
        
        if not tests:
            raise HTTPException(status_code=404, detail=f"No medical historical data found for {request.patient_name} in the database. Please process an image first.")

        # Bundle everything nicely for the multi-agent team
        data_to_analyze = {
            "patient_identity": request.patient_name,
            "historical_medical_tests": tests
        }
        
        medical_json_str = json.dumps(data_to_analyze, indent=2)
        reasoning_result = reason_medical_data(medical_json_str)
        
        return ReasoningResponse(
            success=True,
            reasoning=reasoning_result,
            message="Reasoning completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in reasoning: {str(e)}")
