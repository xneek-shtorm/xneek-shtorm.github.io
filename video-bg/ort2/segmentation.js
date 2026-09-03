import * as ort from 'onnxruntime-web';

// Configuration
const CONFIG = {
    inputWidth: 256,
    inputHeight: 256,
    outputWidth: 640,
    outputHeight: 480,
    threshold: 0.5,
    blurAmount: 20,
    modelPath: 'mediapipe_selfie.onnx'
};

// DOM Elements
const outputCanvas = document.getElementById('output');
const ctx = outputCanvas.getContext('2d');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggleBtn');
const blurBtn = document.getElementById('blurBtn');

// State
let session = null;
let video = null;
let isRunning = false;
let useBlur = true;
let animationId = null;

// 1. Load Model
async function loadModel() {
    try {
        statusEl.textContent = 'Loading model...';
        
        // Configure ONNX Runtime for WebGL acceleration
        ort.env.wasm.numThreads = 4;
        ort.env.wasm.simd = true;
        
        // Try WebGL first, fallback to WASM
        try {
            await ort.InferenceSession.create(CONFIG.modelPath, {
                executionProviders: ['webgl', 'wasm']
            });
        } catch (e) {
            console.warn('WebGL not available, using WASM');
        }
        
        session = await ort.InferenceSession.create(CONFIG.modelPath, {
            executionProviders: ['webgl', 'wasm']
        });
        
        statusEl.textContent = 'Model loaded ✓';
        return true;
    } catch (error) {
        console.error('Failed to load model:', error);
        statusEl.textContent = 'Error loading model';
        return false;
    }
}

// 2. Setup Webcam
async function setupWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: CONFIG.inputWidth,
                height: CONFIG.inputHeight,
                facingMode: 'user'
            },
            audio: false
        });

        video = document.createElement('video');
        video.width = CONFIG.inputWidth;
        video.height = CONFIG.inputHeight;
        video.srcObject = stream;
        await video.play();
        
        statusEl.textContent = 'Webcam ready ✓';
        return true;
    } catch (error) {
        console.error('Webcam error:', error);
        statusEl.textContent = 'Webcam not accessible';
        return false;
    }
}

// 3. Preprocess Frame
function preprocess(video) {
    // Create temporary canvas for preprocessing
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.inputWidth;
    canvas.height = CONFIG.inputHeight;
    const tempCtx = canvas.getContext('2d');
    
    // Draw video frame with flipped horizontally for selfie view
    tempCtx.save();
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, -CONFIG.inputWidth, 0, CONFIG.inputWidth, CONFIG.inputHeight);
    tempCtx.restore();

    const imgData = tempCtx.getImageData(0, 0, CONFIG.inputWidth, CONFIG.inputHeight);
    const data = imgData.data;
    const pixelCount = CONFIG.inputWidth * CONFIG.inputHeight;
    
    // Normalize and separate channels (RGB)
    const red = new Float32Array(pixelCount);
    const green = new Float32Array(pixelCount);
    const blue = new Float32Array(pixelCount);

    for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        red[idx] = data[i] / 255.0;
        green[idx] = data[i + 1] / 255.0;
        blue[idx] = data[i + 2] / 255.0;
    }

    // Create CHW format: [1, 3, H, W]
    const flatArray = new Float32Array(3 * pixelCount);
    flatArray.set(red);
    flatArray.set(green, pixelCount);
    flatArray.set(blue, 2 * pixelCount);

    return new ort.Tensor('float32', flatArray, [1, 3, CONFIG.inputHeight, CONFIG.inputWidth]);
}

