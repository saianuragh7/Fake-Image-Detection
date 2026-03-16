/**
 * AI Fake Image Detector — script.js
 * Clean version: UI Layer + API Layer (no gravity physics)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM References ── */
    const $ = (sel) => document.querySelector(sel);

    const dropZone         = $('#drop-zone');
    const fileInput        = $('#file-input');
    const browseBtn        = $('#browse-btn');
    const dropContent      = $('#drop-content');
    const previewContainer = $('#preview-container');
    const imagePreview     = $('#image-preview');
    const removeBtn        = $('#remove-btn');
    const analyzeBtn       = $('#analyze-btn');
    const resultSection    = $('#result-section');
    const resultCard       = $('#result-card');
    const resultIcon       = $('#result-icon');
    const predictionResult = $('#prediction-result');
    const confidenceSection = $('#confidence-section');
    const confidenceValue  = $('#confidence-value');
    const confidenceBar    = $('#confidence-bar');

    let currentFile = null;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       UI LAYER — Upload & Preview
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    const triggerFileSelect = () => fileInput.click();

    dropZone.addEventListener('click', (e) => {
        if (!e.target.closest('#remove-btn')) triggerFileSelect();
    });
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileSelect(); }
    });
    browseBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerFileSelect(); });

    // Drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt =>
        dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); }, false)
    );
    ['dragenter', 'dragover'].forEach(evt =>
        dropZone.addEventListener(evt, () => dropZone.classList.add('dragover'), false)
    );
    ['dragleave', 'drop'].forEach(evt =>
        dropZone.addEventListener(evt, () => dropZone.classList.remove('dragover'), false)
    );

    dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    fileInput.addEventListener('change', function () { handleFiles(this.files); });

    function handleFiles(files) {
        if (!files.length) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file (PNG, JPG, WEBP).');
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        reader.onload = () => {
            imagePreview.src = reader.result;
            dropContent.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            analyzeBtn.disabled = false;
            resultSection.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        previewContainer.classList.add('hidden');
        dropContent.classList.remove('hidden');
        analyzeBtn.disabled = true;
        resultSection.classList.add('hidden');
    });

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       API LAYER — POST /predict
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        const btnText = analyzeBtn.querySelector('.btn-text');
        const spinner = analyzeBtn.querySelector('.spinner');

        analyzeBtn.disabled = true;
        btnText.textContent = 'Analyzing…';
        spinner.classList.remove('hidden');
        resultSection.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            displayResult(data.prediction, data.confidence);
        } catch (err) {
            console.error('Prediction error:', err);
            showError('Failed to analyze. Ensure backend is running at http://127.0.0.1:8000');
        } finally {
            btnText.textContent = 'Analyze Image';
            spinner.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    /* ── Display helpers ── */

    function displayResult(prediction, confidence) {
        resultSection.classList.remove('hidden');
        predictionResult.className = 'prediction-text';
        resultCard.className = 'result-card';

        const isFake = prediction.toLowerCase().includes('fake');
        const isReal = prediction.toLowerCase().includes('real');

        if (isFake) {
            predictionResult.classList.add('prediction-fake');
            resultCard.classList.add('result-fake');
            resultIcon.textContent = '⚠';
        } else if (isReal) {
            predictionResult.classList.add('prediction-real');
            resultCard.classList.add('result-real');
            resultIcon.textContent = '✓';
        }

        predictionResult.textContent = prediction;

        // Confidence
        if (confidence !== undefined && confidence !== null) {
            confidenceSection.classList.remove('hidden');
            const pct = typeof confidence === 'number'
                ? (confidence > 1 ? confidence : confidence * 100)
                : parseFloat(confidence);
            const rounded = Math.round(pct * 10) / 10;

            confidenceValue.textContent = `${rounded}%`;
            confidenceBar.className = 'confidence-bar';
            if (isFake) confidenceBar.classList.add('bar-danger');
            else if (isReal) confidenceBar.classList.add('bar-success');

            // Animate
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    confidenceBar.style.width = `${rounded}%`;
                });
            });
        } else {
            confidenceSection.classList.add('hidden');
        }
    }

    function showError(message) {
        resultSection.classList.remove('hidden');
        resultCard.className = 'result-card';
        resultIcon.textContent = '';
        predictionResult.className = 'prediction-text prediction-error';
        predictionResult.textContent = message;
        confidenceSection.classList.add('hidden');
    }
});
