import os
from flask import (
    Blueprint, jsonify, render_template, request, redirect,
    url_for, flash, current_app, session, g
)
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from . import db
from .models import Receta, Usuario, usuario_receta, Comentario

main_bp = Blueprint('main', __name__)

@main_bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    g.user = Usuario.query.get(user_id) if user_id else None

@main_bp.app_context_processor
def inject_user():
    return dict(current_user=g.user)

@main_bp.route('/')
def index():
    recetas = Receta.query.all()
    return render_template('index.html', recetas=recetas)

@main_bp.route('/anadir', methods=['GET', 'POST'])
def anadir_receta():
    if g.user is None:
        flash('Necesitas iniciar sesión para añadir recetas.', 'error')
        return redirect(url_for('main.iniciar_sesion'))

    if request.method == 'POST':
        titulo = request.form['titulo']
        descripcion = request.form.get('descripcion', '')
        dificultad = float(request.form['dificultad'])
        tiempo = int(request.form['tiempo'])
        ingredientes_list = request.form.getlist('ingredientes')
        ingredientes_str = ','.join(i.strip() for i in ingredientes_list if i.strip())
        etiquetas_str = request.form.get('etiquetas', '')
        proceso = request.form['proceso']

        imagen_file = request.files.get('imagen')
        if imagen_file and imagen_file.filename:
            filename = secure_filename(imagen_file.filename)
            images_dir = os.path.join(current_app.static_folder, 'images')
            os.makedirs(images_dir, exist_ok=True)
            imagen_file.save(os.path.join(images_dir, filename))
        else:
            filename = None

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
        db.session.add(nueva)
        db.session.commit()
        flash('Receta añadida exitosamente.', 'success')
        return redirect(url_for('main.index'))

    return render_template('añadir_receta.html')

@main_bp.route('/receta/<int:receta_id>')
def detalle_receta(receta_id):
    receta = Receta.query.get_or_404(receta_id)
    return render_template('detalle_receta.html', receta=receta)

@main_bp.route('/receta/<int:receta_id>/comentario', methods=['POST'])
def anadir_comentario(receta_id):
    if g.user is None:
        return jsonify({'error': 'login_required'}), 401

    data = request.get_json() or {}
    contenido = (data.get('contenido') or '').strip()
    if not contenido:
        return jsonify({'error': 'El comentario no puede estar vacío'}), 400

    receta = Receta.query.get_or_404(receta_id)
    comentario = Comentario(
        receta=receta,
        contenido=contenido,
        usuario_id=g.user.id
    )
    db.session.add(comentario)
    db.session.commit()

    return jsonify({
        'id': comentario.id,
        'contenido': comentario.contenido,
        'fecha': comentario.fecha.strftime('%Y-%m-%d %H:%M'),
        'username': g.user.username
    }), 201

@main_bp.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        username = request.form['username'].strip()
        email = request.form['email'].strip().lower()
        pwd = request.form['password']
        pwd2 = request.form['confirm_password']

        if not username or not email or not pwd:
            flash('Todos los campos son obligatorios.', 'error')
        elif pwd != pwd2:
            flash('Las contraseñas no coinciden.', 'error')
        elif Usuario.query.filter(
            (Usuario.username == username) | (Usuario.email == email)
        ).first():
            flash('El nombre de usuario o correo ya está registrado.', 'error')
        else:
            nuevo = Usuario(
                username=username,
                email=email,
                password=generate_password_hash(pwd)
            )
            db.session.add(nuevo)
            db.session.commit()
            flash('Registro exitoso. Ya puedes iniciar sesión.', 'success')
            return redirect(url_for('main.iniciar_sesion'))

    return render_template('registro.html')

@main_bp.route('/iniciar_sesion', methods=['GET', 'POST'])
def iniciar_sesion():
    if request.method == 'POST':
        ue = request.form['username_or_email'].strip()
        pwd = request.form['password']
        usuario = Usuario.query.filter(
            (Usuario.username == ue) | (Usuario.email == ue.lower())
        ).first()

        if usuario is None or not check_password_hash(usuario.password, pwd):
            flash('Usuario o contraseña incorrectos.', 'error')
        else:
            session.clear()
            session['user_id'] = usuario.id
            flash(f'¡Bienvenido, {usuario.username}!', 'success')
            return redirect(url_for('main.index'))

    return render_template('iniciar_sesion.html')

@main_bp.route('/cerrar_sesion')
def cerrar_sesion():
    session.clear()
    flash('Has cerrado sesión.', 'success')
    return redirect(url_for('main.index'))

@main_bp.route('/favoritos')
def favoritos():
    if g.user is None:
        flash('Por favor inicia sesión.', 'error')
        return redirect(url_for('main.iniciar_sesion'))
    recetas = g.user.recetas_guardadas
    return render_template('favoritos.html', recetas=recetas)

@main_bp.route('/mis_recetas')
def mis_recetas():
    if g.user is None:
        flash('Necesitas iniciar sesión para ver tus recetas.', 'error')
        return redirect(url_for('main.iniciar_sesion'))

    recetas = Receta.query.filter_by(autor_id=g.user.id).all()
    return render_template('mis_recetas.html', recetas=recetas)

@main_bp.route('/toggle_favorito/<int:receta_id>', methods=['POST'])
def toggle_favorito(receta_id):
    if g.user is None:
        return jsonify({'error': 'login_required'}), 401

    receta = Receta.query.get_or_404(receta_id)
    user_id = g.user.id

    en_fav = db.session.query(usuario_receta).filter_by(
        usuario_id=user_id, receta_id=receta_id
    ).first() is not None

    if en_fav:
        stmt = usuario_receta.delete().where(
            usuario_receta.c.usuario_id == user_id,
            usuario_receta.c.receta_id == receta_id
        )
        db.session.execute(stmt)
        nuevo_estado = False
    else:
        stmt = usuario_receta.insert().values(
            usuario_id=user_id,
            receta_id=receta_id
        )
        db.session.execute(stmt)
        nuevo_estado = True

    db.session.commit()
    return jsonify({'favorited': nuevo_estado})
