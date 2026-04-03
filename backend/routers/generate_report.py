from fastapi import APIRouter
from models.cheif_agent import run_chief_agent
from  routers.analytics import get_patient_chart_data

report_router = APIRouter()

@report_router.get("/generate-report")
async def generate_report(patient_name: str):

    # 1. Get timeline data
    timeline_data = await get_patient_chart_data(patient_name)

    # 2. Get AI reasoning
    ai_report = await run_chief_agent(patient_name)

    # 3. Combine everything
    return {
        "patient_name": patient_name,
        "timeline": timeline_data,
        "charts_data": timeline_data,  # same data used for graphs
        "ai_report": ai_report["report"]
    }