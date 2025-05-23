# Recetario Flask Application

## Descripción

Recetario es una aplicación web construida con Flask que permite a los usuarios registrar y gestionar recetas de cocina. Incluye funcionalidades de autenticación, CRUD de recetas, comentarios, gestión de favoritos, listado y carrito de ingredientes.

## Requisitos Previos

* Python 3.8+ instalado en tu sistema.
* pip (gestor de paquetes de Python).

## Instalación y Puesta en Marcha

1. Clona el repositorio desde GitHub:

   ```bash
   git clone https://github.com/tu_usuario/recetario.git
   cd recetario
   ```
2. Instala las dependencias:

   ```bash
   pip install -r requirements.txt
   ```
3. Inicializa la base de datos y ejecuta migraciones:

   ```bash
   flask db init
   flask db migrate -m "Inicializar esquema"
   flask db upgrade
   ```
4. Ejecuta la aplicación en modo desarrollo:

   ```bash
   flask run
   ```

   * La aplicación estará accesible en `http://127.0.0.1:5000/`.

## Estructura de Directorios

```
├── __pycache__/                # Caché de Python
├── instance/
│   └── recetario.db            # Base de datos SQLite
├── recetario/                  # Paquete principal de la app
│   ├── __pycache__/
│   ├── static/                 # Archivos estáticos (CSS, JS, imágenes)
│   ├── templates/              # Plantillas Jinja2 (HTML)
│   ├── __init__.py             # Inicialización de Flask y factory
│   ├── config.py               # Configuración de la aplicación
│   ├── models.py               # Modelos SQLAlchemy
│   └── routes.py               # Definición de rutas y controladores
├── app.py                      # Iniciar aplicación
├── requirements.txt            # Dependencias del proyecto
└── start                       # Script de arranque para render
```

## Rutas Disponibles

* `/` : Página principal con listado de recetas.
* `/anadir` : Formulario para añadir una nueva receta (GET/POST).
* `/receta/<int:receta_id>` : Detalle de receta.
* `/receta/<int:receta_id>/comentario` : Método para añadir comentario (POST).
* `/ingredientes` : Listado de ingredientes.
* `/registro` : Registro de usuarios (GET/POST).
* `/iniciar_sesion` : Inicio de sesión (GET/POST).
* `/cerrar_sesion` : Cerrar sesión.
* `/favoritos` : Recetas marcadas como favoritas.
* `/mis_recetas` : Recetas creadas por el usuario.
* `/toggle_favorito/<int:receta_id>` : Método para alternar favorito (POST).

## Gestión de la Base de Datos

Se utiliza Flask-Migrate para manejar las migraciones. Comandos:

```bash
flask db init      # Inicializa migraciones
flask db migrate   # Genera nueva migración
flask db upgrade   # Aplica migraciones
```

## Características y Funcionalidades

* Autenticación de usuarios (registro, inicio/cierre de sesión).
* CRUD de recetas con subida de imágenes.
* Etiquetas y lista dinámica de ingredientes.
* Comentarios en tiempo real con feedback al usuario.
* Favoritos y carrito de ingredientes en localStorage.
* Tema claro/oscuro adaptativo.

## Tecnologías Utilizadas

* Flask como framework web.
* SQLAlchemy + Flask-Migrate para ORM y migraciones.
* Jinja2 para plantillas.
* JavaScript Vanilla para la interactividad del cliente.
* SQLite por defecto (configurable en `config.py`).

## Contacto

* Mario Criado Guerrero - Responsable del proyecto
