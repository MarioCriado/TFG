# Importaciones necesarias para trabajar con Flask, manejo de archivos, seguridad y ORM de SQLAlchemy.
import os
from flask import (
    Blueprint, jsonify, render_template, request, redirect,
    url_for, flash, current_app, session, g
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from . import db  # Base de datos importada desde el paquete actual
from .models import Receta, Usuario, usuario_receta, Comentario, Ingrediente  # Modelos del proyecto

# Configuración de un Blueprint para separar las rutas del módulo principal
main_bp = Blueprint('main', __name__)

# Middleware para cargar al usuario logueado antes de procesar cualquier solicitud
@main_bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    # Si hay un usuario en sesión, se carga su información y se asigna a `g.user`
    g.user = Usuario.query.get(user_id) if user_id else None

# Context processor para inyectar el usuario actual en las plantillas
@main_bp.app_context_processor
def inject_user():
    return dict(current_user=g.user)

# Ruta principal que muestra una lista de recetas
@main_bp.route('/')
def index():
    recetas = Receta.query.all()  # Consulta todas las recetas
    return render_template('index.html', recetas=recetas)

# Ruta para añadir una receta nueva, con soporte para GET y POST
@main_bp.route('/anadir', methods=['GET', 'POST'])
def anadir_receta():
    if g.user is None:  # Validación de usuario autenticado
        flash('Necesitas iniciar sesión para añadir recetas.', 'error')
        return redirect(url_for('main.iniciar_sesion'))

    if request.method == 'POST':  # Procesamiento del formulario
        # Recopilación de datos del formulario
        titulo = request.form['titulo']
        descripcion = request.form.get('descripcion', '')
        dificultad = float(request.form['dificultad'])
        tiempo = int(request.form['tiempo'])
        ingredientes_list = request.form.getlist('ingredientes')
        ingredientes_str = ','.join(i.strip() for i in ingredientes_list if i.strip())
        etiquetas_str = request.form.get('etiquetas', '')
        proceso = request.form['proceso']

        # Manejo de carga de archivos para la imagen
        imagen_file = request.files.get('imagen')
        if imagen_file and imagen_file.filename:
            filename = secure_filename(imagen_file.filename)  # Sanitiza el nombre del archivo
            images_dir = os.path.join(current_app.static_folder, 'images')
            os.makedirs(images_dir, exist_ok=True)  # Asegura que la carpeta existe
            imagen_file.save(os.path.join(images_dir, filename))
        else:
            filename = None  # Si no se sube imagen, se deja vacío

        # Creación de la nueva receta
        nueva = Receta(
            titulo=titulo,
            descripcion=descripcion,
            dificultad=dificultad,
            tiempo=tiempo,
            etiquetas=etiquetas_str,
            ingredientes=ingredientes_str,
            proceso=proceso,
            imagen_filename=filename,
            autor_id=g.user.id
        )
        db.session.add(nueva)  # Añade la receta a la sesión
        db.session.commit()  # Guarda los cambios en la base de datos
        flash('Receta añadida exitosamente.', 'success')
        return redirect(url_for('main.index'))

    return render_template('añadir_receta.html')

# Ruta para mostrar el detalle de una receta
@main_bp.route('/receta/<int:receta_id>')
def detalle_receta(receta_id):
    receta = Receta.query.get_or_404(receta_id)  # Busca la receta o lanza un 404
    return render_template('detalle_receta.html', receta=receta)

# Ruta para listar todos los ingredientes
@main_bp.route('/ingredientes')
def ver_ingredientes():
    if g.user is None:  # Validación de autenticación
        flash('Necesitas iniciar sesión para ver los ingredientes.', 'error')
        return redirect(url_for('main.iniciar_sesion'))
    ingredientes = Ingrediente.query.all()  # Consulta todos los ingredientes
    return render_template('ingredientes.html', ingredientes=ingredientes)

# Ruta para añadir un comentario a una receta
@main_bp.route('/receta/<int:receta_id>/comentario', methods=['POST'])
def anadir_comentario(receta_id):
    if g.user is None:  # Validación de usuario autenticado
        return jsonify({'error': 'Necesitas iniciar sesión'}), 401

    data = request.get_json() or {}
    contenido = (data.get('contenido') or '').strip()
    if not contenido:  # Validación de contenido no vacío
        return jsonify({'error': 'El comentario no puede estar vacío'}), 400

    receta = Receta.query.get_or_404(receta_id)  # Validación de receta existente
    comentario = Comentario(
        receta=receta,
        contenido=contenido,
        usuario_id=g.user.id
    )
    db.session.add(comentario)  # Añade el comentario a la sesión
    db.session.commit()  # Guarda los cambios en la base de datos

    return jsonify({
        'id': comentario.id,
        'contenido': comentario.contenido,
        'fecha': comentario.fecha.strftime('%Y-%m-%d %H:%M'),
        'username': g.user.username
    }), 201

# Ruta para registrar un nuevo usuario
@main_bp.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        username = request.form['username'].strip()
        email = request.form['email'].strip().lower()
        pwd = request.form['password']
        pwd2 = request.form['confirm_password']

        # Validaciones básicas
        if not username or not email or not pwd:
            flash('Todos los campos son obligatorios.', 'error')
        elif pwd != pwd2:
            flash('Las contraseñas no coinciden.', 'error')
        elif Usuario.query.filter(
            (Usuario.username == username) | (Usuario.email == email)
        ).first():  # Verifica si el usuario o email ya existe
            flash('El nombre de usuario o correo ya está registrado.', 'error')
        else:
            # Crea un nuevo usuario
            nuevo = Usuario(
                username=username,
                email=email,
                password=generate_password_hash(pwd)  # Hashea la contraseña
            )
            db.session.add(nuevo)
            db.session.commit()
            flash('Registro exitoso. Ya puedes iniciar sesión.', 'success')
            return redirect(url_for('main.iniciar_sesion'))

    return render_template('registro.html')

# Ruta para iniciar sesión
@main_bp.route('/iniciar_sesion', methods=['GET', 'POST'])
def iniciar_sesion():
    if request.method == 'POST':
        ue = request.form['username_or_email'].strip()
        pwd = request.form['password']
        usuario = Usuario.query.filter(
            (Usuario.username == ue) | (Usuario.email == ue.lower())
        ).first()

        if usuario is None or not check_password_hash(usuario.password, pwd):  # Validación de credenciales
            flash('Usuario o contraseña incorrectos.', 'error')
        else:
            session.clear()  # Limpia la sesión anterior
            session['user_id'] = usuario.id  # Guarda el ID del usuario en la sesión
            flash(f'¡Bienvenido, {usuario.username}!', 'success')
            return redirect(url_for('main.index'))

    return render_template('iniciar_sesion.html')

# Ruta para cerrar sesión
@main_bp.route('/cerrar_sesion')
def cerrar_sesion():
    session.clear()  # Limpia la sesión
    flash('Has cerrado sesión.', 'success')
    return redirect(url_for('main.index'))

# Ruta para ver las recetas guardadas como favoritas
@main_bp.route('/favoritos')
def favoritos():
    if g.user is None:  # Validación de autenticación
        flash('Por favor inicia sesión.', 'error')
        return redirect(url_for('main.iniciar_sesion'))
    recetas = g.user.recetas_guardadas  # Obtiene las recetas favoritas del usuario
    return render_template('favoritos.html', recetas=recetas)

# Ruta para ver las recetas creadas por el usuario actual
@main_bp.route('/mis_recetas')
def mis_recetas():
    if g.user is None:  # Validación de autenticación
        flash('Necesitas iniciar sesión para ver tus recetas.', 'error')
        return redirect(url_for('main.iniciar_sesion'))

    recetas = Receta.query.filter_by(autor_id=g.user.id).all()  # Filtra las recetas por el autor actual
    return render_template('mis_recetas.html', recetas=recetas)

# Ruta para alternar el estado de una receta como favorita
@main_bp.route('/toggle_favorito/<int:receta_id>', methods=['POST'])
def toggle_favorito(receta_id):
    if g.user is None:  # Validación de autenticación
        return jsonify({'error': 'login_required'}), 401

    receta = Receta.query.get_or_404(receta_id)  # Validación de receta existente
    user_id = g.user.id

    # Verifica si la receta ya está marcada como favorita
    en_fav = db.session.query(usuario_receta).filter_by(
        usuario_id=user_id, receta_id=receta_id
    ).first() is not None

    if en_fav:  # Si ya está en favoritos, se elimina
        stmt = usuario_receta.delete().where(
            usuario_receta.c.usuario_id == user_id,
            usuario_receta.c.receta_id == receta_id
        )
        db.session.execute(stmt)
        nuevo_estado = False
    else:  # Si no está en favoritos, se añade
        stmt = usuario_receta.insert().values(
            usuario_id=user_id,
            receta_id=receta_id
        )
        db.session.execute(stmt)
        nuevo_estado = True

    db.session.commit()  # Guarda los cambios
    return jsonify({'favorited': nuevo_estado})
