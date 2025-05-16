console.log("Hello, World!");
const canvas= document.querySelector("#canvas"),
ctx= canvas.getContext("2d"),
toolBtn= document.querySelectorAll(".tool"),
checkBox= document.querySelector("#fill-color"),
colorPicker= document.querySelector("#color-picker"),
cp=document.getElementById("cp"),
clearBtn= document.querySelector("#clear"),
saveBtn= document.querySelector("#save"),
brSize= document.querySelector("#br-size"),
erSize= document.querySelector("#er-size")
colorOpt= document.querySelectorAll(".color");

let prevX,prevY,
brushSize=5,
eraserSize=5,
isDrawing=false,
brColor= "#000",
activeTool= "Brush";

function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

function setupCanvas() {
    resizeCanvasToDisplaySize(canvas);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", setupCanvas);
setupCanvas();

const drawing= (event) => {
    if(!isDrawing) return;
    console.log("Drawing");
    ctx.lineWidth=brushSize;
    const x = event.offsetX;
    const y = event.offsetY;
    if(activeTool==="Brush"){
        ctx.strokeStyle= brColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x,y);
    }else if(activeTool==="Rectangle"){
        ctx.putImageData(snapshot, 0, 0);
        const width = x - prevX;
        const height = y - prevY;
        // ctx.strokeRect(prevX, prevY, width, height);

        if (checkBox.checked) {
            ctx.fillStyle = brColor; // Set fill color
            ctx.fillRect(prevX, prevY, width, height);
        } else {
            ctx.strokeRect(prevX, prevY, width, height);
        }
    } else if(activeTool==="Circle"){
        ctx.putImageData(snapshot, 0, 0);
        const radius = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor; // Set fill color
            ctx.fill();
        } else {
            ctx.stroke();
        }
    } else if(activeTool==="Triangle"){
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.lineTo(prevX * 2 - x, y);
        ctx.closePath();
        if (checkBox.checked) {
            ctx.fillStyle = brColor; // Set fill color
            ctx.fill();
        } else {
            ctx.stroke();
        }
    } else if(activeTool==="Eraser"){
        ctx.lineWidth=eraserSize;
        ctx.strokeStyle= "white"; 
        ctx.strokeRect(x, y, eraserSize, eraserSize);
        // ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x,y);
    }
}

canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    prevX = event.offsetX;
    prevY = event.offsetY;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save before drawing
});
canvas.addEventListener("mousemove",drawing);
canvas.addEventListener("mouseup", (event) => {
    isDrawing=false;
    ctx.beginPath();
});



toolBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
        toolBtn.forEach((btn) => {
            btn.classList.remove("active");
        });
        btn.classList.add("active");
        activeTool= btn.id;

    });
});


brSize.addEventListener("input", (event) => {
    brushSize= event.target.value;
    ctx.lineWidth=brushSize;
    // ctx.strokeStyle= colorPicker.value; 
});

erSize.addEventListener("input", (event) => {
    eraserSize= event.target.value;
    ctx.lineWidth=eraserSize;
    ctx.strokeStyle= "white"; 
});


colorOpt.forEach((color) => {
    color.addEventListener("click", () => {
        brColor= color.id;
        ctx.strokeStyle= brColor; 
        // color.style.backgroundColor= black;
    })});
colorPicker.addEventListener("input", (event) => {
    brColor= event.target.value;
    ctx.strokeStyle= brColor; 
    cp.style.backgroundColor= brColor;
    ctx.fillStyle= brColor;
});


clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
});