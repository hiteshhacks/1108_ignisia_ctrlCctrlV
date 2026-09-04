from torch.backends.opt_einsum import strategy
import os
from pathlib import Path
from typing import TypedDict, Optional
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

# Load environment variables from backend/.env or root .env
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")
load_dotenv(dotenv_path=backend_dir.parent / ".env")
load_dotenv()

MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def get_llm():
    """Returns a ChatGroq LLM instance using the current environment variables."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Please set it in backend/.env")
    return ChatGroq(
        model=MODEL_NAME,
        groq_api_key=api_key,
        temperature=0.2,
        
    )


ANALYSIS_INSTRUCTIONS = """You are a clinical data analysis engine designed for decision-support systems.

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

RECOMMENDATION_INSTRUCTIONS = """You are a clinical decision-support recommendation engine.

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

TEAM_SYNTHESIS_INSTRUCTIONS = """You are a high-precision medical data extraction engine.

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
9. At the end of the message give the small description of the patient health based on the test results.

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


def _extract_text(response) -> str:
    """Helper to cleanly extract text content from LangChain response."""
    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        return "".join([b.get("text", "") if isinstance(b, dict) else str(b) for b in content])
    return str(content)


class MedicalReasoningState(TypedDict):
    medical_json_data: str
    user_prompt: str
    analyst_insights: Optional[str]
    recommendations: Optional[str]
    final_report: Optional[str]


def analyst_node(state: MedicalReasoningState) -> dict:
    """Agent 1: Medical Data Analyst - Extracts clinical trends, abnormalities and quality issues."""
    llm = get_llm()
    prompt = (
        f"Medical test data to analyze:\n{state['medical_json_data']}\n\n"
        f"Instruction:\n{state.get('user_prompt', 'Analyze the structured medical data.')}"
    )
    messages = [
        SystemMessage(content=ANALYSIS_INSTRUCTIONS),
        HumanMessage(content=prompt),
    ]
    response = llm.invoke(messages)
    return {"analyst_insights": _extract_text(response)}


def recommendation_node(state: MedicalReasoningState) -> dict:
    """Agent 2: Health Advisor - Generates non-diagnostic lifestyle and monitoring guidance."""
    llm = get_llm()
    prompt = (
        f"Patient Medical Data:\n{state['medical_json_data']}\n\n"
        f"Clinical Analyst Insights:\n{state.get('analyst_insights', '')}\n\n"
        "Instruction:\nProvide safe lifestyle, dietary, and monitoring recommendations based on the clinical analysis."
    )
    messages = [
        SystemMessage(content=RECOMMENDATION_INSTRUCTIONS),
        HumanMessage(content=prompt),
    ]
    response = llm.invoke(messages)
    return {"recommendations": _extract_text(response)}


def synthesis_node(state: MedicalReasoningState) -> dict:
    """Agent 3: Medical Reasoning Team Lead - Synthesizes insights and recommendations into a final clinical report."""
    llm = get_llm()
    prompt = (
        f"Original Medical Test Data:\n{state['medical_json_data']}\n\n"
        f"Analyst Clinical Findings:\n{state.get('analyst_insights', '')}\n\n"
        f"Health Advisor Guidance:\n{state.get('recommendations', '')}\n\n"
        f"User Prompt:\n{state.get('user_prompt', '')}\n\n"
        "Synthesize all findings into the final medical reasoning report conforming to the requested JSON format."
    )
    messages = [
        SystemMessage(content=TEAM_SYNTHESIS_INSTRUCTIONS),
        HumanMessage(content=prompt),
    ]
    response = llm.invoke(messages)
    return {"final_report": _extract_text(response)}


# Construct LangGraph StateGraph workflow
workflow = StateGraph(MedicalReasoningState)

# Add Agent Nodes
workflow.add_node("analyst", analyst_node)
workflow.add_node("health_advisor", recommendation_node)
workflow.add_node("team_synthesizer", synthesis_node)

# Define Graph Edges: Sequential multi-agent deliberation
workflow.add_edge(START, "analyst")
workflow.add_edge("analyst", "health_advisor")
workflow.add_edge("health_advisor", "team_synthesizer")
workflow.add_edge("team_synthesizer", END)

# Compile LangGraph
medical_graph = workflow.compile()


def reason_medical_data(medical_json_data: str) -> str:
    """
    Passes the patient's full medical history DB data to the LangGraph agent team for reasoning.
    Preserves full backward compatibility with the FastAPI endpoints.
    """
    prompt = (
        f"Please analyze the following historical medical test data from the patient database:\n\n"
        f"{medical_json_data}\n\n"
        f"Provide a comprehensive, easy-to-read medical report. "
        f"Focus heavily on tracking any changes over time if there are multiple dates for the same test."
    )
    
    initial_state: MedicalReasoningState = {
        "medical_json_data": medical_json_data,
        "user_prompt": prompt,
        "analyst_insights": None,
        "recommendations": None,
        "final_report": None,
    }
    
    result = medical_graph.invoke(initial_state)
    return result.get("final_report", "")


if __name__ == "__main__":
    sample_data = '{"patient": "John Doe", "tests": [{"test_name": "Fasting Blood Glucose", "value": "145", "unit": "mg/dL", "date": "2026-03-01"}]}'
    print("Running LangGraph Medical Team Reasoning...")
    print(reason_medical_data(sample_data))
