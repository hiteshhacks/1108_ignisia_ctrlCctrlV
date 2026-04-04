from fastapi import APIRouter, HTTPException
import json
from models.schemas import ReasoningRequest, ReasoningResponse
from models.team_model import reason_medical_data
from database import get_all_tests_for_patient
from services.translator import generate_family_summary, translate_text

router = APIRouter()

@router.post("/reason-medical", response_model=ReasoningResponse)
async def reason_medical_endpoint(request: ReasoningRequest):

    try:
        tests = get_all_tests_for_patient(request.patient_name)
        
        if not tests:
            raise HTTPException(status_code=404, detail=f"No data found for {request.patient_name}")

        data_to_analyze = {
            "patient_identity": request.patient_name,
            "historical_medical_tests": tests
        }
        
        medical_json_str = json.dumps(data_to_analyze, indent=2)

        # Step 1: Agent reasoning
        agent_insights_json = reason_medical_data(medical_json_str)

        # Step 2: RAG
        from tools.RAG.retrival import medical_guideline_rag
        final_rag_report = medical_guideline_rag(
            patient_data=medical_json_str, 
            medical_team_report=agent_insights_json
        )

        # Step 3: Family-friendly layman summary
        family_summary = generate_family_summary(
            final_rag_report, request.patient_name
        )

        # Step 4: Translation to Hindi
        hindi_summary = translate_text(family_summary, "Hindi")

        return ReasoningResponse(
            success=True,
            reasoning=final_rag_report,
            family_communication={
                "english": family_summary,
                "hindi": hindi_summary
            },
            message="Reasoning + family communication generated successfully."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")