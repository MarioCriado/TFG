import os

class Config:
    """
    Configuración principal de la aplicación Flask.
    """
    # Clave secreta para mantener la seguridad de las sesiones y los formularios
    SECRET_KEY = os.environ.get('SECRET_KEY', 'devkey')
    
    # Configuración para desactivar el seguimiento de modificaciones en SQLAlchemy
    # Mejora el rendimiento y elimina advertencias innecesarias en la consola
    SQLALCHEMY_TRACK_MODIFICATIONS = False
