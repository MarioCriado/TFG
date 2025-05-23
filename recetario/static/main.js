// Espera a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", () => {

  // --- Funcionalidad para previsualizar imágenes seleccionadas ---
  const imagenInput = document.getElementById("imagen");
  const previewImg = document.getElementById("preview");

  imagenInput.addEventListener("change", () => {
    const file = imagenInput.files[0]; // Obtiene el archivo seleccionado
    if (!file) { // Si no hay archivo seleccionado
      previewImg.style.display = "none"; // Oculta la previsualización
      return;
    }
    const reader = new FileReader(); // Crea un lector de archivos
    reader.onload = (e) => { // Una vez cargado el archivo:
      previewImg.src = e.target.result; // Muestra la imagen seleccionada
      previewImg.style.display = "block"; // La hace visible
    };
    reader.readAsDataURL(file); // Convierte el archivo en una URL
  });

  // --- Gestión de etiquetas con Tagify ---
  const inputEtiquetas = document.getElementById("etiquetas_input");
  const hiddenEtiq = document.getElementById("etiquetas");
  let tagify;
  if (inputEtiquetas) { 
    tagify = new Tagify(inputEtiquetas); // Inicializa Tagify
    document.getElementById("form-receta").addEventListener("submit", () => {
      const tags = tagify.value.map((item) => item.value); // Recoge las etiquetas
      hiddenEtiq.value = tags.join(","); // Convierte las etiquetas en un string separado por comas
    });
  }

  // --- Gestión dinámica de ingredientes ---
  const listaIngs = document.getElementById("ingredientes-list");
  document.getElementById("btn-anadir-ing").addEventListener("click", () => {
    const grupo = document.createElement("div"); // Crea un grupo de entrada
    grupo.className = "input-group";
    grupo.innerHTML = `
        <input type="text" name="ingredientes" class="form-control"
               placeholder="Ej: 1 cuchara de aceite" required>
        <button type="button" class="btn btn-danger btn-eliminar-ing">x</button>
      `;
    listaIngs.appendChild(grupo); // Añade el nuevo grupo a la lista
  });

  listaIngs.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar-ing")) {
      e.target.closest(".input-group").remove(); // Elimina un ingrediente
    }
  });

});

// --- Cambio de tema (modo claro/oscuro) ---
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  const saved = localStorage.getItem("theme"); // Recupera el tema guardado
  if (
    saved === "dark" ||
    (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    body.classList.add("dark-mode"); // Aplica el tema oscuro si está configurado
  }

  toggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode"); // Alterna entre los temas
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light"); // Guarda el tema seleccionado
  });
});

// --- Previsualización de imágenes con contenedor adicional ---
document.addEventListener("DOMContentLoaded", () => {
  const imagenInput = document.getElementById("imagen");
  const previewImg = document.getElementById("preview");
  const previewBox = document.querySelector(".preview-container");

  imagenInput.addEventListener("change", () => {
    const file = imagenInput.files[0]; // Obtiene el archivo seleccionado
    if (!file) {
      // Si no hay archivo, oculta la previsualización y elimina la clase "show"
      previewImg.src = "";
      previewImg.style.display = "none";
      previewBox.classList.remove("show");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      // Muestra la imagen dentro del contenedor
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
      previewBox.classList.add("show");
    };
    reader.readAsDataURL(file);
  });
});

// --- Gestión de favoritos ---
document.querySelectorAll(".btn-fav").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault(); // Evita el comportamiento predeterminado del enlace
    const url = btn.dataset.url; // Obtiene la URL del endpoint
    try {
      const res = await fetch(url, { method: "POST" }); // Envía la solicitud
      if (!res.ok) throw new Error("Error actualizando favoritos");
      const data = await res.json();

      if (data.favorited) {
        btn.classList.add("favorited"); // Marca como favorito
      } else {
        btn.classList.remove("favorited"); // Elimina la marca de favorito
        if (window.location.pathname.includes("/favoritos")) {
          btn.closest(".card").remove(); // Elimina la tarjeta si está en la página de favoritos
        }
      }
    } catch (err) {
      console.error(err); // Maneja errores de la solicitud
    }
  });
});

