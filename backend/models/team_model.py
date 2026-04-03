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
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=[
        "Review the extracted medical data carefully.",
        "Compare each test value against the provided reference range.",
        "Highlight any abnormal or out-of-range test results.",
        "Provide a clear, easy-to-understand summary of the patient's test results."
    ],
    markdown=True,
)

recommendation_agent = Agent(
    name="Health Advisor",
    role="Provide general lifestyle and dietary recommendations based on medical test analysis.",
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=[
        "Based on the identified abnormal test results, suggest general lifestyle, dietary, or fitness improvements.",
        "Do not prescribe medications or provide definitive diagnoses.",
        "Always add a disclaimer advising the patient to consult their doctor."
    ],
    markdown=True,
)

medical_team = Team(
    name="Medical Reasoning Team",
    role="Analyze medical extractions and provide insights and recommendations.",
    members=[analysis_agent, recommendation_agent],
    model=Groq(id="llama-3.3-70b-versatile"),
    instructions=[
        "First, analyze the patient's test data and flag any anomalies.",
        "Second, provide actionable lifestyle and dietary recommendations based on the findings.",
        "Ensure the final response is structured clearly with headings and bullet points."
    ],
    markdown=True,
)

def reason_medical_data(medical_json_data: str) -> str:
    """Passes the extracted medical JSON data to the agent team for reasoning."""
    prompt = f"Please analyze the following extracted medical data:\n\n{medical_json_data}"
    
    response = medical_team.run(prompt)
    return response.content

if __name__ == "__main__":
    sample_data = "{}"
    print(reason_medical_data(sample_data))
