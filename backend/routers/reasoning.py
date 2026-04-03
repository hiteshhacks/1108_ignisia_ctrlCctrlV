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
        
        # 1. Ge initial JSON analysis from Agents
        agent_insights_json = reason_medical_data(medical_json_str)
        
        # 2. Run the insights through the RAG pipeline to cite guidelines
        from tools.RAG.retrival import medical_guideline_rag
        final_rag_report = medical_guideline_rag(
            patient_data=medical_json_str, 
            medical_team_report=agent_insights_json
        )
        
        return ReasoningResponse(
            success=True,
            reasoning=final_rag_report,
            message="Reasoning completed successfully with RAG citations."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in reasoning: {str(e)}")