// 4. Postprocess and Render
function renderMask(video, maskData, useBlur) {
    // Resize mask to output dimensions
    const maskWidth = CONFIG.inputWidth;
    const maskHeight = CONFIG.inputHeight;
    
    // Create temporary canvas for mask resizing
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = CONFIG.outputWidth;
    maskCanvas.height = CONFIG.outputHeight;
    const maskCtx = maskCanvas.getContext('2d');
    
    // Draw mask as image data
    const imageData = maskCtx.createImageData(maskWidth, maskHeight);
    const data = imageData.data;
    
    // Convert mask to image data (grayscale)
    for (let i = 0; i < maskData.length; i++) {
        const idx = i * 4;
        const value = maskData[i] * 255;
        data[idx] = value;     // R
        data[idx + 1] = value; // G
        data[idx + 2] = value; // B
        data[idx + 3] = 255;   // A
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = maskWidth;
    tempCanvas.height = maskHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Resize mask to output size
    maskCtx.drawImage(tempCanvas, 0, 0, CONFIG.outputWidth, CONFIG.outputHeight);
    
    // Get the resized mask data
    const maskImageData = maskCtx.getImageData(0, 0, CONFIG.outputWidth, CONFIG.outputHeight);
    const maskPixels = maskImageData.data;

    // Draw original video frame on output canvas (flipped for selfie view)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -CONFIG.outputWidth, 0, CONFIG.outputWidth, CONFIG.outputHeight);
    ctx.restore();
    
    // Apply mask
    const outputImageData = ctx.getImageData(0, 0, CONFIG.outputWidth, CONFIG.outputHeight);
    const outputPixels = outputImageData.data;

    for (let i = 0; i < maskPixels.length; i += 4) {
        const maskValue = maskPixels[i] / 255.0; // 0-1
        
        if (useBlur) {
            // Apply blur effect for background
            const blurFactor = 1 - maskValue;
            if (blurFactor > 0.1) {
                // Simple blur simulation (in practice, you'd use proper blur)
                outputPixels[i] *= (1 - blurFactor * 0.7);
                outputPixels[i + 1] *= (1 - blurFactor * 0.7);
                outputPixels[i + 2] *= (1 - blurFactor * 0.7);
            }
        } else {
            // Replace background with color
            const bgColor = [100, 150, 200]; // Blue background
            const alpha = 1 - maskValue;
            outputPixels[i] = outputPixels[i] * maskValue + bgColor[0] * alpha;
            outputPixels[i + 1] = outputPixels[i + 1] * maskValue + bgColor[1] * alpha;
            outputPixels[i + 2] = outputPixels[i + 2] * maskValue + bgColor[2] * alpha;
        }
    }

    ctx.putImageData(outputImageData, 0, 0);
}

// 5. Main Processing Loop
async function processFrame() {
    if (!isRunning || !session || !video) return;

    try {
        // Preprocess
        const inputTensor = preprocess(video);
        
        // Run inference
        const feeds = {};
        feeds[session.inputNames[0]] = inputTensor;
        const results = await session.run(feeds);
        
        // Get mask
        const outputName = session.outputNames[0];
        const outputTensor = results[outputName];
        const maskData = outputTensor.data;
        
        // Render
        renderMask(video, maskData, useBlur);
        
    } catch (error) {
        console.error('Processing error:', error);
    }

    // Continue loop
    animationId = requestAnimationFrame(processFrame);
}

// 6. Control Functions
async function startSegmentation() {
    if (isRunning) return;
    
    const modelLoaded = await loadModel();
    if (!modelLoaded) return;
    
    const webcamReady = await setupWebcam();
    if (!webcamReady) return;
    
    isRunning = true;
    toggleBtn.textContent = 'Stop';
    statusEl.textContent = 'Running...';
    
    processFrame();
}

function stopSegmentation() {
    isRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video = null;
    }
    toggleBtn.textContent = 'Start';
    statusEl.textContent = 'Stopped';
}

function toggleSegmentation() {
    if (isRunning) {
        stopSegmentation();
    } else {
        startSegmentation();
    }
}

function toggleBlur() {
    useBlur = !useBlur;
    blurBtn.textContent = useBlur ? 'Disable Blur' : 'Enable Blur';
}

// 7. Event Listeners
toggleBtn.addEventListener('click', toggleSegmentation);
blurBtn.addEventListener('click', toggleBlur);

// 8. Initial State
statusEl.textContent = 'Click Start to begin';

// Console helpers for debugging
console.log('Selfie Segmentation loaded!');
console.log('Controls: Start/Stop, Toggle Blur');