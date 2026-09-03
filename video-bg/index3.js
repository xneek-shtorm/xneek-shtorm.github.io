class OfflineBackgroundReplacer {
    constructor() {
        this.segmenter = null;
        this.isInitialized = false;
        this.progress = document.getElementById('progress');
        this.error = document.getElementById('error');
        this.processBtn = document.getElementById('processBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.originalImage = document.getElementById('originalImage');
        this.backgroundImage = document.getElementById('backgroundImage');
        
        this.init();
    }

    showProgress(message) {
        this.progress.style.display = 'block';
        this.progress.textContent = message;
    }

    hideProgress() {
        this.progress.style.display = 'none';
    }

    showError(message) {
        this.error.style.display = 'block';
        this.error.textContent = 'Ошибка: ' + message;
    }

    hideError() {
        this.error.style.display = 'none';
    }

    async init() {
        try {
            this.showProgress('Инициализация сегментатора...');
            
            // Проверяем, что все библиотеки загружены
            if (typeof bodySegmentation === 'undefined') {
                throw new Error('Библиотека body-segmentation не загружена');
            }

            // Настраиваем MediaPipe для работы с локальными файлами
            const mediaPipeConfig = {
                locateFile: (file) => {
                    // Указываем локальный путь к WASM файлам
                    return `/wasm/${file}`;
                }
            };

            // Создаем сегментатор с локальными зависимостями
            const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
            const segmenterConfig = {
                runtime: 'mediapipe',
                // Указываем локальный путь к библиотеке
                solutionPath: 'wasm',
                modelType: 'general', // 'general' для лучшего качества
                mediaPipe: mediaPipeConfig,
                // Если у вас есть локальная TFLite модель, можно использовать ее
                // modelUrl: '/models/selfie_segmentation.tflite'
            };

            this.segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
            
            this.isInitialized = true;
            this.processBtn.disabled = false;
            
            this.hideProgress();
            console.log('Сегментатор успешно инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.hideProgress();
            this.showError('Не удалось инициализировать сегментатор: ' + error.message);
            this.processBtn.disabled = true;
        }
    }

    async processImage() {
        if (!this.isInitialized) {
            this.showError('Сегментатор не инициализирован');
            return;
        }

        try {
            this.hideError();
            this.showProgress('Обработка изображения...');
            this.processBtn.disabled = true;

            // Проверяем, что изображения загружены
            if (!this.originalImage.complete || !this.backgroundImage.complete) {
                throw new Error('Изображения не загружены');
            }

            // Получаем маску сегментации
            const segmentation = await this.segmenter.segmentPeople(this.originalImage);
            
            if (!segmentation || segmentation.length === 0) {
                throw new Error('Не удалось получить сегментацию');
            }

            // Получаем данные маски
            const maskImageData = await segmentation[0].mask.toImageData();
            
            // Выполняем замену фона
            this.replaceBackground(
                this.originalImage,
                this.backgroundImage,
                maskImageData
            );

            this.hideProgress();
            this.showProgress('Готово!');
            setTimeout(() => this.hideProgress(), 2000);
            
        } catch (error) {
            console.error('Ошибка обработки:', error);
            this.hideProgress();
            this.showError('Ошибка обработки: ' + error.message);
        } finally {
            this.processBtn.disabled = false;
        }
    }

    replaceBackground(originalImage, backgroundImage, maskImageData) {
        const canvas = this.resultCanvas;
        
        // Устанавливаем размеры canvas в соответствии с исходным изображением
        canvas.width = originalImage.naturalWidth || originalImage.width;
        canvas.height = originalImage.naturalHeight || originalImage.height;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // 1. Рисуем фоновое изображение
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        const bgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 2. Рисуем исходное изображение на временном canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        const fgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

        // 3. Данные маски
        const maskData = maskImageData.data;

        // 4. Альфа-композитинг с улучшенным качеством
        for (let i = 0; i < maskData.length; i += 4) {
            // Нормализуем альфа-канал (0-1)
            const alpha = maskData[i + 3] / 255;
            
            // Индекс пикселя в массиве данных
            const pixelIndex = i;

            // Применяем гамма-коррекцию для более плавного перехода
            const adjustedAlpha = Math.pow(alpha, 0.9); // Небольшая коррекция для лучшего вида

            // Смешиваем пиксели
            bgData.data[pixelIndex] = Math.floor(
                fgData.data[pixelIndex] * adjustedAlpha + 
                bgData.data[pixelIndex] * (1 - adjustedAlpha)
            );
            bgData.data[pixelIndex + 1] = Math.floor(
                fgData.data[pixelIndex + 1] * adjustedAlpha + 
                bgData.data[pixelIndex + 1] * (1 - adjustedAlpha)
            );
            bgData.data[pixelIndex + 2] = Math.floor(
                fgData.data[pixelIndex + 2] * adjustedAlpha + 
                bgData.data[pixelIndex + 2] * (1 - adjustedAlpha)
            );
            
            // Альфа-канал результата всегда 255 (непрозрачный)
            bgData.data[pixelIndex + 3] = 255;
        }

        // 5. Помещаем результат на canvas
        ctx.putImageData(bgData, 0, 0);
    }

    reset() {
        const canvas = this.resultCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        this.hideProgress();
        this.hideError();
        this.processBtn.disabled = !this.isInitialized;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const replacer = new OfflineBackgroundReplacer();
    
    document.getElementById('processBtn').addEventListener('click', () => {
        replacer.processImage();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        replacer.reset();
    });

    // Обработка ошибок загрузки изображений
    document.getElementById('originalImage').addEventListener('error', () => {
        replacer.showError('Не удалось загрузить исходное изображение. Проверьте путь: images/original.jpg');
    });
    
    document.getElementById('backgroundImage').addEventListener('error', () => {
        replacer.showError('Не удалось загрузить фоновое изображение. Проверьте путь: images/background.jpg');
    });
});