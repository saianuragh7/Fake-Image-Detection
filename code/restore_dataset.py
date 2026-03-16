"""
Dataset Restoration Script
Restores images from train/val/test back to fake/real structure
for rebuilding with clean split
"""

import os
import shutil
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
DATASET_PATH = PROJECT_ROOT / "dataset"

# Image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}


# ============================================================================
# MAIN FUNCTION
# ============================================================================

def restore_dataset():
    """
    Restore images from split folders back to flat fake/real structure
    This is needed because the previous restructuring moved all files
    and we need them back in fake/real for clean re-splitting
    """
    
    print("\n" + "=" * 70)
    print("📂 DATASET RESTORATION (Recovery from split)")
    print("=" * 70)
    print(f"\nDataset Path: {DATASET_PATH}")
    
    # Check if flat structure already exists
    fake_dir = DATASET_PATH / "fake"
    real_dir = DATASET_PATH / "real"
    
    # Create fake/real directories if they don't exist
    fake_dir.mkdir(parents=True, exist_ok=True)
    real_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n📁 Created/verified fake/ and real/ directories")
    
    # Define source locations (split folders)
    split_sources = {
        "fake": [
            (DATASET_PATH / "train" / "fake", "train"),
            (DATASET_PATH / "val" / "fake", "val"),
            (DATASET_PATH / "test" / "fake", "test"),
        ],
        "real": [
            (DATASET_PATH / "train" / "real", "train"),
            (DATASET_PATH / "val" / "real", "val"),
            (DATASET_PATH / "test" / "real", "test"),
        ]
    }
    
    total_moved = 0
    
    print("\n" + "-" * 70)
    print("🚚 Restoring FAKE images")
    print("-" * 70)
    
    for source_dir, split_name in split_sources["fake"]:
        if not source_dir.exists():
            print(f"  ⏭️  {split_name}/fake: Not found")
            continue
        
        images = [f for f in source_dir.iterdir() if f.is_file() and f.suffix in IMAGE_EXTENSIONS]
        count = 0
        
        for image_path in images:
            try:
                target_path = fake_dir / image_path.name
                shutil.move(str(image_path), str(target_path))
                count += 1
            except Exception as e:
                print(f"    ⚠️  Error: {e}")
        
        print(f"  ✅ {split_name}/fake: {count} images restored")
        total_moved += count
    
    print("\n" + "-" * 70)
    print("🚚 Restoring REAL images")
    print("-" * 70)
    
    for source_dir, split_name in split_sources["real"]:
        if not source_dir.exists():
            print(f"  ⏭️  {split_name}/real: Not found")
            continue
        
        images = [f for f in source_dir.iterdir() if f.is_file() and f.suffix in IMAGE_EXTENSIONS]
        count = 0
        
        for image_path in images:
            try:
                target_path = real_dir / image_path.name
                shutil.move(str(image_path), str(target_path))
                count += 1
            except Exception as e:
                print(f"    ⚠️  Error: {e}")
        
        print(f"  ✅ {split_name}/real: {count} images restored")
        total_moved += count
    
    # Clean up empty split folders
    print("\n" + "-" * 70)
    print("🗑️  Cleaning up empty split folders")
    print("-" * 70)
    
    for folder in ["train", "val", "test"]:
        folder_path = DATASET_PATH / folder
        if folder_path.exists() and not any(folder_path.rglob("*")):
            shutil.rmtree(folder_path)
            print(f"  ✅ Deleted: {folder}/")
    
    # Verify results
    print("\n" + "=" * 70)
    print("✅ RESTORATION COMPLETE")
    print("=" * 70)
    
    fake_images = len([f for f in fake_dir.iterdir() if f.is_file() and f.suffix in IMAGE_EXTENSIONS])
    real_images = len([f for f in real_dir.iterdir() if f.is_file() and f.suffix in IMAGE_EXTENSIONS])
    
    print(f"\n📊 Current structure:")
    print(f"   fake/: {fake_images} images")
    print(f"   real/: {real_images} images")
    print(f"   Total: {fake_images + real_images} images")
    
    if fake_images > 0 and real_images > 0:
        print(f"\n✅ Ready to rebuild split!")
        print(f"   Run: python code\\rebuild_dataset_split.py")
        return True
    else:
        print(f"\n⚠️  No images found!")
        return False


if __name__ == "__main__":
    try:
        restore_dataset()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
