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
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
}

function removeImage(index) {
  images.splice(index, 1);
  renderPreviews();
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
      name.innerText = `${file.name}\nOriginal: ${(file.size / 1024).toFixed(2)} KB`;

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
  alert('Imagens comprimidas com sucesso!');
});

downloadZipBtn.addEventListener('click', () => {
  if (compressedBlobs.length === 0) {
    alert('Nenhuma imagem comprimida disponível. Por favor, comprima primeiro.');
    return;
  }

  const zip = new JSZip();
  compressedBlobs.forEach(({ file, name }) => {
    zip.file(name, file);
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "imagens_comprimidas.zip";
    a.click();
  });
});

function compressImage(file) {
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

        canvas.toBlob(
          (blob) => resolve(blob),
          outputFormat.value,
          0.7 // Qualidade de compressão (0 a 1)
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
