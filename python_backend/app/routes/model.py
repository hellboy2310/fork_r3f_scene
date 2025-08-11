from fastapi import APIRouter, Query
from app.services.model_service import get_model_json
from typing import Optional

router = APIRouter(prefix="/model", tags=["Model"])

@router.get("/")
def get_model(
    model_name: Optional[str] = Query(default="sample_box", description="Name of the model to fetch")
):
    """
    Returns the 3D model JSON by model_name.
    Example:
    - /model?model_name=sample_box
    - /model?model_name=sample_sphere
    """
    return get_model_json(model_name)
