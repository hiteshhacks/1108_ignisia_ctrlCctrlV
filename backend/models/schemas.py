import json
from typing import Optional, Dict
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
    family_communication: Optional[Dict[str, str]] = None
    message: str
