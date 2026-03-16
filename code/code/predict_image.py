import torch
from torchvision import transforms, models
from PIL import Image

model = models.resnet18()
model.fc = torch.nn.Linear(model.fc.in_features, 2)

model.load_state_dict(torch.load("../models/resnet18_fake_image_detector.pth", map_location="cpu"))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])

img_path = input("Enter image path: ")

image = Image.open(img_path).convert("RGB")
image = transform(image).unsqueeze(0)

outputs = model(image)
_, predicted = torch.max(outputs,1)

classes = ["fake","real"]

print("Prediction:", classes[predicted.item()])
