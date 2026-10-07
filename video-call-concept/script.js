addBtnTb2.onclick = (e) => {
  const cur = e.currentTarget;
  const clone = document.getElementById("printBtn").cloneNode(true);
  console.log(cur.outerHTML);
  console.log("clone", clone.outerHTML);
  cur.parentNode.insertBefore(clone, cur);
};
addBtnTb1.onclick = (e) => {
  const cur = e.currentTarget;
  const clone = document.getElementById("phoneBtn").cloneNode(true);
  console.log(cur.outerHTML);
  console.log("clone", clone.outerHTML);
  cur.parentNode.insertBefore(clone, cur);
};

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(function (stream) {
    smallVideo.srcObject = stream;
    bigVideo.srcObject = stream;
    smallVideo.play();
    bigVideo.play();
  })
  .catch(function (err) {
    console.log("An error occurred: " + err);
  });

btnMic.onclick = () => {
  box.classList.toggle("scrollableToolbar");
};

const makeDraggableAndResizable = (container, draggable, smallVideo, onResize) => {
  const HANDLE = 10,
    MIN_W = 80;

  let ratio = 16 / 9; // будет уточнён после метаданных видео
  let mode = null; // 'drag' | 'resize' | null
  let dir = ""; // 'n','s','e','w','ne','nw','se','sw'
  let sx = 0,
    sy = 0,
    sl = 0,
    st = 0,
    sw = 0,
    sh = 0,
    ox = 0,
    oy = 0;

  // Получаем реальный aspect ratio из видео
  function syncRatio() {
    if (smallVideo.videoWidth && smallVideo.videoHeight) {
      ratio = smallVideo.videoWidth / smallVideo.videoHeight;
      applySize(
        draggable.offsetLeft,
        draggable.offsetTop,
        draggable.offsetWidth
      );
    }
  }
  smallVideo.addEventListener("loadedmetadata", syncRatio);
  if (smallVideo.videoWidth) syncRatio();

  function getDir(e) {
    const r = draggable.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    let d = "";
    if (y <= HANDLE) d += "n";
    if (y >= r.height - HANDLE) d += "s";
    if (x <= HANDLE) d += "w";
    if (x >= r.width - HANDLE) d += "e";
    return d;
  }

  // Устанавливает размеры с сохранением пропорций, зажатые в контейнер
  function applySize(l, t, w, h) {
    // Если h задан явно (ресайз по вертикали) — пересчитываем w и наоборот
    if (w == null) w = h * ratio;
    if (h == null) h = w / ratio;

    if (w < MIN_W) {
      w = MIN_W;
      h = w / ratio;
    }
    if (h < MIN_W / ratio) {
      h = MIN_W / ratio;
      w = h * ratio;
    }

    // Не вылезаем за пределы контейнера по обеим осям
    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    l = Math.max(0, Math.min(l, container.clientWidth - w));
    t = Math.max(0, Math.min(t, container.clientHeight - h));

    draggable.style.left = l + "px";
    draggable.style.top = t + "px";
    draggable.style.width = w + "px";
    draggable.style.height = h + "px";
  }

  draggable.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    sx = e.clientX;
    sy = e.clientY;
    sl = draggable.offsetLeft;
    st = draggable.offsetTop;
    sw = draggable.offsetWidth;
    sh = draggable.offsetHeight;

    dir = getDir(e);
    mode = dir ? "resize" : "drag";

    if (mode === "drag") {
      ox = e.clientX - sl;
      oy = e.clientY - st;
      draggable.classList.add("absolute");
      draggable.classList.add("active");
    } else {
      applySize(sl, st, sw, sh);
    }
    draggable.setPointerCapture(e.pointerId);
  });

  draggable.addEventListener("pointermove", (e) => {
    e.stopPropagation();
    if (!mode) {
      const d = getDir(e);
      draggable.style.cursor = d
        ? d === "n" || d === "s"
          ? "ns-resize"
          : d === "e" || d === "w"
            ? "ew-resize"
            : d === "ne" || d === "sw"
              ? "nesw-resize"
              : "nwse-resize"
        : "move";
      return;
    }

    if (mode === "resize") {
      const dx = e.clientX - sx,
        dy = e.clientY - sy;

      let l = sl,
        t = st;
      let w = sw,
        h = sh;

      // Горизонтальный ресайз — тянет за ширину
      if (dir.includes("e")) w = sw + dx;
      if (dir.includes("w")) {
        w = sw - dx;
        l = sl + dx;
      }

      // Вертикальный ресайз — тянет за высоту
      if (dir.includes("s")) h = sh + dy;
      if (dir.includes("n")) {
        h = sh - dy;
        t = st + dy;
      }

      // Приоритет отдаём тому направлению, что реально менялось
      const horizOnly = dir === "e" || dir === "w";
      const vertOnly = dir === "n" || dir === "s";

      if (horizOnly) applySize(l, t, w, null);
      else if (vertOnly) applySize(l, t, null, h);
      else {
        // Углы: берём большее отклонение, чтобы чувствовалось естественно
        const byW = Math.abs(w - sw) >= Math.abs(h - sh);
        if (byW) applySize(l, t, w, null);
        else applySize(l, t, null, h);
      }

onResize?.();
      
    } else {
      let x = e.clientX - ox,
        y = e.clientY - oy;
      const mx = container.clientWidth - draggable.offsetWidth;
      const my = container.clientHeight - draggable.offsetHeight;
      draggable.style.left = Math.max(0, Math.min(x, mx)) + "px";
      draggable.style.top = Math.max(0, Math.min(y, my)) + "px";
    }
  });

  draggable.addEventListener("pointerup", (e) => {
    e.stopPropagation();
    if (mode === "drag") {
      let x = e.clientX - ox;
      let y = e.clientY - oy;
      const mx = container.clientWidth - draggable.offsetWidth;
      const my = container.clientHeight - draggable.offsetHeight;

      if (x > mx && y < 0) {
        draggable.style.left = "unset";
        draggable.style.top = "unset";
        draggable.classList.remove("absolute");
      }
    }
    draggable.classList.remove("active");
    mode = null;
    dir = "";
    draggable.style.cursor = "move";
  });

  draggable.addEventListener("dblclick", (e) => {
    draggable.style.left = "unset";
    draggable.style.top = "unset";
    draggable.classList.remove("absolute");
    draggable.classList.remove("active");
  });
};

const container = document.getElementById("box");
const draggable = document.getElementById("smallVideoContainer");
const smallVideo = document.getElementById("smallVideo");

makeDraggableAndResizable(container, draggable, smallVideo);
makeDraggableAndResizable(document.body, document.getElementById('modal'), document.getElementById('bigVideo'), () => {
      draggable.style.left = "unset";
    draggable.style.top = "unset";
    draggable.classList.remove("absolute");
    draggable.classList.remove("active");
}); 
