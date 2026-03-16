"""
PyTorch Real vs Fake Face Detection Training Script
Uses ResNet18 pretrained model with binary classification for real/fake detection

Architecture:
  - Base: ResNet18 (ImageNet pretrained)
  - Final layer: Modified for binary classification (1 output)
  - Loss: BCEWithLogitsLoss
  - Optimizer: Adam
  - Epochs: 5
"""

import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
from pathlib import Path
import sys
import time

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Training configuration"""
    BATCH_SIZE = 32
    LEARNING_RATE = 1e-3
    NUM_EPOCHS = 5
    NUM_WORKERS = 0  # Must be 0 on Windows
    IMAGE_SIZE = 224
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================================
# PATH SETUP
# ============================================================================

def setup_paths():
    """Setup absolute paths using script location"""
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent
    dataset_path = project_root / "dataset"
    
    return {
        "script_dir": script_dir,
        "project_root": project_root,
        "dataset": dataset_path,
        "train": dataset_path / "train",
        "val": dataset_path / "val",
        "test": dataset_path / "test",
    }


def validate_dataset_structure(paths):
    """Verify that dataset directories exist"""
    print("\n" + "=" * 70)
    print("📊 VALIDATING DATASET STRUCTURE")
    print("=" * 70)
    
    required_dirs = {
        "Train/Fake": paths["train"] / "fake",
        "Train/Real": paths["train"] / "real",
        "Val/Fake": paths["val"] / "fake",
        "Val/Real": paths["val"] / "real",
        "Test/Fake": paths["test"] / "fake",
        "Test/Real": paths["test"] / "real",
    }
    
    all_exist = True
    for label, path in required_dirs.items():
        if path.exists():
            image_count = len(list(path.glob("*.*")))
            print(f"  ✅ {label:12}: {image_count:4} images")
        else:
            print(f"  ❌ {label:12}: NOT FOUND")
            all_exist = False
    
    if not all_exist:
        print("\n❌ ERROR: Missing required directories!")
        print("Run: python restructure_dataset.py")
        sys.exit(1)
    
    return all_exist


# ============================================================================
# DATA TRANSFORMATIONS
# ============================================================================

def get_transforms():
    """Get image transformations for train and validation"""
    
    # ImageNet statistics
    imagenet_mean = [0.485, 0.456, 0.406]
    imagenet_std = [0.229, 0.224, 0.225]
    
    train_transform = transforms.Compose([
        transforms.Resize((Config.IMAGE_SIZE, Config.IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=imagenet_mean, std=imagenet_std)
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((Config.IMAGE_SIZE, Config.IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=imagenet_mean, std=imagenet_std)
    ])
    
    return train_transform, val_transform


# ============================================================================
# DATA LOADING
# ============================================================================

def load_datasets(paths):
    """Load train, val, and test datasets using ImageFolder"""
    
    print("\n" + "=" * 70)
    print("📦 LOADING DATASETS")
    print("=" * 70)
    
    train_transform, val_transform = get_transforms()
    
    try:
        # Load training dataset
        train_dataset = datasets.ImageFolder(
            root=str(paths["train"]),
            transform=train_transform
        )
        print(f"\n✅ Training Dataset")
        print(f"   Classes: {train_dataset.classes}")
        print(f"   Total images: {len(train_dataset)}")
        
        # Load validation dataset
        val_dataset = datasets.ImageFolder(
            root=str(paths["val"]),
            transform=val_transform
        )
        print(f"\n✅ Validation Dataset")
        print(f"   Classes: {val_dataset.classes}")
        print(f"   Total images: {len(val_dataset)}")
        
        # Load test dataset
        test_dataset = datasets.ImageFolder(
            root=str(paths["test"]),
            transform=val_transform
        )
        print(f"\n✅ Test Dataset")
        print(f"   Classes: {test_dataset.classes}")
        print(f"   Total images: {len(test_dataset)}")
        
    except Exception as e:
        print(f"\n❌ ERROR loading datasets: {e}")
        sys.exit(1)
    
    # Create DataLoaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=Config.BATCH_SIZE,
        shuffle=True,
        num_workers=Config.NUM_WORKERS
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=Config.BATCH_SIZE,
        shuffle=False,
        num_workers=Config.NUM_WORKERS
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=Config.BATCH_SIZE,
        shuffle=False,
        num_workers=Config.NUM_WORKERS
    )
    
    print(f"\n✅ DataLoaders created")
    print(f"   Batch size: {Config.BATCH_SIZE}")
    print(f"   Train batches: {len(train_loader)}")
    print(f"   Val batches: {len(val_loader)}")
    print(f"   Test batches: {len(test_loader)}")
    
    return train_dataset, train_loader, val_loader, test_loader


# ============================================================================
# MODEL SETUP
# ============================================================================

def create_model():
    """Create ResNet18 model modified for binary classification"""
    
    print("\n" + "=" * 70)
    print("🧠 CREATING MODEL")
    print("=" * 70)
    
    # Load pretrained ResNet18
    model = models.resnet18(pretrained=True)
    
    # Get number of input features to final layer
    num_features = model.fc.in_features
    
    # Replace final layer for binary classification
    # Using 1 output neuron with BCEWithLogitsLoss
    model.fc = nn.Linear(num_features, 1)
    
    print(f"\n✅ Model Architecture:")
    print(f"   Base: ResNet18 (ImageNet pretrained)")
    print(f"   Final layer input features: {num_features}")
    print(f"   Final layer output: 1 (binary classification)")
    print(f"   Loss function: BCEWithLogitsLoss")
    
    return model.to(Config.DEVICE)


# ============================================================================
# TRAINING FUNCTIONS
# ============================================================================

def train_epoch(model, train_loader, criterion, optimizer):
    """Train for one epoch"""
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    
    for batch_idx, (images, labels) in enumerate(train_loader):
        images = images.to(Config.DEVICE)
        labels = labels.float().unsqueeze(1).to(Config.DEVICE)  # Reshape for BCE
        
        # Forward pass
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        # Statistics
        total_loss += loss.item()
        predictions = (torch.sigmoid(outputs) > 0.5).float()
        correct += (predictions == labels).sum().item()
        total += labels.size(0)
        
        # Print progress
        if (batch_idx + 1) % 10 == 0:
            print(f"   Batch {batch_idx + 1}/{len(train_loader)}, Loss: {loss.item():.4f}")
    
    avg_loss = total_loss / len(train_loader)
    accuracy = correct / total
    
    return avg_loss, accuracy


def validate_epoch(model, val_loader, criterion):
    """Validate model on validation set"""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(Config.DEVICE)
            labels = labels.float().unsqueeze(1).to(Config.DEVICE)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            total_loss += loss.item()
            predictions = (torch.sigmoid(outputs) > 0.5).float()
            correct += (predictions == labels).sum().item()
            total += labels.size(0)
    
    avg_loss = total_loss / len(val_loader)
    accuracy = correct / total
    
    return avg_loss, accuracy


def test_model(model, test_loader):
    """Test model on test set"""
    model.eval()
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(Config.DEVICE)
            labels = labels.to(Config.DEVICE)
            
            outputs = model(images)
            predictions = (torch.sigmoid(outputs) > 0.5).long().squeeze()
            
            correct += (predictions == labels).sum().item()
            total += labels.size(0)
    
    accuracy = correct / total
    return accuracy


# ============================================================================
# MAIN TRAINING LOOP
# ============================================================================

def main():
    """Main training pipeline"""
    
    print("\n" + "=" * 70)
    print("🚀 REAL vs FAKE FACE DETECTION - TRAINING")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"  Device: {Config.DEVICE}")
    print(f"  Batch Size: {Config.BATCH_SIZE}")
    print(f"  Learning Rate: {Config.LEARNING_RATE}")
    print(f"  Epochs: {Config.NUM_EPOCHS}")
    print(f"  Image Size: {Config.IMAGE_SIZE}x{Config.IMAGE_SIZE}")
    
    # Setup paths
    paths = setup_paths()
    print(f"\n  Dataset Path: {paths['dataset']}")
    
    # Validate dataset
    validate_dataset_structure(paths)
    
    # Load data
    train_dataset, train_loader, val_loader, test_loader = load_datasets(paths)
    
    # Create model
    model = create_model()
    
    # Setup training
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=Config.LEARNING_RATE)
    
    print(f"\n  Optimizer: Adam (lr={Config.LEARNING_RATE})")
    print(f"  Loss function: BCEWithLogitsLoss")
    
    # Training loop
    print("\n" + "=" * 70)
    print("🎓 TRAINING")
    print("=" * 70)
    
    best_val_accuracy = 0.0
    
    for epoch in range(Config.NUM_EPOCHS):
        epoch_start = time.time()
        
        print(f"\nEpoch {epoch + 1}/{Config.NUM_EPOCHS}")
        print("-" * 70)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer)
        
        # Validate
        val_loss, val_acc = validate_epoch(model, val_loader, criterion)
        
        epoch_time = time.time() - epoch_start
        
        # Print results
        print(f"\n   Training   Loss: {train_loss:.4f}, Accuracy: {train_acc:.4f}")
        print(f"   Validation Loss: {val_loss:.4f}, Accuracy: {val_acc:.4f}")
        print(f"   Time: {epoch_time:.2f}s")
        
        # Save best model
        if val_acc > best_val_accuracy:
            best_val_accuracy = val_acc
            model_path = paths["project_root"] / "best_model.pth"
            torch.save(model.state_dict(), model_path)
            print(f"   💾 Best model saved!")
    
    # Test
    print("\n" + "=" * 70)
    print("🧪 TESTING")
    print("=" * 70)
    
    test_accuracy = test_model(model, test_loader)
    print(f"\n✅ Test Accuracy: {test_accuracy:.4f}")
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ TRAINING COMPLETED")
    print("=" * 70)
    print(f"\nResults:")
    print(f"  Best Validation Accuracy: {best_val_accuracy:.4f}")
    print(f"  Test Accuracy: {test_accuracy:.4f}")
    print(f"  Best Model saved: {paths['project_root']}/best_model.pth")
    print("\n" + "=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Training interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
