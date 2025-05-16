console.log("Hello, World!");

// === Canvas and UI Element References ===
const canvas = document.querySelector("#canvas"), // Canvas element
      ctx = canvas.getContext("2d"), // Canvas drawing context
      toolBtn = document.querySelectorAll(".tool"), // All tool buttons (brush, rectangle, etc.)
      checkBox = document.querySelector("#fill-color"), // Fill color checkbox
      colorPicker = document.querySelector("#color-picker"), // Foreground color input
      bgColorPicker = document.querySelector("#bg-color-picker"), // Background color input
      cp = document.getElementById("cp"), // Foreground color preview circle
      bgCp = document.getElementById("bg-cp"), // Background color preview circle
      clearBtn = document.querySelector("#clear"), // Clear button
      saveBtn = document.querySelector("#save"), // Save button
      brSize = document.querySelector("#br-size"), // Brush size input
      erSize = document.querySelector("#er-size"), // Eraser size input
      colorOpt = document.querySelectorAll(".color"), // Predefined brush color options
      canvaClr = document.querySelectorAll(".canvaClr"); // Predefined canvas color options

// === Drawing-related Variables ===
let prevX, prevY; // Previous X, Y coordinates
let brushSize = 5; // Initial brush size
let eraserSize = 5; // Initial eraser size
let isDrawing = false; // Is mouse pressed and moving
let brColor = "#000"; // Default brush color (black)
let activeTool = "Brush"; // Default tool
let canvasColor = "white"; // Default canvas background color

// === Utility to Resize Canvas on Window Resize ===
function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

// === Setup Initial Canvas Background ===
function setupCanvas() {
    resizeCanvasToDisplaySize(canvas);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", setupCanvas);
setupCanvas(); // Initial setup

// === Drawing Logic ===
const drawing = (event) => {
    if (!isDrawing) return;
    console.log("Drawing");
    ctx.lineWidth = brushSize;
    const x = event.offsetX;
    const y = event.offsetY;

    // === Brush Tool ===
    if (activeTool === "Brush") {
        ctx.strokeStyle = brColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

    // === Rectangle Tool ===
    } else if (activeTool === "Rectangle") {
        ctx.putImageData(snapshot, 0, 0);
        const width = x - prevX;
        const height = y - prevY;

        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fillRect(prevX, prevY, width, height);
        } else {
            ctx.strokeRect(prevX, prevY, width, height);
        }

    // === Circle Tool ===
    } else if (activeTool === "Circle") {
        ctx.putImageData(snapshot, 0, 0);
        const radius = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fill();
        } else {
            ctx.stroke();
        }

    // === Triangle Tool ===
    } else if (activeTool === "Triangle") {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineTo(prevX * 2 - x, y); // Symmetrical third point
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor;
            ctx.fill();
        } else {
            ctx.stroke();
        }

    // === Eraser Tool ===
    } else if (activeTool === "Eraser") {
        ctx.lineWidth = eraserSize;
        ctx.strokeStyle = canvasColor;
        ctx.strokeRect(x, y, eraserSize, eraserSize);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
};

// === Mouse Event Listeners for Drawing ===
canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    prevX = event.offsetX;
    prevY = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save canvas state
});

canvas.addEventListener("mousemove", drawing);

canvas.addEventListener("mouseup", (event) => {
    isDrawing = false;
    ctx.beginPath(); // Reset path
});

// === Tool Selection Handling ===
toolBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        toolBtn.forEach((btn) => btn.classList.remove("active")); // Remove active from all
        btn.classList.add("active"); // Set current as active
        activeTool = btn.id; // Set active tool
    });
});

// === Brush Size Control ===
brSize.addEventListener("input", (event) => {
    brushSize = event.target.value;
    ctx.lineWidth = brushSize;
    activeTool = "Brush"; // Automatically switch to brush
});

// === Eraser Size Control ===
erSize.addEventListener("input", (event) => {
    eraserSize = event.target.value;
    ctx.lineWidth = eraserSize;
    ctx.strokeStyle = canvasColor;
    activeTool = "Eraser"; // Automatically switch to eraser
});

// === Predefined Brush Color Options ===
colorOpt.forEach((color) => {
    color.addEventListener("click", () => {
        brColor = color.id;
        ctx.strokeStyle = brColor;
    });
});

// === Custom Foreground Color Picker ===
colorPicker.addEventListener("input", (event) => {
    brColor = event.target.value;
    ctx.strokeStyle = brColor;
    cp.style.backgroundColor = brColor;
    ctx.fillStyle = brColor;
});

// === Predefined Canvas Background Colors ===
canvaClr.forEach((color) => {
    color.addEventListener("click", () => {
        canvasColor = color.id;
        ctx.fillStyle = canvasColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
});

// === Custom Canvas Background Color Picker ===
bgColorPicker.addEventListener("input", (event) => {
    canvasColor = event.target.value;
    bgCp.style.backgroundColor = canvasColor;
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// === Clear Button Functionality ===
clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// === Save Button Functionality (Download as PNG) ===
saveBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
});
