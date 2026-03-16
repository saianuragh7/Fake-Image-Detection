"""
PyTorch Training Script - Clean Implementation
Handles path confusion using absolute paths based on script location
"""

import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from pathlib import Path
import sys

# ============================================================================
# CRITICAL: Use absolute paths to avoid working directory confusion
# ============================================================================

# Get the directory where THIS script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
print(f"Script location: {SCRIPT_DIR}")

# Navigate to project root (parent of code directory)
PROJECT_ROOT = SCRIPT_DIR.parent
print(f"Project root: {PROJECT_ROOT}")

# Define absolute path to dataset
DATASET_PATH = PROJECT_ROOT / "dataset"
print(f"Dataset path: {DATASET_PATH}")

# Verify dataset exists
if not DATASET_PATH.exists():
    print(f"❌ ERROR: Dataset path does not exist: {DATASET_PATH}")
    sys.exit(1)

# ============================================================================
# Define Image Transformations
# ============================================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ============================================================================
# Load Dataset
# ============================================================================

print("\n📊 Loading dataset...")

try:
    train_dataset = datasets.ImageFolder(
        root=str(DATASET_PATH),  # Convert Path to string
        transform=transform
    )
    print(f"✅ Dataset loaded successfully!")
    print(f"   Classes: {train_dataset.classes}")
    print(f"   Total images: {len(train_dataset)}")
    
except Exception as e:
    print(f"❌ ERROR loading dataset: {e}")
    print(f"\nDEBUG INFO:")
    print(f"  Checking dataset structure...")
    for item in DATASET_PATH.iterdir():
        print(f"    - {item.name}/")
        if item.is_dir():
            for subitem in item.iterdir():
                print(f"      - {subitem.name}/")
    sys.exit(1)

# ============================================================================
# Create DataLoader
# ============================================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=0  # Set to 0 on Windows to avoid multiprocessing issues
)

print(f"\n📦 DataLoader created")
print(f"   Batch size: 32")
print(f"   Total batches: {len(train_loader)}")

# ============================================================================
# Test DataLoader
# ============================================================================

print("\n🧪 Testing DataLoader...")
try:
    sample_images, sample_labels = next(iter(train_loader))
    print(f"✅ Successfully loaded batch!")
    print(f"   Image tensor shape: {sample_images.shape}")
    print(f"   Label tensor shape: {sample_labels.shape}")
except Exception as e:
    print(f"❌ ERROR loading batch: {e}")
    sys.exit(1)

print("\n✅ All checks passed! Ready for training.")
