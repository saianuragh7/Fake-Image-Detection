from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
from torchvision import models, transforms
import torch.nn as nn
import io

app = FastAPI(title="Fake Image Detector API")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = models.resnet18()
model.fc = nn.Linear(model.fc.in_features, 2)
model.load_state_dict(torch.load("models/fake_detector.pth", map_location="cpu"))
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

@app.get("/")
def home():
    return {"message": "Fake Image Detector API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    contents = await file.read()

    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = model(img)

    prob = torch.softmax(output, dim=1)
    confidence = prob.max().item() * 100

    prediction = torch.argmax(output, dim=1).item()

    if prediction == 1:
        result = "Real Image"
    else:
        result = "Fake Image"

    return {
        "prediction": result,
        "confidence": round(confidence, 2)
    }