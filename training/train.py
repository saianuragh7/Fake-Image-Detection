import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import timm
import albumentations as A
from albumentations.pytorch import ToTensorV2
from PIL import Image
import numpy as np
from pathlib import Path
from tqdm import tqdm

class FrequencyBranch(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128), nn.ReLU(),
            nn.AdaptiveAvgPool2d(4),
        )
        self.fc = nn.Sequential(
            nn.Linear(128*4*4, 256),
            nn.ReLU(), nn.Dropout(0.5),
        )

    def forward(self, x):
        gray = (0.299*x[:,0] + 0.587*x[:,1] + 0.114*x[:,2]).unsqueeze(1)
        fft = torch.fft.fftshift(torch.fft.fft2(gray))
        mag = torch.log(torch.abs(fft) + 1e-8)
        b = mag.size(0)
        mn = mag.view(b, -1).min(dim=1)[0].view(b, 1, 1, 1)
        mx = mag.view(b, -1).max(dim=1)[0].view(b, 1, 1, 1)
        mag = (mag - mn) / (mx - mn + 1e-8)
        return self.fc(self.conv(mag).flatten(1))

class AIImageDetector(nn.Module):
    def __init__(self):
        super().__init__()
        self.rgb = timm.create_model('efficientnet_b0', pretrained=True, num_classes=0)
        self.freq = FrequencyBranch()
        self.head = nn.Sequential(
            nn.Dropout(0.6),
            nn.Linear(1280+256, 256), nn.ReLU(),
            nn.BatchNorm1d(256), nn.Dropout(0.4),
            nn.Linear(256, 2)
        )

    def forward(self, x):
        return self.head(torch.cat([self.rgb(x), self.freq(x)], dim=1))

class AIImageDataset(Dataset):
    def __init__(self, root, split='train', transform=None):
        self.root = Path(root) / split
        self.transform = transform
        self.samples = []
        for label, cls in [(0, 'real'), (1, 'ai')]:
            files = (self.root / cls).glob('*.jpg')
            self.samples.extend([(str(f), label) for f in files])
    
    def __len__(self): 
        return len(self.samples)
    
    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(image=np.array(img))['image']
        return img, label

class SubsetDataset(Dataset):
    def __init__(self, dataset, indices, transform):
        self.dataset = dataset
        self.indices = indices
        self.transform = transform

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        path, label = self.dataset.samples[self.indices[idx]]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(image=np.array(img))['image']
        return img, label

def train():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Training on {device}")
    
    # Advanced Anti-Overfitting Transforms for Training
    train_transform = A.Compose([
        A.Resize(224, 224),
        A.HorizontalFlip(p=0.5),
        A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.5),
        A.ImageCompression(quality_lower=50, quality_upper=100, p=0.4), # Highly crucial for AI detection
        A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, p=0.4),
        A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
        A.CoarseDropout(max_holes=8, max_height=16, max_width=16, fill_value=0, p=0.3),
        A.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
        ToTensorV2()
    ])

    val_transform = A.Compose([
        A.Resize(224, 224),
        A.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
        ToTensorV2()
    ])
    
    # Dynamic Train/Val Splitting
    full_dataset = AIImageDataset('/content/data_v2', 'train', transform=None)
    
    dataset_size = len(full_dataset)
    indices = list(range(dataset_size))
    np.random.shuffle(indices)
    
    split = int(np.floor(0.2 * dataset_size))
    val_idx, train_idx = indices[:split], indices[split:]

    train_ds = SubsetDataset(full_dataset, train_idx, train_transform)
    val_ds = SubsetDataset(full_dataset, val_idx, val_transform)
    
    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False, num_workers=2, pin_memory=True)
    
    # Model (Untouched Architecture)
    model = AIImageDetector().to(device)
    
    # Enhanced Optimizer & Scheduler
    epochs = 30
    optimizer = optim.AdamW(model.parameters(), lr=2e-4, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        # Training Phase
        model.train()
        train_losses = []
        
        loop = tqdm(train_loader, desc=f'Epoch {epoch+1}/{epochs} [Train]')
        for images, labels in loop:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()
            train_losses.append(loss.item())
            
            loop.set_postfix({'loss': np.mean(train_losses)})
            
        # Validation Phase
        model.eval()
        val_losses = []
        with torch.no_grad():
            for images, labels in tqdm(val_loader, desc=f'Epoch {epoch+1}/{epochs} [Val]'):
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                val_losses.append(criterion(outputs, labels).item())
                
        avg_train_loss = np.mean(train_losses)
        avg_val_loss = np.mean(val_losses)
        
        scheduler.step()
        
        print(f'Epoch {epoch+1}: Train Loss = {avg_train_loss:.4f} | Val Loss = {avg_val_loss:.4f} | LR = {scheduler.get_last_lr()[0]:.6f}')
        
        # Dynamic Checkpointing (Anti-Overfitting Save)
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), 'ai_detector_balanced_best.pth')
            print('>>> New Best Model Saved!')
            
    # Also save the final output as fallback
    torch.save(model.state_dict(), 'ai_detector_balanced_final.pth')
    print('Training Complete.')

if __name__ == "__main__":
    train()
