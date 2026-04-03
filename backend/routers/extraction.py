from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import ExtractionResponse
from services.vision import (
    validate_file, 
    compress_image, 
    encode_to_base64, 
    call_groq_vision, 
    parse_llm_response
)
from database import save_medical_data

router = APIRouter()

@router.post("/extract", response_model=ExtractionResponse)
async def extract(file: UploadFile = File(...)):
    """
    Reads file, extracts complex medical data using AI, and saves to SQLite.
    If this patient already exists in the database, the new tests are appended.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        ext = file.filename.split(".")[-1]
        validate_file(ext)
        content = compress_image(content)
        base64_content = encode_to_base64(content)

        prompt = """
        You are an advanced medical data extraction system.

        Extract the following:
        1. Timeline: all dates
        2. Test Names
        3. Values
        4. Units
        5. Reference Ranges
        6. Patient Info (name, age, gender)
        7. Lab/Hospital name
        8. Doctor name

        Return STRICT JSON ONLY.

        Format:
        {
            "timeline": ["date1", "date2"],
            "tests": [
                {
                    "name": "",
                    "value": "",
                    "unit": "",
                    "reference_range": "",
                    "date": ""
                }
            ],
            "patient": {
                "name": "",
                "age": "",
                "gender": ""
            },
            "lab_name": "",
            "doctor_name": ""
        }
        """

        result = await call_groq_vision(base64_content, prompt)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])

        parsed = parse_llm_response(result["content"])

        # ---------------- SAVE TO DATABASE ---------------- #
        if isinstance(parsed, dict) and "patient" in parsed:
            save_medical_data(parsed)

        return ExtractionResponse(
            success=True,
            data=parsed,
            message="Extraction successful and data saved to database!"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
