from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)


def generate_family_summary(medical_report: str, patient_name: str) -> str:
    """
    Takes a clinical/technical medical report and rewrites it in very simple,
    layman-friendly language — as if a caring doctor is explaining the results
    to a worried family member who has no medical background.
    """

    prompt = f"""
You are a kind and experienced doctor sitting down with the family of a patient named {patient_name}.

The family has NO medical background at all. They are anxious and need to understand what is going on in the simplest possible words.

Here is the clinical medical report:
---
{medical_report}
---

Now rewrite this ENTIRE report in extremely simple, everyday language. Follow these rules:

1. **No medical jargon at all.** Replace every medical term with a simple explanation.
   - Instead of "elevated WBC count" → "the infection-fighting cells in the blood are higher than normal, which usually means the body is fighting some kind of infection"
   - Instead of "renal function" → "how well the kidneys are working"
   - Instead of "hemoglobin is low" → "the part of blood that carries oxygen is a bit low, which can make someone feel tired or weak"
   - Instead of "sepsis risk" → "there is a chance the infection could spread through the body, which can be serious"

2. **Use a warm, reassuring but honest tone.** Don't scare the family, but don't hide anything either.

3. **Structure the response clearly with these sections:**
   - 🏥 **What the reports show** (simple overview)
   - ⚠️ **Things to watch out for** (any concerns, explained simply)  
   - 💪 **Good signs** (anything positive in the report)
   - 📋 **What happens next** (what the doctors might do or monitor)
   - 🤗 **Message for the family** (a brief comforting note)

4. **Use analogies and everyday comparisons** to make things clear.
   - "Think of the liver like a filter — right now it's working a little harder than usual"
   - "The sugar level in the blood is like fuel — too much of it over time can cause problems"

5. **Keep it concise** — no longer than 300-400 words. Families don't want to read an essay.

6. **Do NOT include any numbers, units, or reference ranges.** Just explain what the values mean in plain words.

7. **End with the disclaimer:** "This is a simplified explanation to help you understand. Please talk to the treating doctor for the full medical picture and any decisions about care."

Write the response now:
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1000,
    )

    return response.choices[0].message.content


def translate_text(text: str, target_language: str) -> str:
    """
    Translates the given text into the target language while keeping
    the tone warm, simple, and family-friendly.
    """

    prompt = f"""
Translate the following text into {target_language}.

Rules:
1. Keep the tone warm, caring, and easy to understand.
2. Use simple, conversational {target_language} — not formal or literary.
3. Keep all emojis and formatting (bold, bullet points) intact.
4. Do NOT add any extra content — just translate what is given.
5. The translation should feel natural, like a doctor speaking to a family in {target_language}.

Text to translate:
---
{text}
---

Translated text in {target_language}:
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=1500,
    )

    return response.choices[0].message.content