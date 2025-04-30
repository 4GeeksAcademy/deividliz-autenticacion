import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from api.models import db
from api.utils import APIException, generate_sitemap
from api.admin import setup_admin
from api.commands import setup_commands

db = db
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY', "cambia-esta-clave-secreta-ya!")

db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)
jwt.init_app(app)

try:
    from api.routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
except ImportError as e:
     print(f"Error importing or registering blueprint: {e}")

if 'setup_admin' in globals():
    setup_admin(app)
if 'setup_commands' in globals():
    setup_commands(app)

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)