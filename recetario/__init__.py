import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config

# Instancia de SQLAlchemy para manejar la base de datos
db = SQLAlchemy()
# Instancia de Migrate para manejar migraciones
migrate = Migrate()

def create_app():
    """
    Crea y configura la aplicación Flask.
    """
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # Asegura que el directorio de la instancia existe
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Configura la URI de la base de datos SQLite en el directorio de la instancia
    db_path = os.path.join(app.instance_path, 'recetario.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

    # Inicializa la base de datos y las migraciones
    db.init_app(app)
    migrate.init_app(app, db)

    # Registro del blueprint principal
    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
