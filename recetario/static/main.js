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
        if (window.location.pathname.includes("/favoritos")) {
          btn.closest(".card").remove();
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sort");
  const tagInput = document.getElementById("filter-tag");
  const grid = document.querySelector(".cards-grid");
  const allCards = Array.from(grid.querySelectorAll(".card"));

  function applyClientFilters() {
    const sortBy = sortSelect.value;
    const tag = tagInput.value.trim().toLowerCase();

    let filtered = allCards.filter((card) => {
      if (!tag) return true;
      const tags = card.dataset.etiquetas.toLowerCase().split(",");
      return tags.some((t) => t.trim().includes(tag));
    });

    filtered.sort((a, b) => {
      if (sortBy === "abc") {
        return a.dataset.title.localeCompare(b.dataset.title);
      }
      if (sortBy === "diff") {
        return (
          parseFloat(a.dataset.dificultad) - parseFloat(b.dataset.dificultad)
        );
      }
      if (sortBy === "time") {
        return parseInt(a.dataset.tiempo) - parseInt(b.dataset.tiempo);
      }
      return 0;
    });

    grid.innerHTML = "";
    filtered.forEach((card) => grid.appendChild(card));
  }

  sortSelect.addEventListener("change", applyClientFilters);
  tagInput.addEventListener("input", applyClientFilters);

  applyClientFilters();
});

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".recipe-detail");
  if (!section) return;

  const recetaId = section.dataset.id;

  const btnAdd    = document.getElementById("btn-add-comment");
  const modal     = document.getElementById("comment-modal");
  const close     = document.getElementById("modal-close");
  const submit    = document.getElementById("modal-submit");
  const textarea  = document.getElementById("comment-text");
  const list      = document.getElementById("comments-list");

  if (!btnAdd || !modal) return;

  btnAdd.addEventListener("click", () => {
    modal.style.display = "flex";
    textarea.focus();
  });
  close.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  submit.addEventListener("click", async () => {
    const contenido = textarea.value.trim();
    if (!contenido) {
      alert("El comentario no puede estar vacío");
      return;
    }
    try {
      const res = await fetch(`/receta/${recetaId}/comentario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al enviar el comentario");
        return;
      }
      if (
        list.children.length === 1 &&
        list.children[0].textContent.includes("No hay comentarios")
      ) {
        list.innerHTML = "";
      }
      const li = document.createElement("li");
      li.dataset.id = data.id;
      li.style.borderBottom = "1px solid var(--border)";
      li.style.padding = "8px 0";
      li.innerHTML = `
        <small style="color:var(--text); font-size:14px;">
          <strong>${data.username}</strong> &bull; ${data.fecha}
        </small>
        <p style="margin:4px 0 0;">${data.contenido}</p>
      `;
      list.appendChild(li);
      textarea.value = "";
      modal.style.display = "none";
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar el comentario");
    }
  });
});
