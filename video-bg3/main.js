import { FilesetResolver, ImageSegmenter } from "./@mediapipe/tasks-vision/vision_bundle.mjs";

// === Константы и конфигурация ===
const W = 1280, H = 720;
const ALPHA = 0.4; // Коэффициент EMA для временного сглаживания
const THRESHOLD = 0.35; // Порог бинаризации (0.0 - 1.0)

// === DOM элементы ===
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const bgUpload = document.getElementById('bgUpload');

// === Оффскрин canvas'ы ===
const videoCanvas = document.createElement('canvas');
videoCanvas.width = W; videoCanvas.height = H;
const videoCtx = videoCanvas.getContext('2d', { willReadFrequently: true });

const maskCanvas = document.createElement('canvas');
maskCanvas.width = W; maskCanvas.height = H;
const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

// Canvas для низкоразмерной маски от MediaPipe (256x256)
const rawMaskCanvas = document.createElement('canvas');
rawMaskCanvas.width = 256; rawMaskCanvas.height = 256;
const rawMaskCtx = rawMaskCanvas.getContext('2d', { willReadFrequently: true });
const rawMaskData = rawMaskCtx.createImageData(256, 256);

// === Буферы для обработки маски ===
let prevMask = new Float32Array(W * H); // Теперь хранит значения от 0.0 до 1.0
let currentMask = new Uint8Array(W * H);
let tempMask1 = new Uint8Array(W * H);
let tempMask2 = new Uint8Array(W * H);

let bgImage = new Image();
bgImage.src = './background.jpg';

// === Обработка смены фона ===
bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => { bgImage = img; };
        img.src = URL.createObjectURL(file);
    }
});

// === Функции морфологии (сепарабельные 3x3) ===
function dilate(src, dst) {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = y * W + x;
            let max = src[i];
            if (x > 0) max = Math.max(max, src[i - 1]);
            if (x < W - 1) max = Math.max(max, src[i + 1]);
            tempMask1[i] = max;
        }
    }
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = y * W + x;
            let max = tempMask1[i];
            if (y > 0) max = Math.max(max, tempMask1[i - W]);
            if (y < H - 1) max = Math.max(max, tempMask1[i + W]);
            dst[i] = max;
        }
    }
}

function erode(src, dst) {
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = y * W + x;
            let min = src[i];
            if (x > 0) min = Math.min(min, src[i - 1]);
            if (x < W - 1) min = Math.min(min, src[i + 1]);
            tempMask1[i] = min;
        }
    }
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const i = y * W + x;
            let min = tempMask1[i];
            if (y > 0) min = Math.min(min, tempMask1[i - W]);
            if (y < H - 1) min = Math.min(min, tempMask1[i + W]);
            dst[i] = min;
        }
    }
}

// === Инициализация MediaPipe ===
async function initSegmenter() {
    const vision = await FilesetResolver.forVisionTasks("./@mediapipe/tasks-vision/wasm");
    return await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "./selfie_segmenter.tflite",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        outputCategoryMask: true
    });
}

let segmenter = null;
let isProcessing = false;
let lastVideoTime = -1;

// === Главный цикл рендера ===
function renderLoop() {
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime && !isProcessing) {
        isProcessing = true;
        lastVideoTime = video.currentTime;
        const now = performance.now();
        segmenter.segmentForVideo(video, now, onSegmentationResult);
    }
    requestAnimationFrame(renderLoop);
}

// === Колбэк сегментации ===
function onSegmentationResult(result) {
    // 1. Извлекаем маску (256x256)
    const maskArray = result.categoryMask.getAsFloat32Array();
    const maskLen = maskArray.length;
    
    for (let i = 0; i < maskLen; i++) {
        const val = maskArray[i] * 255; // 0 (фон) или 255 (человек)
        rawMaskData.data[i * 4] = val;
        rawMaskData.data[i * 4 + 1] = val;
        rawMaskData.data[i * 4 + 2] = val;
        rawMaskData.data[i * 4 + 3] = 255;
    }
    rawMaskCtx.putImageData(rawMaskData, 0, 0);

    // 2. Масштабируем маску на 1280x720 с размытием
    maskCtx.clearRect(0, 0, W, H);
    maskCtx.filter = 'blur(3px)'; 
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.drawImage(rawMaskCanvas, 0, 0, W, H);
    maskCtx.filter = 'none';

    // 3. Читаем пиксели
    const maskPx = maskCtx.getImageData(0, 0, W, H).data;
    videoCtx.drawImage(video, 0, 0, W, H);
    const vidData = videoCtx.getImageData(0, 0, W, H);
    const vidPx = vidData.data;

    // 4. Обработка маски (EMA в диапазоне 0.0 - 1.0)
    for (let i = 0; i < W * H; i++) {
        let m = maskPx[i * 4] / 255.0; // Нормализуем
        
        // Временное сглаживание
        m = m * ALPHA + prevMask[i] * (1 - ALPHA);
        prevMask[i] = m;
        
        // Бинаризация
        currentMask[i] = m > THRESHOLD ? 255 : 0;
    }

    // 5. Морфология
    dilate(currentMask, tempMask2);
    erode(tempMask2, currentMask);

    // 6. Применение альфа-канала
    for (let i = 0; i < W * H; i++) {
        vidPx[i * 4 + 3] = currentMask[i];
    }
    videoCtx.putImageData(vidData, 0, 0);

    // 7. Финальный композитинг
    ctx.clearRect(0, 0, W, H);
    
    if (bgImage.complete && bgImage.naturalWidth > 0) {
        const ratio = Math.max(W / bgImage.width, H / bgImage.height);
        const w = bgImage.width * ratio;
        const h = bgImage.height * ratio;
        ctx.drawImage(bgImage, (W - w) / 2, (H - h) / 2, w, h);
    } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
    }

    ctx.drawImage(videoCanvas, 0, 0, W, H);

    isProcessing = false;
}

// === Запуск камеры ===
startBtn.addEventListener('click', async () => {
    if (!segmenter) {
        startBtn.textContent = "Loading model...";
        segmenter = await initSegmenter();
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 30 },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        startBtn.style.display = 'none';
        renderLoop();
    } catch (e) {
        alert("Ошибка доступа к камере: " + e.message);
    }
});