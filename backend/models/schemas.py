import json
from pydantic import BaseModel

class ExtractionResponse(BaseModel):
    success: bool
    data: dict
    message: str

class ReasoningRequest(BaseModel):
    patient_name: str

class ReasoningResponse(BaseModel):
    success: bool
    reasoning: str
    message: str
