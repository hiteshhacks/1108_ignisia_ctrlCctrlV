from fastapi import APIRouter, HTTPException
import json
from models.schemas import ReasoningRequest, ReasoningResponse
from models.team_model import reason_medical_data

router = APIRouter()

@router.post("/reason-medical", response_model=ReasoningResponse)
async def reason_medical_endpoint(request: ReasoningRequest):
    """
    Takes extracted medical JSON data and uses the agent team to reason over it.
    """
    try:
        # Convert dict to nicely formatted string for the agent
        medical_json_str = json.dumps(request.data, indent=2)
        reasoning_result = reason_medical_data(medical_json_str)
        
        return ReasoningResponse(
            success=True,
            reasoning=reasoning_result,
            message="Reasoning completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in reasoning: {str(e)}")
