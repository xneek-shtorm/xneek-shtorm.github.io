const lessons = [
    {
        title: "Урок 1: Базовая позиция (Указательные)",
        text: "апап орор аопа ропа апор орап паор роап"
    },
    {
        title: "Урок 2: Базовая позиция (Средние и безымянные)",
        text: "вывы лдлд вылд длвы влыд ывдл лдыв длвы"
    },
    {
        title: "Урок 3: Весь основной ряд (фыва олдж)",
        text: "фыва олдж фыва олдж жаба вода лапа фасад"
    },
    {
        title: "Урок 4: Центральные клавиши (п, р, е, н, м, и)",
        text: "пена рама мир пир река море небо пение"
    },
    {
        title: "Урок 5: Верхний ряд (Левая рука: йцуке)",
        text: "куку кефир цвет укус купе ветер цукат"
    },
    {
        title: "Урок 6: Верхний ряд (Правая рука: нгшщзхъ)",
        text: "нож гора шар щит зонт хор гном шорох"
    },
    {
        title: "Урок 7: Весь верхний ряд",
        text: "ученик пишет хороший рассказ про природу"
    },
    {
        title: "Урок 8: Нижний ряд (ячсмитьбю)",
        text: "мяч час сила мать тень брат юла яма"
    },
    {
        title: "Урок 9: Слова на все ряды клавиатуры",
        text: "компьютер клавиатура программа монитор текст"
    },
    {
        title: "Урок 10: Контрольный текст",
        text: "съешь же еще этих мягких французских булок да выпей чаю."
    }
];

const keyboardLayout = [
    [
        { char: 'й', zone: 'pinky', finger: 'Левый мизинец' },
        { char: 'ц', zone: 'ring', finger: 'Левый безымянный' },
        { char: 'у', zone: 'middle', finger: 'Левый средний' },
        { char: 'к', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'е', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'н', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'г', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'ш', zone: 'middle', finger: 'Правый средний' },
        { char: 'щ', zone: 'ring', finger: 'Правый безымянный' },
        { char: 'з', zone: 'pinky', finger: 'Правый мизинец' },
        { char: 'х', zone: 'pinky', finger: 'Правый мизинец' },
        { char: 'ъ', zone: 'pinky', finger: 'Правый мизинец' }
    ],
    [
        { char: 'ф', zone: 'pinky', finger: 'Левый мизинец' },
        { char: 'ы', zone: 'ring', finger: 'Левый безымянный' },
        { char: 'в', zone: 'middle', finger: 'Левый средний' },
        { char: 'а', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'п', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'р', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'о', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'л', zone: 'middle', finger: 'Правый средний' },
        { char: 'д', zone: 'ring', finger: 'Правый безымянный' },
        { char: 'ж', zone: 'pinky', finger: 'Правый мизинец' },
        { char: 'э', zone: 'pinky', finger: 'Правый мизинец' }
    ],
    [
        { char: 'я', zone: 'pinky', finger: 'Левый мизинец' },
        { char: 'ч', zone: 'ring', finger: 'Левый безымянный' },
        { char: 'с', zone: 'middle', finger: 'Левый средний' },
        { char: 'м', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'и', zone: 'index-l', finger: 'Левый указательный' },
        { char: 'т', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'ь', zone: 'index-r', finger: 'Правый указательный' },
        { char: 'б', zone: 'middle', finger: 'Правый средний' },
        { char: 'ю', zone: 'ring', finger: 'Правый безымянный' },
        { char: '.', zone: 'pinky', finger: 'Правый мизинец' }
    ],
    [
        { char: ' ', zone: 'thumb space', finger: 'Большой палец' }
    ]
];

let currentLessonIndex = 0;
let currentText = "";
let currentIndex = 0;
let errors = 0;
let startTime = null;
let fingerMap = {};

