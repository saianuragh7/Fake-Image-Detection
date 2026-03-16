# QUICK START GUIDE - Real vs Fake Face Detection

## 📋 What You Have

Three new files created in `D:\FAKEIMAGEPROJECT\code\`:

| File | Purpose |
|------|---------|
| `restructure_dataset.py` | Reorganizes dataset from `fake/training_fake` → `train/fake` |
| `train.py` | Trains ResNet18 model for real/fake classification |
| `EXECUTION_GUIDE.txt` | Detailed step-by-step instructions |

---

## ⚡ Quick Start (3 Steps)

### Step 1: Open PowerShell
```powershell
# Windows key + type "PowerShell"
```

### Step 2: Restructure Dataset (One-time setup)
```powershell
cd D:\FAKEIMAGEPROJECT
python code\restructure_dataset.py
# When prompted: type "yes" and press Enter
```

**Expected result:**
```
✅ Restructuring completed successfully!
Final Dataset Structure:
  train/fake        500 images
  train/real        500 images
  val/fake          100 images
  val/real          100 images
  test/fake          50 images
  test/real          50 images
```

### Step 3: Train the Model
```powershell
python code\train.py
```

**Expected result after 5 epochs (~25-50 minutes on CPU):**
```
Epoch 5/5
   Training   Loss: 0.3456, Accuracy: 0.8234
   Validation Loss: 0.3678, Accuracy: 0.8156
   Time: 48.32s

✅ Test Accuracy: 0.8150
✅ Best Model saved: best_model.pth
```

---

## 🔧 Key Features

| Feature | Details |
|---------|---------|
| **Architecture** | ResNet18 (pretrained on ImageNet) |
| **Task** | Binary classification (Real vs Fake) |
| **Loss Function** | BCEWithLogitsLoss |
| **Optimizer** | Adam (lr=0.001) |
| **Batch Size** | 32 |
| **Epochs** | 5 |
| **Image Size** | 224×224 |
| **Augmentation** | Random flip, rotation, color jitter |
| **Device** | Auto-detect (GPU if available, else CPU) |

---

## 📊 Understanding Your Dataset Structure

### Before Restructuring
```
dataset/
├── fake/
│   ├── training_fake/   ← Images here
│   ├── test/            ← Images here
│   └── Validation/      ← Images here
└── real/
    ├── train/           ← Images here
    ├── test/            ← Images here
    └── Validation/      ← Images here
```

### After Restructuring
```
dataset/
├── train/               ← 1000 images (training)
│   ├── fake/            (500 fake images)
│   └── real/            (500 real images)
├── val/                 ← 200 images (validation)
│   ├── fake/            (100 fake images)
│   └── real/            (100 real images)
└── test/                ← 100 images (testing)
    ├── fake/            (50 fake images)
    └── real/            (50 real images)
```

---

## ✅ Verification Checklist

- [ ] Python 3.13 installed: `python --version`
- [ ] PyTorch installed: `python -c "import torch; print(torch.__version__)"`
- [ ] Current folder: `D:\FAKEIMAGEPROJECT`
- [ ] Dataset folder exists: `dataset/fake/training_fake/` has images
- [ ] Both scripts exist: `code/restructure_dataset.py` and `code/train.py`

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| `No module named 'torch'` | Run: `pip install torch torchvision` |
| `Missing required directories` | Run: `python code\restructure_dataset.py` |
| `Runs very slowly` | Normal on CPU. CPU training takes 5-10min/epoch |
| `Out of Memory` | Reduce batch size in `train.py` (BATCH_SIZE = 16) |
| `KeyboardInterrupt` (Ctrl+C) | Safe to stop. Run again to continue |

---

## 📁 File Paths Reference

```
D:\FAKEIMAGEPROJECT/
├── code/
│   ├── restructure_dataset.py   ← Run this first
│   ├── train.py                 ← Run this second
│   ├── mytest123.py
│   └── test.py
├── dataset/
│   ├── train/
│   ├── val/
│   └── test/
└── best_model.pth               ← Your trained model (created after training)
```

---

## 🎓 What Each Script Does

### `restructure_dataset.py`
1. Validates current dataset structure
2. Creates new `train/val/test` directories
3. Moves images from old structure to new structure
4. Prints statistics
5. Verifies final structure

**Run once:** `python code\restructure_dataset.py`

### `train.py`
1. Validates dataset structure exists
2. Loads all datasets (train/val/test)
3. Creates ResNet18 model with binary output
4. Trains for 5 epochs with validation
5. Saves best model to `best_model.pth`
6. Tests on test set
7. Prints accuracy metrics

**Run:** `python code\train.py`

---

## 💡 Tips for Windows PowerShell

✅ **Always run from project root:**
```powershell
cd D:\FAKEIMAGEPROJECT
python code\train.py
```

❌ **Don't do this:**
```powershell
cd D:\FAKEIMAGEPROJECT\code
python train.py    # This will cause path errors!
```

---

## 🚀 Next Steps

After training completes:

1. **Review Results** - Check printed accuracy metrics
2. **Save Model** - `best_model.pth` is already saved
3. **Improve** - Adjust hyperparameters in `train.py` and retrain
4. **Deploy** - Load model and use for predictions on new images

---

## 📞 Common Questions

**Q: Why does it take so long on CPU?**
A: ResNet18 training on CPU is slower. Each epoch takes 5-10 minutes. For faster training, use a GPU.

**Q: Can I stop training and resume later?**
A: The current script doesn't support resuming. Run it again to start fresh.

**Q: How do I use the trained model?**
A: Load `best_model.pth` and run inference. Create a `predict.py` script (ask for help).

**Q: What if my accuracy is low?**
A: Try: more epochs, more data, different learning rate, better image preprocessing.

**Q: Can I use GPU?**
A: Yes! The script auto-detects CUDA. Install `torch` with CUDA support for GPU training.

---

## 📚 Learn More

Check `EXECUTION_GUIDE.txt` for:
- Detailed explanation of each script
- How working directory affects relative paths
- Best practices for path handling
- Troubleshooting guide with solutions

---

**Ready to start?** Copy-paste this into PowerShell:

```powershell
cd D:\FAKEIMAGEPROJECT; python code\restructure_dataset.py
```
