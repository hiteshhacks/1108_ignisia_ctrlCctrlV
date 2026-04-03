from fastapi import APIRouter
from models.cheif_agent import run_chief_agent

router = APIRouter()

@router.get("/report_explanation")
async def reason_medical(patient_name: str):
    result = await run_chief_agent(patient_name)
    return result