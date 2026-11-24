const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Пересоздаем целевые папки
fs.rmSync(path.join(__dirname, 'libs'), { recursive: true, force: true });
fs.rmSync(path.join(__dirname, 'models'), { recursive: true, force: true });
fs.mkdirSync(path.join(__dirname, 'libs/wasm'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'models'), { recursive: true });

const archives = [
  {
    tgz: 'tasks-vision-0.10.14.tgz',
    files: {
      'package/vision_bundle.mjs': 'libs/vision_bundle.mjs',
      'package/wasm/vision_wasm_internal.js': 'libs/wasm/vision_wasm_internal.js',
      'package/wasm/vision_wasm_internal.wasm': 'libs/wasm/vision_wasm_internal.wasm',
      'package/wasm/vision_wasm_nosimd_internal.js': 'libs/wasm/vision_wasm_nosimd_internal.js',
      'package/wasm/vision_wasm_nosimd_internal.wasm': 'libs/wasm/vision_wasm_nosimd_internal.wasm'
    }
  },
  {
    tgz: 'face_detection-0.4.1646425229.tgz',
    files: {
      'package/face_detection_short_range.tflite': 'models/blaze_face_short_range.tflite'
    }
  },
  {
    tgz: 'selfie_segmentation-0.1.1675465747.tgz',
    files: {
      'package/selfie_segmentation.tflite': 'models/selfie_segmenter.tflite'
    }
  }
];

function extractFromTgz(tgzFile, neededMap) {
  const fullTgzPath = path.join(__dirname, tgzFile);
  if (!fs.existsSync(fullTgzPath)) {
    throw new Error(`Файл не найден: ${tgzFile}`);
  }
  const tgzBuffer = fs.readFileSync(fullTgzPath);
  const tarBuffer = zlib.gunzipSync(tgzBuffer);
  let offset = 0;

  while (offset < tarBuffer.length) {
    const header = tarBuffer.subarray(offset, offset + 512);
    if (header === 0) break;

    const rawName = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    const rawSize = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    const fileSize = parseInt(rawSize, 8) || 0;

    offset += 512;

    if (neededMap[rawName]) {
      const destPath = path.join(__dirname, neededMap[rawName]);
      const fileData = tarBuffer.subarray(offset, offset + fileSize);
      fs.writeFileSync(destPath, fileData);
      console.log(`✅ Распаковано: ${neededMap[rawName]} (${Math.round(fileData.length / 1024)} КБ)`);
    }

    offset += Math.ceil(fileSize / 512) * 512;
  }
}

try {
  for (const item of archives) {
    extractFromTgz(item.tgz, item.files);
  }
  console.log('\n🎉 Все 7 файлов распакованы! Можно запускать локальный веб-сервер.');
} catch (err) {
  console.error('❌ Ошибка:', err.message);
}
