import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model loader for inference
def load_model(model_path):
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    return model

# Inference function
def image_discriminator(img_path):
    model = load_model('models/discriminator.pth')
    model.eval()
    img = Image.open(img_path).convert('RGB')
    img_tensor = transforms.ToTensor()(img).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(img_tensor)
        prob = torch.sigmoid(output).item()
        print(f"[INFO] Prediction probability: {prob:.4f}")
        if prob > 0.90:
            print("Skin-like image")
        else:
            print("No skin-like image")
        return prob