"""
Dataset Restructuring Script
Reorganizes the current dataset structure into train/val/test splits with fake/real classes

Current Structure:
  dataset/
  ├── fake/
  │   ├── training_fake/
  │   ├── test/
  │   └── Validation/
  └── real/
      ├── train/
      ├── test/
      └── Validation/

Target Structure:
  dataset/
  ├── train/
  │   ├── fake/
  │   └── real/
  ├── val/
  │   ├── fake/
  │   └── real/
  └── test/
      ├── fake/
      └── real/
"""

from pathlib import Path
import shutil
import sys
from collections import defaultdict

def restructure_dataset():
    """Restructure dataset from current format to train/val/test split"""
    
    # Get absolute paths
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent
    dataset_path = project_root / "dataset"
    
    print("=" * 70)
    print("🔄 DATASET RESTRUCTURING SCRIPT")
    print("=" * 70)
    print(f"\n📍 Project Root: {project_root}")
    print(f"📍 Dataset Path: {dataset_path}")
    
    # Validate current structure exists
    if not dataset_path.exists():
        print(f"\n❌ ERROR: Dataset path does not exist: {dataset_path}")
        return False
    
    # Define source and target directories
    source_dirs = {
        "fake_training": dataset_path / "fake" / "training_fake",
        "fake_test": dataset_path / "fake" / "test",
        "fake_val": dataset_path / "fake" / "Validation",
        "real_train": dataset_path / "real" / "train",
        "real_test": dataset_path / "real" / "test",
        "real_val": dataset_path / "real" / "Validation",
    }
    
    # Define target directories
    target_dirs = {
        "train_fake": dataset_path / "train" / "fake",
        "train_real": dataset_path / "train" / "real",
        "val_fake": dataset_path / "val" / "fake",
        "val_real": dataset_path / "val" / "real",
        "test_fake": dataset_path / "test" / "fake",
        "test_real": dataset_path / "test" / "real",
    }
    
    # Verify source directories exist
    print("\n📂 Checking source directories...")
    missing_sources = []
    for name, path in source_dirs.items():
        if path.exists():
            image_count = len(list(path.glob("*.*")))
            print(f"   ✅ {name}: {image_count} images")
        else:
            print(f"   ⚠️  {name}: NOT FOUND")
            missing_sources.append(name)
    
    if missing_sources:
        print(f"\n⚠️  Some source directories are missing: {missing_sources}")
        print("    Proceeding with available directories...")
    
    # Ask for confirmation
    print("\n" + "=" * 70)
    print("📋 RESTRUCTURING PLAN:")
    print("=" * 70)
    print("  fake/training_fake → train/fake")
    print("  fake/Validation    → val/fake")
    print("  fake/test          → test/fake")
    print("  real/train         → train/real")
    print("  real/Validation    → val/real")
    print("  real/test          → test/real")
    
    response = input("\n⚠️  Continue with restructuring? (yes/no): ").strip().lower()
    if response not in ["yes", "y"]:
        print("\n❌ Restructuring cancelled.")
        return False
    
    # Create target directories
    print("\n📁 Creating target directories...")
    for name, path in target_dirs.items():
        path.mkdir(parents=True, exist_ok=True)
        print(f"   ✅ Created: {path.name}")
    
    # Track statistics
    stats = defaultdict(int)
    
    # Move files
    print("\n📦 Moving files...")
    print("-" * 70)
    
    # Fake images
    move_operations = [
        (source_dirs["fake_training"], target_dirs["train_fake"], "TRAIN/FAKE"),
        (source_dirs["fake_val"], target_dirs["val_fake"], "VAL/FAKE"),
        (source_dirs["fake_test"], target_dirs["test_fake"], "TEST/FAKE"),
        (source_dirs["real_train"], target_dirs["train_real"], "TRAIN/REAL"),
        (source_dirs["real_val"], target_dirs["val_real"], "VAL/REAL"),
        (source_dirs["real_test"], target_dirs["test_real"], "TEST/REAL"),
    ]
    
    for src, dst, label in move_operations:
        if not src.exists():
            print(f"   ⏭️  {label}: Source not found, skipping")
            continue
        
        images = list(src.glob("*.*"))
        if not images:
            print(f"   ⏭️  {label}: No images found, skipping")
            continue
        
        count = 0
        for image_file in images:
            try:
                # Avoid overwriting
                dst_file = dst / image_file.name
                if dst_file.exists():
                    # Rename to avoid conflict
                    stem = image_file.stem
                    suffix = image_file.suffix
                    counter = 1
                    while dst_file.exists():
                        dst_file = dst / f"{stem}_{counter}{suffix}"
                        counter += 1
                
                shutil.move(str(image_file), str(dst_file))
                count += 1
                stats[label] += 1
            except Exception as e:
                print(f"   ❌ Error moving {image_file.name}: {e}")
        
        print(f"   ✅ {label}: {count} images moved")
    
    # Print final statistics
    print("\n" + "=" * 70)
    print("📊 RESTRUCTURING SUMMARY")
    print("=" * 70)
    total_images = sum(stats.values())
    print(f"\nTotal images moved: {total_images}\n")
    
    for split in ["TRAIN", "VAL", "TEST"]:
        fake_count = stats[f"{split}/FAKE"]
        real_count = stats[f"{split}/REAL"]
        print(f"{split:5} | Fake: {fake_count:4} | Real: {real_count:4}")
    
    # Verify final structure
    print("\n" + "=" * 70)
    print("✅ FINAL DATASET STRUCTURE")
    print("=" * 70)
    
    final_structure = {
        "train/fake": len(list((dataset_path / "train" / "fake").glob("*.*"))),
        "train/real": len(list((dataset_path / "train" / "real").glob("*.*"))),
        "val/fake": len(list((dataset_path / "val" / "fake").glob("*.*"))),
        "val/real": len(list((dataset_path / "val" / "real").glob("*.*"))),
        "test/fake": len(list((dataset_path / "test" / "fake").glob("*.*"))),
        "test/real": len(list((dataset_path / "test" / "real").glob("*.*"))),
    }
    
    print("\nDataset Structure:")
    for path, count in final_structure.items():
        print(f"  {path:15} {count:4} images")
    
    print("\n" + "=" * 70)
    print("✅ Restructuring completed successfully!")
    print("=" * 70)
    print("\n💡 Next step: Run 'python train.py' to start training")
    
    return True


if __name__ == "__main__":
    try:
        success = restructure_dataset()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
