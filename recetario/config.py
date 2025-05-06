import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'devkey')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # NO definimos aquí SQLALCHEMY_DATABASE_URI
