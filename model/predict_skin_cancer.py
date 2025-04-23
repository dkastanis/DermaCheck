from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image

def predict_skin_cancer(filepath):
    processor = AutoImageProcessor.from_pretrained("Anwarkh1/Skin_Cancer-Image_Classification")
    model = AutoModelForImageClassification.from_pretrained("Anwarkh1/Skin_Cancer-Image_Classification")

    image = Image.open(filepath) # Load the image from the local file system

    inputs = processor(images=image, return_tensors="pt") # Preprocess the image and convert it to a tensor
    with torch.no_grad():                                 # Disable gradient calculation for inference
        logits = model(**inputs).logits                   # Forward pass through the model to get the logits

    # The label with the highest score is our prediction!
    # 0: benign keratosis-like lesions, 1: basal cell carcinoma, 2: actinic keratoses, 3:vascular lesions, 4: melanocytic nevi, 5: melanoma, 6: dermatofibroma

    predicted_class_idx = logits.argmax(-1).item()      # Get the predicted class index
    result = model.config.id2label[predicted_class_idx] # Get the resulting label
    print('Result: ', result)

    probs = logits.softmax(dim=-1)     # convert to probabilities
    topk = 5
    top_probs, top_idx = probs.topk(topk, dim=-1)
    for p, idx in zip(top_probs[0], top_idx[0]):
        predicted_class_idx = idx.item()
        predicted_class_name = model.config.id2label[predicted_class_idx] # Get the predicted class index
        value = p.item()
        print(f"{predicted_class_name:20s} {value:.3f}")