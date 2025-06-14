const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const compressBtn = document.getElementById('compressBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');

const targetSize = document.getElementById('targetSize');
const outputFormat = document.getElementById('outputFormat');
const maxWidth = document.getElementById('maxWidth');
const maxHeight = document.getElementById('maxHeight');
const keepRatio = document.getElementById('keepRatio');

let images = [];
let compressedBlobs = [];
let previewsVisible = true;

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  const icon = document.getElementById("themeIcon");
  const switchBtn = document.getElementById("themeToggleBtn");

  if (isDark) {
    html.setAttribute("data-theme", "light");
    icon.textContent = "☀️";
    switchBtn.style.background = "#ffa500";
    icon.style.transform = "translateX(30px)";
  } else {
    html.setAttribute("data-theme", "dark");
    icon.textContent = "🌙";
    switchBtn.style.background = "#333";
    icon.style.transform = "translateX(0)";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const icon = document.getElementById("themeIcon");
  const switchBtn = document.getElementById("themeToggleBtn");

  if (isDark) {
    icon.textContent = "🌙";
    switchBtn.style.background = "#333";
    icon.style.transform = "translateX(0)";
  } else {
    icon.textContent = "☀️";
    switchBtn.style.background = "#ffa500";
    icon.style.transform = "translateX(30px)";
  }
});

function removeImage(index) {
  images.splice(index, 1);
  compressedBlobs.splice(index, 1);
  renderPreviews();
}

function clearAll() {
  images = [];
  compressedBlobs = [];
  preview.innerHTML = '';
  fileInput.value = '';
}

function renderPreviews() {
  preview.innerHTML = '';
  images.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement('div');
      container.className = 'preview-item';

      const img = document.createElement('img');
      img.src = e.target.result;

      const name = document.createElement('p');
      let text = `${file.name}\nOriginal: ${(file.size / 1024).toFixed(2)} KB`;
      if (compressedBlobs[index]) {
        const compSize = (compressedBlobs[index].file.size / 1024).toFixed(2);
        text += `\nComprimido: ${compSize} KB`;
      }
      name.innerText = text;

      const delBtn = document.createElement('button');
      delBtn.innerHTML = '&times;';
      delBtn.className = 'delete-btn';
      delBtn.onclick = () => removeImage(index);

      container.appendChild(delBtn);
      container.appendChild(img);
      container.appendChild(name);
      preview.appendChild(container);
    };
    reader.readAsDataURL(file);
  });
}

fileInput.addEventListener('change', () => {
  images = Array.from(fileInput.files);
  compressedBlobs = [];
  renderPreviews();
});

togglePreviewBtn.addEventListener('click', () => {
  previewsVisible = !previewsVisible;
  preview.style.display = previewsVisible ? 'grid' : 'none';
  togglePreviewBtn.innerText = previewsVisible ? 'Esconder Previews' : 'Mostrar Previews';
});

compressBtn.addEventListener('click', async () => {
  compressedBlobs = [];
  for (const file of images) {
    const compressed = await compressImage(file);
    compressedBlobs.push({ file: compressed, name: file.name });
  }
  renderPreviews();

  Toastify({
    text: "🎉 Imagens comprimidas com sucesso!",
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    stopOnFocus: true,
  }).showToast();
});

downloadZipBtn.addEventListener('click', () => {
  if (compressedBlobs.length === 0) {
    Toastify({
      text: "⚠️ Nenhuma imagem comprimida disponível.",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#e74c3c",
    }).showToast();
    return;
  }

  const zip = new JSZip();
  compressedBlobs.forEach(({ file, name }) => {
    const newName = name.replace(/\.\w+$/, getExtension(outputFormat.value));
    zip.file(newName, file);
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "imagens_comprimidas.zip";
    a.click();
  });
});

function compressImage(file) {
  const targetKB = parseInt(targetSize.value);
  const format = outputFormat.value;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = parseInt(maxWidth.value);
        let height = parseInt(maxHeight.value);

        if (keepRatio.checked) {
          const ratio = img.width / img.height;
          if (img.width > img.height) {
            height = Math.round(width / ratio);
          } else {
            width = Math.round(height * ratio);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.9;

        function tryCompress() {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                Toastify({
                  text: `❌ Formato ${format} não suportado neste navegador.`,
                  duration: 4000,
                  close: true,
                  gravity: "top",
                  position: "right",
                  backgroundColor: "#e74c3c",
                }).showToast();
                resolve(new Blob());
                return;
              }

              if ((blob.size / 1024) > targetKB && quality > 0.1) {
                quality -= 0.05;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            format,
            quality
          );
        }

        tryCompress();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function getExtension(mime) {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  return '.img';
}
