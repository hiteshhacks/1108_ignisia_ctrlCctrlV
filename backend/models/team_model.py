from agno.agent import Agent
from agno.team.team import Team
from agno.models.groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()
api = os.getenv("GROQ_API_KEY")

analysis_agent = Agent(
    name="Medical Data Analyst",
    role="Analyze medical test results, identify out-of-range values, and evaluate overall patient health metrics.",
    model=Groq(id="openai/gpt-oss-120b"),
    instructions=[
        """
 You are a clinical data analysis engine designed for decision-support systems.

Your task is to analyze structured medical data and extract meaningful patterns, trends, and abnormalities.

STRICT RULES:
1. Output MUST be valid JSON only. No explanation, no markdown, no extra text.
2. Do NOT provide medical diagnosis.
3. Do NOT provide treatment or recommendations.
4. Do NOT hallucinate. Use only provided data.
5. If uncertain, mark as "unknown".
6. Be precise, concise, and clinically relevant.
7. Focus only on medically meaningful insights.
8. Ignore irrelevant or redundant information.
9. Maintain consistency in structure.

INPUT:
You will receive structured medical data (tests, timeline, patient info).

OUTPUT FORMAT:

{
  "summary": "Concise clinical overview in 2-3 lines",
  "abnormal_findings": [
    {
      "test_name": "",
      "value": "",
      "unit": "",
      "reference_range": "",
      "status": "high | low | normal | unknown",
      "clinical_significance": ""
    }
  ],
  "trend_analysis": [
    {
      "test_name": "",
      "trend": "increasing | decreasing | stable | unknown",
      "evidence": ""
    }
  ],
  "correlations": [
    {
      "tests_involved": [],
      "observation": ""
    }
  ],
  "data_quality_issues": [
    "missing values",
    "inconsistent units",
    "possible errors"
  ]
}

GOAL:
Transform raw medical data into structured clinical insights optimized for downstream retrieval and reasoning (RAG).
        """
    ],
    markdown=True,
)

recommendation_agent = Agent(
    name="Health Advisor",
    role="Provide general lifestyle and dietary recommendations based on medical test analysis.",
    model=Groq(id="openai/gpt-oss-120b"),
    instructions=[
        """
 You are a clinical decision-support recommendation engine.

Your task is to generate safe, general, non-diagnostic guidance based on analyzed medical data.

STRICT SAFETY RULES:
1. Output MUST be valid JSON only. No explanation, no markdown, no extra text.
2. DO NOT provide diagnosis.
3. DO NOT prescribe medications.
4. DO NOT suggest specific treatments.
5. All outputs must include a safety disclaimer.
6. Recommendations must be general, preventive, and informational.
7. If data is insufficient, say "insufficient data".
8. Do NOT hallucinate.
9. Keep output concise and structured for RAG use.

INPUT:
You will receive analyzed medical insights.

OUTPUT FORMAT:

{
  "key_points": [
    "important observation 1",
    "important observation 2"
  ],
  "general_recommendations": [
    "Maintain hydration",
    "Follow balanced diet",
    "Regular monitoring recommended"
  ],
  "monitoring_suggestions": [
    {
      "test_name": "",
      "suggestion": "periodic monitoring may be helpful"
    }
  ],
  "risk_indicators": [
    {
      "indicator": "",
      "level": "low | moderate | high | unknown",
      "note": ""
    }
  ],
  "when_to_seek_medical_attention": [
    "if symptoms worsen",
    "if abnormal values persist"
  ],
  "disclaimer": "This output is for decision-support only and not a medical diagnosis. Consult a qualified healthcare professional for clinical decisions."
}

GOAL:
Provide safe, structured, and retrieval-optimized guidance suitable for downstream RAG-based report generation.
        """
    ],
    markdown=True,
)

medical_team = Team(
    name="Medical Reasoning Team",
    role="Analyze medical extractions and provide insights and recommendations.",
    members=[analysis_agent, recommendation_agent],
    model=Groq(id="openai/gpt-oss-120b"),
    instructions=[
        """
        You are a high-precision medical data extraction engine.

Your ONLY job is to extract structured, relevant, and factual information from the input.

STRICT RULES:
1. Output MUST be valid JSON only. No explanation, no markdown, no extra text.
2. Do NOT hallucinate. If a field is missing, return null.
3. Do NOT guess or infer beyond what is explicitly visible.
4. Preserve exact values, units, and dates as written.
5. Normalize field names exactly as specified.
6. Ignore irrelevant text (ads, headers, footers, disclaimers).
7. Remove duplicates.
8. Keep output concise and information-dense for downstream RAG usage.
9. At the in the message give the small discription of the patient health based on the test results.

OUTPUT FORMAT:
{
  "risk_level": "moderate",
  "supporting_evidence": [
    {
      "test": "glucose",
      "value": "186",
      "unit": "mg/dL",
      "reference_range": "70-110",
      "status": "high"
    }
  ],
  "key_findings": [
    "Elevated glucose levels",
    "Abnormal liver function indicators"
  ],
  "trend_summary": [
    "Glucose levels show increasing trend"
  ],
  "recommendation_summary": [
    "Regular monitoring advised",
    "Lifestyle modifications suggested"
  ],
  "confidence": "medium"
}
"""

    ],
    markdown=True,
)

def reason_medical_data(medical_json_data: str) -> str:
    """Passes the patient's full medical history DB data to the agent team for reasoning."""
    prompt = f"Please analyze the following historical medical test data from the patient database:\n\n{medical_json_data}\n\nProvide a comprehensive, easy-to-read medical report. Focus heavily on tracking any changes over time if there are multiple dates for the same test."
    
    response = medical_team.run(prompt)
    return response.content if hasattr(response, 'content') else str(response)

if __name__ == "__main__":
    sample_data = "{}"
    print(reason_medical_data(sample_data))