// --- Filtros en el cliente para tarjetas ---
document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sort");
  const tagInput = document.getElementById("filter-tag");
  const grid = document.querySelector(".cards-grid");
  const allCards = Array.from(grid.querySelectorAll(".card")); // Obtiene todas las tarjetas

  function applyClientFilters() {
    const sortBy = sortSelect.value; // Obtiene el criterio de ordenación
    const tag = tagInput.value.trim().toLowerCase(); // Obtiene el filtro de etiquetas

    let filtered = allCards.filter((card) => {
      if (!tag) return true; // Si no hay filtro, incluye todas las tarjetas
      const tags = card.dataset.etiquetas.toLowerCase().split(",");
      return tags.some((t) => t.trim().includes(tag)); // Verifica si la etiqueta coincide
    });

    // Ordena las tarjetas según el criterio seleccionado
    filtered.sort((a, b) => {
      if (sortBy === "abc") {
        return a.dataset.title.localeCompare(b.dataset.title);
      }
      if (sortBy === "diff") {
        return parseFloat(a.dataset.dificultad) - parseFloat(b.dataset.dificultad);
      }
      if (sortBy === "time") {
        return parseInt(a.dataset.tiempo) - parseInt(b.dataset.tiempo);
      }
      return 0;
    });

    // Vacía el contenedor y lo rellena con las tarjetas filtradas
    grid.innerHTML = "";
    filtered.forEach((card) => grid.appendChild(card));
  }

  sortSelect.addEventListener("change", applyClientFilters); // Aplica filtros al cambiar el criterio
  tagInput.addEventListener("input", applyClientFilters); // Aplica filtros al modificar el filtro de etiquetas

  applyClientFilters(); // Aplica filtros al cargar la página
});

