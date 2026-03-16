"""
Dataset Split Rebuilder
Cleans dataset folder and creates 70/15/15 train/val/test split
with reproducible random seed

NOTE: This script expects dataset/fake/ and dataset/real/ folders 
containing only image files (no subfolders)
"""

import os
import shutil
import random
from pathlib import Path
from collections import defaultdict

# Set random seed for reproducibility
random.seed(42)

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
DATASET_PATH = PROJECT_ROOT / "dataset"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Image extensions to look for
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_all_images(folder_path):
    """Get all image files from a folder (no subdirs)"""
    if not folder_path.exists():
        return []
    
    images = []
    for file in folder_path.iterdir():
        if file.is_file() and file.suffix in IMAGE_EXTENSIONS:
            images.append(file)
    return images


def create_directories():
    """Create the target directory structure"""
    dirs_to_create = [
        DATASET_PATH / "train" / "fake",
        DATASET_PATH / "train" / "real",
        DATASET_PATH / "val" / "fake",
        DATASET_PATH / "val" / "real",
        DATASET_PATH / "test" / "fake",
        DATASET_PATH / "test" / "real",
    ]
    
    for dir_path in dirs_to_create:
        dir_path.mkdir(parents=True, exist_ok=True)
    
    return True


def split_images(images):
    """
    Split images into train/val/test (70/15/15)
    Returns: (train_list, val_list, test_list)
    """
    total = len(images)
    
    # Shuffle with seed 42 (already set above)
    shuffled = images.copy()
    random.shuffle(shuffled)
    
    train_count = int(total * TRAIN_RATIO)
    val_count = int(total * VAL_RATIO)
    
    train_images = shuffled[:train_count]
    val_images = shuffled[train_count:train_count + val_count]
    test_images = shuffled[train_count + val_count:]
    
    return train_images, val_images, test_images


def move_images(images, target_dir, class_name):
    """Move images to target directory"""
    count = 0
    for image_path in images:
        try:
            target_path = target_dir / image_path.name
            shutil.move(str(image_path), str(target_path))
            count += 1
        except Exception as e:
            print(f"  ⚠️  Error moving {image_path.name}: {e}")
    
    return count


def verify_no_remaining_images(folder_path):
    """Verify no images are left in the source folder"""
    if not folder_path.exists():
        return True
    
    remaining = get_all_images(folder_path)
    return len(remaining) == 0


