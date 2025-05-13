from . import db

usuario_receta = db.Table(
    'usuario_receta',
    db.Column('usuario_id', db.Integer, db.ForeignKey('usuario.id'), primary_key=True),
    db.Column('receta_id', db.Integer, db.ForeignKey('receta.id'), primary_key=True)
)

class Receta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    dificultad = db.Column(db.Float, nullable=False)
    tiempo = db.Column(db.Integer, nullable=False)
    etiquetas = db.Column(db.String(200))
    ingredientes = db.Column(db.Text, nullable=False)
    proceso = db.Column(db.Text, nullable=False)
    imagen_filename = db.Column(db.String(100), nullable=True)

    autor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    creador = db.relationship('Usuario', back_populates='mis_recetas')

    comentarios = db.relationship(
        'Comentario',
        back_populates='receta',
        cascade='all, delete-orphan',
        lazy='dynamic'
    )

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    recetas_guardadas = db.relationship(
        'Receta',
        secondary=usuario_receta,
        backref=db.backref('usuarios', lazy='dynamic'),
        lazy='dynamic'
    )

    mis_recetas = db.relationship(
        'Receta',
        back_populates='creador',
        lazy='dynamic'
    )

class Comentario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    receta_id = db.Column(db.Integer, db.ForeignKey('receta.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    fecha     = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    receta = db.relationship('Receta', back_populates='comentarios')
    autor  = db.relationship('Usuario')
