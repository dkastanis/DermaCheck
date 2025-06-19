from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

processor = AutoImageProcessor.from_pretrained("Anwarkh1/Skin_Cancer-Image_Classification", use_fast=True)
model = AutoModelForImageClassification.from_pretrained("Anwarkh1/Skin_Cancer-Image_Classification")
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Function to predict skin cancer from an image file
def predict_skin_cancer(filepath):
    try:
        image = Image.open(filepath).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")

        with torch.no_grad():
            logits = model(**inputs).logits

        probs = torch.softmax(logits, dim=-1)
        topk = 5
        top_probs, top_idx = probs.topk(topk, dim=-1)

        predictions = []
        for p, idx in zip(top_probs[0], top_idx[0]):
            predicted_class_idx = idx.item()
            predicted_class_name = model.config.id2label[predicted_class_idx]
            value = p.item() * 100  # convert to %
            predictions.append({
                "label": predicted_class_name,
                "confidence": round(value, 2)
            })

        # Assign top1 confidence
        top1_confidence = predictions[0]["confidence"]

        # Basic validation: Reject if confidence is low
        if top1_confidence < 90:
            raise Exception("The uploaded image is likely not a valid skin lesion. Please upload a clearer medical image.")

        return predictions

    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")



# Model loader for inference
def load_model(model_path):
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    return model


