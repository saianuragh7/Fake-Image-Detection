from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms


def load_model() -> torch.nn.Module:
    project_root = Path(__file__).resolve().parent.parent
    model_path = project_root / "models" / "fake_detector.pth"

    model = models.resnet18()
    model.fc = torch.nn.Linear(model.fc.in_features, 2)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model


def main() -> None:
    model = load_model()
    classes = ["fake", "real"]

    transform = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ]
    )

    img_path = input("Enter image path: ").strip()
    image = Image.open(img_path).convert("RGB")
    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)

    print("Prediction:", classes[predicted.item()])


if __name__ == "__main__":
    main()