const lessonSelect = document.getElementById('lesson-select');
const textDisplay = document.getElementById('text-display');
const keyboardEl = document.getElementById('keyboard');
const speedEl = document.getElementById('speed');
const accuracyEl = document.getElementById('accuracy');
const fingerHintEl = document.getElementById('finger-hint');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');

// Заполнение списка упражнений
function populateLessons() {
    lessons.forEach((lesson, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = lesson.title;
        lessonSelect.appendChild(option);
    });
}

function renderKeyboard() {
    keyboardEl.innerHTML = '';
    keyboardLayout.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        row.forEach(keyObj => {
            const keyEl = document.createElement('div');
            keyEl.className = `key ${keyObj.zone}`;
            keyEl.textContent = keyObj.char === ' ' ? 'Пробел' : keyObj.char;
            keyEl.dataset.char = keyObj.char;
            rowEl.appendChild(keyEl);

            fingerMap[keyObj.char] = keyObj.finger;
        });
        keyboardEl.appendChild(rowEl);
    });
}

function initLesson(index = currentLessonIndex) {
    currentLessonIndex = index;
    lessonSelect.value = currentLessonIndex;
    currentText = lessons[currentLessonIndex].text;
    currentIndex = 0;
    errors = 0;
    startTime = null;
    
    speedEl.textContent = '0';
    accuracyEl.textContent = '100';
    nextBtn.style.display = 'none';
    
    renderText();
    highlightNextKey();
}

function renderText() {
    textDisplay.innerHTML = '';
    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'char';
        if (index === currentIndex) span.classList.add('current');
        textDisplay.appendChild(span);
    });
}

function highlightNextKey() {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    if (currentIndex >= currentText.length) {
        fingerHintEl.textContent = 'Урок пройден!';
        if (currentLessonIndex < lessons.length - 1) {
            nextBtn.style.display = 'inline-block';
        }
        return;
    }

    const targetChar = currentText[currentIndex].toLowerCase();
    const keyEl = document.querySelector(`.key[data-char="${targetChar}"]`);
    if (keyEl) keyEl.classList.add('active');
    
    fingerHintEl.textContent = fingerMap[targetChar] || 'Любой палец';
}

function updateStats() {
    if (!startTime) return;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const cpm = Math.round(currentIndex / elapsedMinutes) || 0;
    const totalTyped = currentIndex + errors;
    const accuracy = totalTyped > 0 ? Math.round((currentIndex / totalTyped) * 100) : 100;

    speedEl.textContent = cpm;
    accuracyEl.textContent = accuracy;
}

document.addEventListener('keydown', (e) => {
    if (currentIndex >= currentText.length) return;
    if (e.key.length > 1 && e.key !== ' ') return;

    // Предотвращаем прокрутку страницы при нажатии на пробел
    if (e.key === ' ') e.preventDefault();

    if (!startTime) startTime = Date.now();

    const spans = textDisplay.querySelectorAll('.char');
    const targetChar = currentText[currentIndex];

    if (e.key === targetChar) {
        spans[currentIndex].classList.remove('current', 'incorrect');
        spans[currentIndex].classList.add('correct');
        currentIndex++;

        if (currentIndex < currentText.length) {
            spans[currentIndex].classList.add('current');
        }
        highlightNextKey();
    } else {
        spans[currentIndex].classList.add('incorrect');
        errors++;
    }

    updateStats();
});

lessonSelect.addEventListener('change', (e) => {
    initLesson(Number(e.target.value));
    lessonSelect.blur(); // Убираем фокус с select, чтобы пробел не открывал список
});

restartBtn.addEventListener('click', () => {
    initLesson(currentLessonIndex);
    restartBtn.blur();
});

nextBtn.addEventListener('click', () => {
    if (currentLessonIndex < lessons.length - 1) {
        initLesson(currentLessonIndex + 1);
    }
    nextBtn.blur();
});

// Инициализация
populateLessons();
renderKeyboard();
initLesson(0);
