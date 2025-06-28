console.log("Hello, World!");

// === Canvas and UI Element References ===
const canvas = document.querySelector("#canvas"),
      ctx = canvas.getContext("2d"),
      toolBtn = document.querySelectorAll(".tool"),
      checkBox = document.querySelector("#fill-color"),
      colorPicker = document.querySelector("#color-picker"),
      bgColorPicker = document.querySelector("#bg-color-picker"),
      cp = document.getElementById("cp"),
      bgCp = document.getElementById("bg-cp"),
      clearBtn = document.querySelector("#clear"),
      saveBtn = document.querySelector("#save"),
      brSize = document.querySelector("#br-size"),
      erSize = document.querySelector("#er-size"),
      colorOpt = document.querySelectorAll(".color"),
      canvaClr = document.querySelectorAll(".canvaClr"),
      undoBtn = document.querySelector("#undo"),
      redoBtn = document.querySelector("#redo");

let prevX, prevY;
let brushSize = 5;
let eraserSize = 5;
let isDrawing = false;
let brColor = "#000";
let activeTool = "Brush";
let canvasColor = "white";
let undoStack = [];
let redoStack = [];
let snapshot;

// === Utility to Resize Canvas on Window Resize ===
function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(imageData, 0, 0);
    }
}

// === Setup Initial Canvas Background ===
function setupCanvas() {
    resizeCanvasToDisplaySize(canvas);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot);
}

window.addEventListener("resize", setupCanvas);
window.addEventListener("load", setupCanvas);

// === Drawing Logic ===
const drawing = (event) => {
    if (!isDrawing) return;
    const x = event.offsetX;
    const y = event.offsetY;

    ctx.lineWidth = brushSize;

    if (activeTool === "Brush") {
        ctx.strokeStyle = brColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else if (activeTool === "Rectangle") {
        ctx.putImageData(snapshot, 0, 0);
        const width = x - prevX;
        const height = y - prevY;

        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fillRect(prevX, prevY, width, height);
        } else {
            ctx.strokeStyle = brColor;
            ctx.strokeRect(prevX, prevY, width, height);
        }
    } else if (activeTool === "Circle") {
        ctx.putImageData(snapshot, 0, 0);
        const radius = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
        ctx.beginPath();
        ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fill();
        } else {
            ctx.strokeStyle = brColor;
            ctx.stroke();
        }
    } else if (activeTool === "Triangle") {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineTo(prevX * 2 - x, y);
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fill();
        } else {
            ctx.strokeStyle = brColor;
            ctx.stroke();
        }
    } else if (activeTool === "Eraser") {
        ctx.lineWidth = eraserSize;
        ctx.strokeStyle = canvasColor;
        ctx.strokeRect(x, y, eraserSize, eraserSize);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
};

// === Mouse Event Listeners ===
canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    prevX = event.offsetX;
    prevY = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("mousemove", drawing);

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.beginPath();
    ctx.closePath();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot);
});

// === Touch Support ===
canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    prevX = touch.clientX - rect.left;
    prevY = touch.clientY - rect.top;
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    drawing({
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
    });
    e.preventDefault();
});

canvas.addEventListener("touchend", () => {
    isDrawing = false;
    ctx.closePath();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(snapshot);
});

// === Tool Selection ===
toolBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        toolBtn.forEach((btn) => btn.classList.remove("active"));
        btn.classList.add("active");
        activeTool = btn.id;
    });
});

// === Brush Size Control ===
brSize.addEventListener("input", (event) => {
    brushSize = event.target.value;
    ctx.lineWidth = brushSize;
    activeTool = "Brush";
});

// === Eraser Size Control ===
erSize.addEventListener("input", (event) => {
    eraserSize = event.target.value;
    ctx.lineWidth = eraserSize;
    ctx.strokeStyle = canvasColor;
    activeTool = "Eraser";
});

// === Brush Colors (predefined) ===
colorOpt.forEach((color) => {
    color.addEventListener("click", () => {
        brColor = color.id;
        ctx.strokeStyle = brColor;
    });
});

// === Custom Foreground Color ===
colorPicker.addEventListener("input", (event) => {
    brColor = event.target.value;
    ctx.strokeStyle = brColor;
    ctx.fillStyle = brColor;
    cp.style.backgroundColor = brColor;
});

// === Predefined Canvas Colors ===
canvaClr.forEach((color) => {
    color.addEventListener("click", () => {
        canvasColor = color.id;
        ctx.fillStyle = canvasColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (canvasColor === "Black") {
            brColor = "white";
        } else {
            brColor = "black";
        }
    });
});

// === Custom Background Color ===
bgColorPicker.addEventListener("input", (event) => {
    canvasColor = event.target.value;
    bgCp.style.backgroundColor = canvasColor;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// === Clear Canvas ===
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// === Save as Image ===
saveBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
});

// === Undo/Redo ===
undoBtn.addEventListener("click", () => {
    if (undoStack.length > 0) {
        redoStack.push(snapshot);
        snapshot = undoStack.pop();
        ctx.putImageData(snapshot, 0, 0);
    }
});

redoBtn.addEventListener("click", () => {
    if (redoStack.length > 0) {
        undoStack.push(snapshot);
        snapshot = redoStack.pop();
        ctx.putImageData(snapshot, 0, 0);
    }
});