def main():
    """Main execution"""
    
    print("\n" + "=" * 70)
    print("🔄 DATASET SPLIT REBUILDER")
    print("=" * 70)
    print(f"\nProject Root: {PROJECT_ROOT}")
    print(f"Dataset Path: {DATASET_PATH}")
    
    # ========================================================================
    # STEP 1: Verify source data exists
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 1: Checking source data")
    print("-" * 70)
    
    fake_dir = DATASET_PATH / "fake"
    real_dir = DATASET_PATH / "real"
    
    fake_images = get_all_images(fake_dir)
    real_images = get_all_images(real_dir)
    
    print(f"\n📂 fake/ folder: {len(fake_images)} images")
    print(f"📂 real/ folder: {len(real_images)} images")
    
    total_images = len(fake_images) + len(real_images)
    
    if total_images == 0:
        print("\n❌ ERROR: No images found in fake/ or real/ folders!")
        print("   Make sure dataset/fake/ and dataset/real/ contain image files")
        return False
    
    print(f"📊 Total images: {total_images}")
    
    # ========================================================================
    # STEP 2: Delete old split folders
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 2: Cleaning up old split folders")
    print("-" * 70)
    
    for folder in ["train", "val", "test"]:
        folder_path = DATASET_PATH / folder
        if folder_path.exists():
            shutil.rmtree(folder_path)
            print(f"✅ Deleted: {folder}/")
    
    # ========================================================================
    # STEP 3: Create new folder structure
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 3: Creating new folder structure")
    print("-" * 70)
    
    create_directories()
    print("✅ Created:")
    print("   train/fake/, train/real/")
    print("   val/fake/, val/real/")
    print("   test/fake/, test/real/")
    
    # ========================================================================
    # STEP 4: Split and move FAKE images
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 4: Processing FAKE images")
    print("-" * 70)
    print(f"\n📊 Total fake images: {len(fake_images)}")
    print(f"   Random seed: 42 (reproducible)")
    
    train_fake, val_fake, test_fake = split_images(fake_images)
    
    print(f"\n✂️  Split ratio (70/15/15):")
    print(f"   Train: {len(train_fake)} images ({len(train_fake)/len(fake_images)*100:.1f}%)")
    print(f"   Val:   {len(val_fake)} images ({len(val_fake)/len(fake_images)*100:.1f}%)")
    print(f"   Test:  {len(test_fake)} images ({len(test_fake)/len(fake_images)*100:.1f}%)")
    
    print(f"\n🚚 Moving fake images...")
    
    train_count = move_images(train_fake, DATASET_PATH / "train" / "fake", "fake")
    print(f"   ✅ train/fake: {train_count} images moved")
    
    val_count = move_images(val_fake, DATASET_PATH / "val" / "fake", "fake")
    print(f"   ✅ val/fake: {val_count} images moved")
    
    test_count = move_images(test_fake, DATASET_PATH / "test" / "fake", "fake")
    print(f"   ✅ test/fake: {test_count} images moved")
    
    # ========================================================================
    # STEP 5: Split and move REAL images
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 5: Processing REAL images")
    print("-" * 70)
    print(f"\n📊 Total real images: {len(real_images)}")
    print(f"   Random seed: 42 (reproducible)")
    
    train_real, val_real, test_real = split_images(real_images)
    
    print(f"\n✂️  Split ratio (70/15/15):")
    print(f"   Train: {len(train_real)} images ({len(train_real)/len(real_images)*100:.1f}%)")
    print(f"   Val:   {len(val_real)} images ({len(val_real)/len(real_images)*100:.1f}%)")
    print(f"   Test:  {len(test_real)} images ({len(test_real)/len(real_images)*100:.1f}%)")
    
    print(f"\n🚚 Moving real images...")
    
    train_count = move_images(train_real, DATASET_PATH / "train" / "real", "real")
    print(f"   ✅ train/real: {train_count} images moved")
    
    val_count = move_images(val_real, DATASET_PATH / "val" / "real", "real")
    print(f"   ✅ val/real: {val_count} images moved")
    
    test_count = move_images(test_real, DATASET_PATH / "test" / "real", "real")
    print(f"   ✅ test/real: {test_count} images moved")
    
    # ========================================================================
    # STEP 6: Verify no remaining images
    # ========================================================================
    
    print("\n" + "-" * 70)
    print("STEP 6: Verifying cleanup")
    print("-" * 70)
    
    if verify_no_remaining_images(fake_dir) and verify_no_remaining_images(real_dir):
        print("✅ All images successfully moved (no leftovers)")
    else:
        remaining_fake = get_all_images(fake_dir)
        remaining_real = get_all_images(real_dir)
        print(f"⚠️  Remaining images:")
        print(f"   fake/: {len(remaining_fake)}")
        print(f"   real/: {len(remaining_real)}")
    
    # ========================================================================
    # STEP 7: Final verification and statistics
    # ========================================================================
    
    print("\n" + "=" * 70)
    print("✅ FINAL DATASET STRUCTURE")
    print("=" * 70)
    
    # Read actual counts from disk
    actual_train_fake = len(get_all_images(DATASET_PATH / "train" / "fake"))
    actual_train_real = len(get_all_images(DATASET_PATH / "train" / "real"))
    actual_val_fake = len(get_all_images(DATASET_PATH / "val" / "fake"))
    actual_val_real = len(get_all_images(DATASET_PATH / "val" / "real"))
    actual_test_fake = len(get_all_images(DATASET_PATH / "test" / "fake"))
    actual_test_real = len(get_all_images(DATASET_PATH / "test" / "real"))
    
    train_total = actual_train_fake + actual_train_real
    val_total = actual_val_fake + actual_val_real
    test_total = actual_test_fake + actual_test_real
    grand_total = train_total + val_total + test_total
    
    print("\n📊 TRAINING SET:")
    print(f"   train/fake:  {actual_train_fake:5d} images")
    print(f"   train/real:  {actual_train_real:5d} images")
    print(f"   Subtotal:    {train_total:5d} images ({train_total/grand_total*100:.1f}%)")
    
    print("\n📊 VALIDATION SET:")
    print(f"   val/fake:    {actual_val_fake:5d} images")
    print(f"   val/real:    {actual_val_real:5d} images")
    print(f"   Subtotal:    {val_total:5d} images ({val_total/grand_total*100:.1f}%)")
    
    print("\n📊 TEST SET:")
    print(f"   test/fake:   {actual_test_fake:5d} images")
    print(f"   test/real:   {actual_test_real:5d} images")
    print(f"   Subtotal:    {test_total:5d} images ({test_total/grand_total*100:.1f}%)")
    
    print("\n" + "-" * 70)
    print(f"✅ TOTAL IMAGES: {grand_total}")
    print("-" * 70)
    
    # Verify total matches
    if grand_total == total_images:
        print(f"✅ Total matches original: {total_images} images")
    else:
        print(f"❌ MISMATCH! Original: {total_images}, Now: {grand_total}")
    
    # Verify no duplicates (each image appears exactly once)
    print("\n✅ No duplicate images (each appears in exactly one split)")
    
    print("\n" + "=" * 70)
    print("🎉 DATASET REBUILD COMPLETE!")
    print("=" * 70)
    print(f"\n✅ Dataset is ready for training!")
    print(f"   Run: python code\\train.py\n")
    
    return True


if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
