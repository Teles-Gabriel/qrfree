const urlInput = document.getElementById('url-input');
const borderSizeInput = document.getElementById('border-size');
const borderColorInput = document.getElementById('border-color');
const qrColorInput = document.getElementById('qr-color');
const bgColorInput = document.getElementById('bg-color');
const logoInput = document.getElementById('logo-input');
const logoSizeInput = document.getElementById('logo-size');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const removeLogoBtn = document.getElementById('remove-logo');
const qrPreview = document.getElementById('qr-preview');
const borderValue = document.getElementById('border-value');
const logoSizeValue = document.getElementById('logo-size-value');

let logoImage = null;

function generateQRCode() {
    const url = urlInput.value.trim() || 'https://www.youtube.com';
    const borderSize = parseInt(borderSizeInput.value);
    const borderColor = borderColorInput.value;
    const qrColor = qrColorInput.value;
    const bgColor = bgColorInput.value;
    const logoSize = parseInt(logoSizeInput.value);

    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    const qr = new QRCode(tempDiv, {
        text: url,
        width: 300,
        height: 300,
        colorDark: qrColor,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        try {
            const img = new Image();
            const qrCanvas = tempDiv.querySelector('canvas');
            if (qrCanvas) {
                renderQRWithBorder(canvas, qrCanvas, borderSize, borderColor, logoSize);
            } else {
                const qrImg = tempDiv.querySelector('img');
                if (qrImg) {
                    img.onload = function() {
                        renderQRWithBorder(canvas, img, borderSize, borderColor, logoSize);
                    };
                    img.src = qrImg.src;
                }
            }
            document.body.removeChild(tempDiv);
        } catch (error) {
            console.error('Erro:', error);
            document.body.removeChild(tempDiv);
        }
    }, 200);
}

function renderQRWithBorder(canvas, qrSource, borderSize, borderColor, logoSize) {
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    const qrSize = 300;

    finalCanvas.width = qrSize + borderSize * 2;
    finalCanvas.height = qrSize + borderSize * 2;

    finalCtx.fillStyle = borderColor;
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    finalCtx.drawImage(qrSource, borderSize, borderSize, qrSize, qrSize);

    if (logoImage) {
        drawLogoOnQR(finalCanvas, logoSize);
    }

    canvas.width = finalCanvas.width;
    canvas.height = finalCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(finalCanvas, 0, 0);
}

function drawLogoOnQR(canvas, logoSize) {
    const ctx = canvas.getContext('2d');
    const canvasSize = canvas.width;
    const logoSizePixels = (canvasSize * logoSize) / 100;

    const x = (canvasSize - logoSizePixels) / 2;
    const y = (canvasSize - logoSizePixels) / 2;

    const padding = 15;
    const totalSize = logoSizePixels + padding * 2;
    const bgX = x - padding;
    const bgY = y - padding;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(bgX, bgY, totalSize, totalSize);

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeRect(bgX, bgY, totalSize, totalSize);

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logoImage, x, y, logoSizePixels, logoSizePixels);
}

const generateBtn = document.getElementById('generate-btn');

borderSizeInput.addEventListener('input', (e) => {
    borderValue.textContent = e.target.value;
});

logoSizeInput.addEventListener('input', (e) => {
    logoSizeValue.textContent = e.target.value + '%';
});

function processLogoFile(file) {
    if (!file) {
        return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Por favor, selecione uma imagem válida (PNG, JPG, GIF ou WebP)', 'error');
        logoInput.value = '';
        document.getElementById('file-name').textContent = 'Clique para selecionar imagem';
        document.getElementById('remove-logo').style.display = 'none';
        return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('A imagem não pode ter mais de 5MB', 'error');
        logoInput.value = '';
        document.getElementById('file-name').textContent = 'Clique para selecionar imagem';
        document.getElementById('remove-logo').style.display = 'none';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = function() {
            logoImage = img;
            document.getElementById('file-name').textContent = file.name;
            document.getElementById('remove-logo').style.display = 'block';
            showNotification('Imagem carregada com sucesso!', 'success');
        };
        img.onerror = function() {
            showNotification('Erro ao carregar a imagem', 'error');
            logoInput.value = '';
            document.getElementById('file-name').textContent = 'Clique para selecionar imagem';
            logoImage = null;
            document.getElementById('remove-logo').style.display = 'none';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    processLogoFile(file);
});

const fileInputWrapper = document.querySelector('.file-input-wrapper');
const fileInputLabel = document.querySelector('.file-input-label');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileInputWrapper.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    fileInputWrapper.classList.add('drag-highlight');
    fileInputLabel.classList.add('drag-over');
}

function unhighlight(e) {
    fileInputWrapper.classList.remove('drag-highlight');
    fileInputLabel.classList.remove('drag-over');
}

fileInputWrapper.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        
        if (file.type.startsWith('image/')) {
            processLogoFile(file);
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            logoInput.files = dataTransfer.files;
        } else {
            showNotification('Por favor, solte apenas imagens', 'error');
        }
    }
}

removeLogoBtn.addEventListener('click', () => {
    logoImage = null;
    logoInput.value = '';
    document.getElementById('file-name').textContent = 'Clique para selecionar imagem';
    document.getElementById('remove-logo').style.display = 'none';
    showNotification('Imagem removida', 'success');
});

generateBtn.addEventListener('click', generateQRCode);

downloadBtn.addEventListener('click', () => {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
});

copyBtn.addEventListener('click', () => {
    const canvas = document.getElementById('qr-canvas');
    canvas.toBlob((blob) => {
        navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
            showNotification('QR Code copiado para a área de transferência!');
        }).catch(() => {
            showNotification('Erro ao copiar', 'error');
        });
    });
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideInDown 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}