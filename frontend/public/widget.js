(function () {
  const scriptTag = document.currentScript;
  const API_KEY = scriptTag.getAttribute('data-api-key');
  const API_URL = scriptTag.getAttribute('data-api-url') || 'http://localhost:8001';

  if (!API_KEY) {
    console.error('TryOn.ai widget: missing data-api-key attribute on script tag.');
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .tryon-modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      z-index: 999999; display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .tryon-modal {
      background: #fff; border-radius: 12px; width: 90%; max-width: 420px;
      max-height: 90vh; overflow-y: auto; padding: 24px; position: relative;
    }
    .tryon-modal h3 { margin: 0 0 16px; font-size: 18px; color: #111; }
    .tryon-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      font-size: 20px; cursor: pointer; color: #666;
    }
    .tryon-upload-box {
      border: 2px dashed #ccc; border-radius: 8px; padding: 24px; text-align: center;
      cursor: pointer; margin-bottom: 16px; color: #666; font-size: 14px;
    }
    .tryon-upload-box img { max-width: 100%; max-height: 200px; border-radius: 6px; }
    .tryon-btn {
      width: 100%; background: #111; color: #fff; border: none; padding: 12px;
      border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 500;
    }
    .tryon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .tryon-result img {
      width: 100%; border-radius: 8px; margin-top: 16px;
    }
    .tryon-error { color: #d33; font-size: 13px; margin-top: 8px; }
    .tryon-download {
      display: block; text-align: center; margin-top: 12px; background: #fff;
      border: 1px solid #ccc; padding: 10px; border-radius: 8px; color: #111;
      text-decoration: none; font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function imageUrlToBase64(url) {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  function openModal(garmentImage, garmentDesc) {
    const overlay = document.createElement('div');
    overlay.className = 'tryon-modal-overlay';

    overlay.innerHTML = `
      <div class="tryon-modal">
        <button class="tryon-close">&times;</button>
        <h3>Try It On</h3>
        <div class="tryon-upload-box" id="tryon-upload-box">
          Click to upload your photo
        </div>
        <input type="file" accept="image/*" id="tryon-file-input" style="display:none" />
        <button class="tryon-btn" id="tryon-submit-btn" disabled>Try it on</button>
        <div id="tryon-error-area"></div>
        <div id="tryon-result-area"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.tryon-close');
    const uploadBox = overlay.querySelector('#tryon-upload-box');
    const fileInput = overlay.querySelector('#tryon-file-input');
    const submitBtn = overlay.querySelector('#tryon-submit-btn');
    const errorArea = overlay.querySelector('#tryon-error-area');
    const resultArea = overlay.querySelector('#tryon-result-area');

    let selectedFile = null;

    closeBtn.onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    uploadBox.onclick = () => fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;
      selectedFile = file;
      const previewUrl = URL.createObjectURL(file);
      uploadBox.innerHTML = `<img src="${previewUrl}" />`;
      submitBtn.disabled = false;
      errorArea.innerHTML = '';
      resultArea.innerHTML = '';
    };

    submitBtn.onclick = async () => {
      if (!selectedFile) return;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Generating... this may take up to 2 minutes';
      errorArea.innerHTML = '';
      resultArea.innerHTML = '';

      try {
        const personBase64 = await fileToBase64(selectedFile);
        const garmentBase64 = await imageUrlToBase64(garmentImage);

        const res = await fetch(`${API_URL}/tryon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify({
            person_image: personBase64,
            garment_image: garmentBase64,
            garment_description: garmentDesc || 'a shirt',
          }),
        });

        const data = await res.json();

        if (data.result_image) {
          let swatchesHTML = '';
          if (data.skin_tone && data.skin_tone.suggested_palette) {
            const st = data.skin_tone;
            const swatches = st.suggested_palette.map(c =>
              `<div style="text-align:center">
                <div style="width:36px;height:36px;border-radius:50%;background:${c.hex};margin:0 auto 4px;border:1px solid #ddd"></div>
                <div style="font-size:10px;color:#666">${c.name}</div>
              </div>`
            ).join('');
            swatchesHTML = `
              <div style="margin-top:16px;padding:14px;background:#f9f9f9;border-radius:8px">
                <div style="font-size:12px;font-weight:600;color:#111;margin-bottom:4px">🎨 Colors that complement your tone</div>
                <div style="font-size:11px;color:#888;margin-bottom:12px">Season: ${st.season} · Undertone: ${st.undertone}</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${swatches}</div>
              </div>
            `;
          }
          resultArea.innerHTML = `
            <div class="tryon-result">
              <img src="data:image/png;base64,${data.result_image}" />
              ${swatchesHTML}
              <a class="tryon-download" download="tryon-result.png" href="data:image/png;base64,${data.result_image}">Download</a>
            </div>
          `;
        } else {
          errorArea.innerHTML = `<div class="tryon-error">${data.detail || 'Something went wrong. Please try again.'}</div>`;
        }
      } catch (err) {
        errorArea.innerHTML = `<div class="tryon-error">Something went wrong. Please try again.</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Try it on';
      }
    };
  }

  function init() {
    document.querySelectorAll('.tryon-trigger').forEach((el) => {
      el.addEventListener('click', () => {
        const garmentImage = el.getAttribute('data-garment-image');
        const garmentDesc = el.getAttribute('data-garment-desc');
        if (!garmentImage) {
          console.error('TryOn.ai widget: trigger element missing data-garment-image attribute.');
          return;
        }
        openModal(garmentImage, garmentDesc);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();