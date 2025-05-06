import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    # instance_relative_config=True habilita la carpeta instance/
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # Asegurarnos de que exista instance/ (para la BD)
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Ubicación de la BD dentro de instance/
    db_path = os.path.join(app.instance_path, 'recetario.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)

    # Registrar blueprints (o rutas)
    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app
