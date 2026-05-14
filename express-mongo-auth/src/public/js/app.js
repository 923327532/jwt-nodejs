const fileInput = document.getElementById("file");
const uploadBtn = document.getElementById("uploadBtn");
const gallery = document.getElementById("gallery");
const statusBox = document.getElementById("status");

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

uploadBtn?.addEventListener("click", async () => {
  try {
    const file = fileInput.files[0];

    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    if (!ALLOWED.includes(file.type)) {
      alert("Solo se permite JPG, PNG o WEBP");
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("El archivo supera los 5 MB");
      return;
    }

    statusBox.textContent = "Generando URL de subida...";

    const presignRes = await fetch("/api/images/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });

    const presignData = await presignRes.json();

    if (!presignRes.ok) {
      throw new Error(presignData.message || "No se pudo generar la URL");
    }

    statusBox.textContent = "Subiendo imagen a S3...";

    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Falló la subida a S3");
    }

    statusBox.textContent = "Imagen subida correctamente";
    fileInput.value = "";
    await loadImages();
  } catch (error) {
    console.error(error);
    statusBox.textContent = "";
    alert(error.message || "Error al subir imagen");
  }
});

async function loadImages() {
  try {
    const res = await fetch("/api/images");
    const items = await res.json();

    if (!res.ok) {
      throw new Error(items.message || "No se pudo cargar la galería");
    }

    if (!Array.isArray(items) || items.length === 0) {
      gallery.innerHTML = `
        <div class="col s12">
          <div class="card-panel grey lighten-4 center-align">
            No hay imágenes todavía.
          </div>
        </div>
      `;
      return;
    }

    gallery.innerHTML = items
      .map(
        (img) => `
        <div class="col s12 m6 l4">
          <div class="card medium">
            <div class="card-image">
              <img src="${img.url}" alt="${img.key}" style="height:220px; object-fit:cover;">
            </div>
            <div class="card-content">
              <p style="word-break: break-word; font-size: 14px;">${img.key}</p>
            </div>
            <div class="card-action">
              <button
                class="btn red darken-2 waves-effect waves-light"
                onclick="deleteImage('${encodeURIComponent(img.key)}')"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error(error);
    gallery.innerHTML = `
      <div class="col s12">
        <div class="card-panel red lighten-4">
          Error cargando imágenes.
        </div>
      </div>
    `;
  }
}

async function deleteImage(key) {
  try {
    const ok = confirm("¿Seguro que quieres eliminar esta imagen?");
    if (!ok) return;

    const res = await fetch(`/api/images/${key}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "No se pudo eliminar");
    }

    await loadImages();
  } catch (error) {
    console.error(error);
    alert(error.message || "Error al eliminar imagen");
  }
}

loadImages();