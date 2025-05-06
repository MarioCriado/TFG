document.addEventListener("DOMContentLoaded", () => {
  const imagenInput = document.getElementById("imagen");
  const previewImg = document.getElementById("preview");
  imagenInput.addEventListener("change", () => {
    const file = imagenInput.files[0];
    if (!file) {
      previewImg.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  const inputEtiquetas = document.getElementById("etiquetas_input");
  const hiddenEtiq = document.getElementById("etiquetas");
  let tagify;
  if (inputEtiquetas) {
    tagify = new Tagify(inputEtiquetas);
    document.getElementById("form-receta").addEventListener("submit", () => {
      const tags = tagify.value.map((item) => item.value);
      hiddenEtiq.value = tags.join(",");
    });
  }

  const listaIngs = document.getElementById("ingredientes-list");
  document.getElementById("btn-anadir-ing").addEventListener("click", () => {
    const grupo = document.createElement("div");
    grupo.className = "input-group mb-2";
    grupo.innerHTML = `
        <input type="text" name="ingredientes" class="form-control"
               placeholder="Ej: 1 cuchara de aceite" required>
        <button type="button" class="btn btn-danger btn-eliminar-ing">×</button>
      `;
    listaIngs.appendChild(grupo);
  });

  listaIngs.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar-ing")) {
      e.target.closest(".input-group").remove();
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const saved = localStorage.getItem("theme");
  if (
    saved === "dark" ||
    (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    body.classList.add("dark-mode");
  }

  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const imagenInput = document.getElementById("imagen");
  const previewImg = document.getElementById("preview");
  const previewBox = document.querySelector(".preview-container");

  imagenInput.addEventListener("change", () => {
    const file = imagenInput.files[0];
    if (!file) {
      previewImg.src = "";
      previewImg.style.display = "none";
      previewBox.classList.remove("show");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
      previewBox.classList.add("show");
    };
    reader.readAsDataURL(file);
  });
});

document.querySelectorAll(".btn-fav").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = btn.dataset.url;
    try {
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Error actualizando favoritos");
      const data = await res.json();

      if (data.favorited) {
        btn.classList.add("favorited");
      } else {
        btn.classList.remove("favorited");
        // Si estamos en /favoritos y quitamos uno, borramos la card
        if (window.location.pathname.includes("/favoritos")) {
          btn.closest(".card").remove();
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
});
