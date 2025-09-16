import re
from typing import Any

async def pdf_to_text(pdf_file) -> str:
    # Placeholder: Replace with actual PDF-to-text extraction logic
    return ""

async def ai_extract(text: str, schema: Any) -> Any:
    # Placeholder: Replace with actual AI extraction logic (e.g., OpenAI, Anthropic)
    return {}

PREMIUM_SCHEMA = {
    "plan_name": str,
    "tiers": list,
    "premiums": list,
    "deductibles": list,
}

def extract_premium_table(text: str) -> dict:
    # Simple regex-based extraction for MVP
    plan_name = re.search(r"Plan Name[:\s]+(.+)", text)
    tiers = re.findall(r"Tier[:\s]+(.+)", text)
    premiums = re.findall(r"\$\d+[,.]?\d*", text)
    deductibles = re.findall(r"Deductible[:\s]+\$\d+[,.]?\d*", text)
    return {
        "plan_name": plan_name.group(1).strip() if plan_name else None,
        "tiers": [t.strip() for t in tiers],
        "premiums": premiums,
        "deductibles": deductibles,
    }

async def extract_spd_mvp(pdf_file):
    """
    Just extract:
    - Plan name and tiers
    - Monthly premiums table
    - Deductibles
    Skip complex benefits grid initially
    """
    text = await pdf_to_text(pdf_file)
    premiums = extract_premium_table(text)
    confidence = 0.8 if premiums["plan_name"] and premiums["premiums"] else 0.5
    if confidence < 0.7:
        premiums = await ai_extract(text, PREMIUM_SCHEMA)
    return premiums
