import io
from pathlib import Path
import torch
import torch.nn as nn
from torchvision.models import convnext_base
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="VeritasLens Forensic API")
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"
STATIC_DIR = FRONTEND_DIST_DIR if FRONTEND_DIST_DIR.exists() else BASE_DIR / "static"

class ConvNeXtDetector(nn.Module):
    def __init__(self):
        super().__init__()
        # Load ConvNeXt-Base backbone (no pre-trained weights, we load from our checkpoint)
        self.backbone = convnext_base(weights=None)
        
        # Override the classifier head with the custom defined architecture
        self.backbone.classifier = nn.Sequential(
            nn.Flatten(),
            nn.LayerNorm(1024),
            nn.Linear(1024, 512),
            nn.GELU(),
            nn.Dropout(0),
            nn.Linear(512, 128),
            nn.GELU(),
            nn.Dropout(0),
            nn.Linear(128, 2)
        )

    def forward(self, x):
        return self.backbone(x)

# Setup device and model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = ConvNeXtDetector()

# Load checkpoint
try:
    checkpoint = torch.load('best_convnext_detector.pth', map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
except Exception as e:
    print(f"Warning: Could not load checkpoint 'best_convnext_detector.pth'. Error: {e}")

model.to(device)
model.eval()

# Transform specifics for ConvNeXt
transform = transforms.Compose([
    transforms.Resize(232),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict_image(image: UploadFile = File(None), file: UploadFile = File(None)):
    try:
        upload = image or file
        if upload is None:
            raise HTTPException(status_code=400, detail="No file selected")

        contents = await upload.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        input_tensor = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(input_tensor)
            
            temperature = 0.5
            power = 1.5
            
            # Apply Temperature Scaling directly before Final Probability computation
            scaled_outputs = outputs / temperature
            probs = torch.softmax(scaled_outputs, dim=1)
            
            # Apply Power Sharpening and re-normalize
            probs = probs ** power
            probs = probs / probs.sum(dim=1, keepdim=True)
            
            probs = probs.squeeze().cpu().numpy()
            
            # Extract probabilities based on class mapping => {"fake": 0, "real": 1}
            fake_prob = float(probs[0])
            real_prob = float(probs[1])
            
            if fake_prob > real_prob:
                label = "FAKE"
                confidence = fake_prob
            else:
                label = "REAL"
                confidence = real_prob

            return {
                "label": label,
                "confidence": confidence,
                "fake_prob": fake_prob,
                "real_prob": real_prob
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "device": str(device),
        "frontend_dir": str(STATIC_DIR),
    }


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
