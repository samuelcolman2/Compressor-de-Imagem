const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const compressBtn = document.getElementById('compressBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const togglePreviewBtn = document.getElementById('togglePreviewBtn');

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