// --- Función para mostrar notificaciones (toasts) ---
function showToast(message, duration = 3000) {
  const container = document.getElementById("toast-container"); // Contenedor de toasts
  const toast = document.createElement("div"); // Crea un nuevo toast
  toast.className = "toast";
  toast.textContent = message; // Establece el mensaje del toast
  container.appendChild(toast); // Agrega el toast al contenedor

  setTimeout(() => {
    // Añade clase para la animación de desaparición
    toast.classList.add("fade-out");
    toast.addEventListener("animationend", () => toast.remove()); // Elimina el toast después de la animación
  }, duration); // Duración configurable antes de eliminar
}

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".recipe-detail"); // Sección de detalle de receta
  if (!section) return;

  const recetaId = section.dataset.id; // ID de la receta
  const btnAdd = document.getElementById("btn-add-comment"); // Botón para añadir comentario
  const modal = document.getElementById("comment-modal"); // Modal para añadir comentarios
  const close = document.getElementById("modal-close"); // Botón para cerrar el modal
  const submit = document.getElementById("modal-submit"); // Botón para enviar comentario
  const textarea = document.getElementById("comment-text"); // Campo de texto del comentario
  const list = document.getElementById("comments-list"); // Lista de comentarios

  // Abre el modal para añadir un comentario
  btnAdd.addEventListener("click", () => {
    if (!btnAdd.dataset.logged || btnAdd.dataset.logged === "false") {
      showToast("Necesitas iniciar sesión para añadir comentarios", 2500);
      setTimeout(() => {
        window.location = "/iniciar_sesion"; // Redirige a iniciar sesión si no está autenticado
      }, 1000);
      return;
    }
    modal.style.display = "flex"; // Muestra el modal
    textarea.focus(); // Fija el foco en el campo de texto
  });

  // Cierra el modal al hacer clic en el botón de cerrar o fuera del modal
  close.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Envía el comentario al servidor
  submit.addEventListener("click", async () => {
    const contenido = textarea.value.trim(); // Obtiene y limpia el texto del comentario
    if (!contenido) {
      showToast("El comentario no puede estar vacío", 2500); // Validación de campo vacío
      return;
    }
    try {
      // Envío de solicitud POST al servidor
      const res = await fetch(`/receta/${recetaId}/comentario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido }),
      });
      const data = await res.json();

      // Manejo de errores del servidor
      if (res.status === 401) {
        showToast(data.error || "Necesitas iniciar sesión", 2500);
        setTimeout(() => {
          window.location = "/iniciar_sesion";
        }, 1000);
        return;
      }
      if (res.status === 400) {
        showToast(data.error || "Error en el comentario", 2500);
        return;
      }
      if (!res.ok) {
        showToast("Error al enviar el comentario", 2500);
        return;
      }

      // Añade el comentario a la lista si la solicitud es exitosa
      if (
        list.children.length === 1 &&
        list.children[0].textContent.includes("No hay comentarios")
      ) {
        list.innerHTML = "";
      }
      const li = document.createElement("li");
      li.dataset.id = data.id; // ID del nuevo comentario
      li.innerHTML = `
        <small style="color:var(--text); font-size:16px;">
          <strong>${data.username}</strong> &bull; ${data.fecha}
        </small>
        <p style="margin:4px 0 0;">${data.contenido}</p>
      `;
      list.appendChild(li); // Agrega el nuevo comentario a la lista

      // Limpia el modal y oculta después de enviar
      textarea.value = "";
      modal.style.display = "none";
    } catch (err) {
      console.error(err); // Manejo de errores de red o solicitud
      showToast("No se pudo enviar el comentario", 2500);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.CURRENT_USER || ""; // Usuario actual (si está autenticado)
  const CART_KEY = currentUser ? `cart_${currentUser}` : null; // Clave única del carrito en localStorage

  // --- Carga el carrito desde localStorage ---
  function loadCart() {
    if (!CART_KEY) return {}; // Si no hay usuario, devuelve un carrito vacío
    const json = localStorage.getItem(CART_KEY); // Obtiene los datos del carrito
    return json ? JSON.parse(json) : {}; // Convierte los datos a objeto
  }

  // --- Guarda el carrito en localStorage ---
  function saveCart(cart) {
    if (!CART_KEY) return; // Si no hay clave, no guarda nada
    localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Convierte y guarda en localStorage
    renderCart(cart); // Actualiza la interfaz del carrito
  }

  // Elementos del DOM relacionados con el carrito
  const sidebar = document.getElementById("cart-sidebar"); // Barra lateral del carrito
  const btnToggle = document.getElementById("cart-toggle"); // Botón para abrir/cerrar carrito
  const btnClose = document.getElementById("cart-close"); // Botón para cerrar carrito
  const countEl = document.getElementById("cart-count"); // Contador de artículos
  const itemsEl = document.getElementById("cart-items"); // Contenedor de artículos en carrito
  const totalEl = document.getElementById("cart-total"); // Total del carrito
  const btnConfirm = document.getElementById("cart-confirm"); // Botón de confirmación de compra

  let carrito = loadCart(); // Carga inicial del carrito

  // --- Renderiza los datos del carrito ---
  function renderCart() {
    itemsEl.innerHTML = ""; // Limpia la lista de artículos
    let total = 0, countItems = 0; // Inicializa totales

    // Itera sobre los artículos del carrito
    for (const id in carrito) {
      const item = carrito[id];
      countItems++; // Incrementa el contador de artículos
      total += item.precio * item.cantidad; // Suma al total del carrito

      // Crea el elemento visual para cada artículo
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="item-info">${item.nombre}</div>
        <div class="qty-controls">
          <button class="dec" data-id="${id}">-</button>
          <span>${item.cantidad}</span>
          <button class="inc" data-id="${id}">+</button>
        </div>
        <div>${(item.precio * item.cantidad).toFixed(2)} €</div>
        <button class="remove-item" data-id="${id}">x</button>
      `;
      itemsEl.appendChild(li); // Agrega el artículo al contenedor
    }

    countEl.textContent = countItems; // Actualiza el contador de artículos
    totalEl.textContent = total.toFixed(2); // Actualiza el total del carrito
  }

  // --- Manejo de eventos dentro del carrito ---
  itemsEl.addEventListener("click", (e) => {
    const id = e.target.dataset.id; // Obtiene el ID del artículo
    if (!id) return;

    // Incrementa la cantidad
    if (e.target.classList.contains("inc")) {
      carrito[id].cantidad++;
    }

    // Decrementa la cantidad o elimina si llega a 0
    if (e.target.classList.contains("dec")) {
      if (carrito[id].cantidad > 1) carrito[id].cantidad--;
      else delete carrito[id];
    }

    // Elimina el artículo del carrito
    if (e.target.classList.contains("remove-item")) {
      delete carrito[id];
    }

    saveCart(carrito); // Guarda los cambios
  });

  // --- Añade un artículo al carrito ---
  document.querySelectorAll(".btn-add-ing").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!currentUser) {
        window.location = "{{ url_for('main.iniciar_sesion') }}"; // Redirige si no está autenticado
        return;
      }
      const card = btn.closest(".ing-card"); // Encuentra la tarjeta del artículo
      const id = card.dataset.id;
      const nombre = card.dataset.nombre;
      const precio = parseFloat(card.dataset.precio);

      if (!carrito[id]) {
        carrito[id] = { id, nombre, precio, cantidad: 0 }; // Añade nuevo artículo al carrito
      }
      carrito[id].cantidad++; // Incrementa la cantidad
      saveCart(carrito); // Guarda el carrito
      showToast(`“${nombre}” añadido al carrito`, 2000); // Muestra notificación
    });
  });

  // --- Abre y cierra la barra lateral del carrito ---
  if (btnToggle)
    btnToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  if (btnClose)
    btnClose.addEventListener("click", () => sidebar.classList.remove("open"));

  // --- Confirma la compra ---
  if (btnConfirm)
    btnConfirm.addEventListener("click", () => {
      if (!Object.keys(carrito).length) {
        showToast("El carrito está vacío", 2000); // Muestra mensaje si el carrito está vacío
        return;
      }
      sidebar.classList.remove("open"); // Cierra el carrito
      showToast("Pedido confirmado. ¡Gracias!", 2000); // Muestra mensaje de éxito
      carrito = {}; // Vacía el carrito
      saveCart(carrito); // Guarda el carrito vacío
    });

  if (currentUser) renderCart(); // Renderiza el carrito si hay un usuario autenticado
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("mobile-menu-toggle"); // Botón para abrir/cerrar el menú
  const nav = document.getElementById("mobile-nav"); // Contenedor del menú móvil

  if (!btn || !nav) return; // Si no existen los elementos, salir

  // --- Abre o cierra el menú móvil al hacer clic en el botón ---
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Detiene la propagación del evento
    nav.classList.toggle("open"); // Alterna la clase "open" para mostrar/ocultar el menú
  });

  // --- Cierra el menú móvil al hacer clic fuera de él ---
  document.addEventListener("click", (e) => {
    // Verifica si el menú está abierto y si el clic no fue en el menú ni en el botón
    if (
      nav.classList.contains("open") &&
      !nav.contains(e.target) &&
      e.target !== btn
    ) {
      nav.classList.remove("open"); // Cierra el menú
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Selecciona todos los botones que permiten alternar la visibilidad de contraseñas
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".password-wrapper"); // Encuentra el contenedor más cercano
      const input = wrapper.querySelector("input"); // Obtiene el campo de entrada de contraseña
      const eye = btn.querySelector(".icon-eye"); // Icono de "ojo"
      const slash = btn.querySelector(".icon-eye-slash"); // Icono de "ojo tachado"
      const isPwd = input.type === "password"; // Verifica si el campo está en modo contraseña

      input.type = isPwd ? "text" : "password"; // Cambia entre texto y contraseña
      eye.style.display = isPwd ? "none" : "block"; // Muestra el icono adecuado
      slash.style.display = isPwd ? "block" : "none"; // Oculta el icono contrario
      btn.setAttribute(
        "aria-label",
        isPwd ? "Ocultar contraseña" : "Mostrar contraseña" // Actualiza la etiqueta accesible
      );
    });
  });
});
