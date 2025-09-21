window.onload = function () {
  // === Canvas setup ===
  const bgCanvas = document.getElementById("backgroundCanvas");
  const bgCtx = bgCanvas.getContext("2d");
  const canvas = document.getElementById("drawingCanvas");
  const ctx = canvas.getContext("2d");
  const container = document.querySelector(".canvas-container");

  // === UI ===
  const loading = document.getElementById("loading");
  const status = document.getElementById("status");
  const colorPicker = document.getElementById("colorPicker");
  const brushSizeSlider = document.getElementById("brushSize");
  const brushSizeValue = document.getElementById("brushSizeValue");
  const backgroundOpacitySlider = document.getElementById("backgroundOpacity");
  const opacityValue = document.getElementById("opacityValue");

  // === Buttons ===
  const brushBtn = document.getElementById("brushBtn");
  const eraserBtn = document.getElementById("eraserBtn");
  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const newImageBtn = document.getElementById("newImageBtn");

  // === Gallery container for saved drawings ===
  const drawingList = document.getElementById("drawingList");

  // === State ===
  let painting = false;
  let brushColor = colorPicker.value;
  let brushSize = parseInt(brushSizeSlider.value);
  let erasing = false;
  let backgroundOpacity = parseFloat(backgroundOpacitySlider.value);
  let currentBackground = null;
  let lastX = 0,
    lastY = 0;

  // === APIs ===
  const apis = [
    { url: "https://nekos.best/api/v2/neko", path: (d) => d.results[0].url },
    { url: "https://nekos.best/api/v2/waifu", path: (d) => d.results[0].url },
    { url: "https://nekos.best/api/v2/husbando", path: (d) => d.results[0].url },
    { url: "https://nekos.best/api/v2/kitsune", path: (d) => d.results[0].url },
    { url: "https://api.catboys.com/img", path: (d) => d.url },
  ];

  // === Local fallback images ===
  const fallbackImages = [
    "images/anime1.jpg",
    "images/anime2.jpg",
    "images/anime3.jpg",
  ];

  // === Get mouse position relative to canvas scale ===
  function getMousePos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  // === Drawing ===
  function startDrawing(e) {
    painting = true;
    const pos = getMousePos(e, canvas);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    if (!painting) return;
    const pos = getMousePos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = erasing
      ? "destination-out"
      : "source-over";
    ctx.strokeStyle = brushColor;
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDrawing() {
    painting = false;
  }

  // === Background loader ===
  async function getRandomApiImage() {
    const randomApi = apis[Math.floor(Math.random() * apis.length)];
    const res = await fetch(randomApi.url);
    const data = await res.json();
    return randomApi.path(data);
  }

  async function loadRandomBackground() {
    showLoading();
    try {
      const imageUrl = await getRandomApiImage();
      await loadImageFromUrl(imageUrl);
    } catch (err) {
      console.error("API failed, using fallback:", err);
      const fallbackIndex = Math.floor(Math.random() * fallbackImages.length);
      await loadImageFromUrl(fallbackImages[fallbackIndex]);
    }
  }

  function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        currentBackground = img;
        drawBackground(img);
        hideLoading();
        showStatus("New background loaded!");
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function drawBackground(image) {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    const scale = Math.min(
      bgCanvas.width / image.width,
      bgCanvas.height / image.height
    );
    const newWidth = image.width * scale;
    const newHeight = image.height * scale;
    const x = (bgCanvas.width - newWidth) / 2;
    const y = (bgCanvas.height - newHeight) / 2;
    bgCtx.globalAlpha = backgroundOpacity;
    bgCtx.drawImage(image, x, y, newWidth, newHeight);
    bgCtx.globalAlpha = 1.0;
  }

  // === Controls ===
  colorPicker.addEventListener("change", (e) => (brushColor = e.target.value));
  brushSizeSlider.addEventListener("input", (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = brushSize;
  });
  backgroundOpacitySlider.addEventListener("input", (e) => {
    backgroundOpacity = parseFloat(e.target.value);
    opacityValue.textContent = backgroundOpacity;
    if (currentBackground) drawBackground(currentBackground);
  });
  brushBtn.addEventListener("click", () => {
    erasing = false;
    brushBtn.classList.add("active");
    eraserBtn.classList.remove("active");
  });
  eraserBtn.addEventListener("click", () => {
    erasing = true;
    eraserBtn.classList.add("active");
    brushBtn.classList.remove("active");
  });
  clearBtn.addEventListener("click", () =>
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  );
  saveBtn.addEventListener("click", saveDrawing);
  newImageBtn.addEventListener("click", loadRandomBackground);

  // === Save drawing to DB ===
  async function saveDrawing() {
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = canvas.width;
    mergedCanvas.height = canvas.height;
    const mergedCtx = mergedCanvas.getContext("2d");

    // White background
    mergedCtx.fillStyle = "#fff";
    mergedCtx.fillRect(0, 0, mergedCanvas.width, mergedCanvas.height);

    // Merge background + drawing
    if (currentBackground) mergedCtx.drawImage(bgCanvas, 0, 0);
    mergedCtx.drawImage(canvas, 0, 0);

    // Convert to Base64 PNG string
    const drawingData = mergedCanvas.toDataURL("image/png");

    try {
      const response = await fetch("/drawings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, data: drawingData }),
      });

      const result = await response.json();

      // Use Bootstrap modal instead of alert
      document.getElementById("sketchpadMessage").textContent =
        result.message || "Drawing saved!";
      new bootstrap.Modal(
        document.getElementById("sketchpadModal")
      ).show();

      console.log("Drawing saved to DB:", result.message);

      loadSavedDrawings(); // refresh gallery
    } catch (err) {
      console.error("Save error:", err);

      document.getElementById("sketchpadMessage").textContent =
        "Error saving drawing.";
      new bootstrap.Modal(
        document.getElementById("sketchpadModal")
      ).show();
    }
  }

  // === Load drawings from DB ===
  async function loadSavedDrawings() {
    try {
      const response = await fetch("/drawings");
      const result = await response.json();

      drawingList.innerHTML = ""; // clear old
      if (result.success && result.drawings.length > 0) {
        result.drawings.forEach((d) => {
          const img = document.createElement("img");
          img.src = d.data;
          img.className = "saved-thumb m-2 border rounded";
          img.style.maxWidth = "150px";
          drawingList.appendChild(img);
        });
      } else {
        drawingList.innerHTML =
          "<p class='text-muted'>No saved drawings yet.</p>";
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  // === Utility ===
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    bgCanvas.width = rect.width;
    bgCanvas.height = rect.height;
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (currentBackground) drawBackground(currentBackground);
  }

  function showLoading() {
    loading.style.display = "flex";
  }
  function hideLoading() {
    loading.style.display = "none";
  }
  function showStatus(msg) {
    status.textContent = msg;
    status.style.display = "block";
    setTimeout(() => (status.style.display = "none"), 3000);
  }

  // === Events ===
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  window.addEventListener("resize", resizeCanvas);

  // === Init ===
  function init() {
    resizeCanvas();
    loadRandomBackground(); // load initial background
    loadSavedDrawings(); // show saved drawings on page load
  }
  init();
};
