from app.utils import models_data


def get_model_json(model_name: str) -> dict:
    models_map = {
        "box1": models_data.sample_box,
        "box2": models_data.sample_sphere,
        "box3": getattr(models_data, "sample_pyramid", None),
    }

    model = models_map.get(model_name.lower())

    if model:
        return model
    else:
        return {"error": f"Model '{model_name}' not found."}
