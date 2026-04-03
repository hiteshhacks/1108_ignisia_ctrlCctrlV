from services.db_service import get_patient_data
from services.temporal_mapping import temporal_mapper
from utils.outlier import detect_outliers
from tools.RAG.retrival import medical_guideline_rag
from groq import Groq
from dotenv import load_dotenv
import os 
load_dotenv()
Api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=Api_key)

async def run_chief_agent(patient_name: str):

    # 1. Fetch data
    data = get_patient_data(patient_name)
    if not data:
        return {"error": "Patient not found"}

    # 2. Temporal mapping
    timeline = temporal_mapper(data["tests"])

    # 3. Outlier detection
    outlier_report = {}
    for test, values in timeline.items():
        numeric_vals = [float(v["value"]) for v in values if v.get("value") not in (None, "")]
        outliers = detect_outliers(numeric_vals)
        if outliers:
            outlier_report[test] = outliers

    # 4. Build context for reasoning
    context = f"""
    Patient Info: {data['patient']}
    Timeline: {timeline}
    Outliers: {outlier_report}
    """

    # 5. RAG
    guidelines = medical_guideline_rag(context, str(outlier_report))

    # 6. Chief Agent Reasoning (THIS IS THE AGENT 🔥)
    prompt = f"""
    You are a senior ICU Chief Doctor.

    Analyze the patient data.

    Tasks:
    1. Identify disease progression
    2. Detect risk (sepsis, organ failure)
    3. Ignore outliers if inconsistent
    4. Provide reasoning
    5. Cite guideline

    Data:
    {context}

    Guidelines:
    {guidelines}

    Output format:
    - Timeline Summary
    - Risk Assessment
    - Outlier Notes
    - Final Recommendation
    - Safety Disclaimer
    """

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "report": response.choices[0].message.content
    }