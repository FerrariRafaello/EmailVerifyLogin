# Import libraries.
from flask import Flask, request, jsonify, send_from_directory, abort
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib
import logging
import os
import json

# Configure logging to output INFO level messages
logging.basicConfig(level= logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask aplication
app = Flask(__name__, static_folder="../frontend")

# Configure email settings for Flask-Mail
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME", "YOR_EMAIL")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "YOR_PASSCODE")
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
mail = Mail(app)

# Path to JSON file storing user data. 
USERS_FILE = "users.json"

class APIError(Exception):
    pass

class UsersStorage:
    """
    Class for loading and saving user login data
    stored in a JSON file defined by USERS_FILE
    """

    @staticmethod
    def load_users():
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r") as file:
                return json.load(file)
        return {}
    
    @staticmethod
    def save_users(users: dict):
        with open(USERS_FILE, "w") as file:
            json.dump(users, file, indent=4)



@app.route("/")
@app.route("/login")
def serve_login_alias():
    return send_from_directory(app.static_folder, "login.html") 

@app.route("/register")
def serve_register():
    return send_from_directory(app.static_folder, "register.html")

@app.route("/email_confirm")
def serve_email_confirm():
    return send_from_directory(app.static_folder, "email_confirm.html")
    
@app.route("/success")
def serve_success():
    return send_from_directory(app.static_folder, "success.html")
    
@app.route("/<path:path>")
def static_proxy(path):
    try:
        return send_from_directory(app.static_folder, path)
    except FileNotFoundError:
        abort(404)

class Register(UsersStorage):
    @app.route("/api/register", methods=["POST"])
    def api_register():
        data = request.json
        users = UsersStorage.load_users()
        email = data.get("email")
        if email in users:
            return jsonify({"success": False, "msg": "E-mail já registrado!"}), 400
        
        users[email] = {
            "name": data.get("name"),
            "password": generate_password_hash(data.get("password")),
            "verified": False
        }
        UsersStorage.save_users(users)

        # Sending confirmation email
        token = email.replace("@", "_at_")
        confirm_url = f"http://127.0.0.1:5000/email_confirm?token={token}"
        msg = Message("Confirme seu cadastro.",
                      sender=app.config["MAIL_USERNAME"],
                      recipients=[email])
        msg.body = f"""Olá {data.get("name")},\n 
        Obrigado por se cadastrar no SLogin!
        Clique no link abaixo para confirmar seu cadastro: 
        {confirm_url}
        """
        try:
            mail.send(msg)
        except smtplib.SMTPException as e: 
            del users[email]
            UsersStorage.save_users(users)
            return jsonify({"success": False, "msg": "Error ao enviar e-mail. Tente novamente."}), 500
        
        return jsonify({"success": True, "msg": "Cadastro realizado com sucesso! Verifique seu e-mail para confirmar."})
    
class EmailConfirmation(UsersStorage):
    @app.route("/api/confirm_email", methods=["GET"])
    def api_confirm_email():
        token = request.args.get("token")
        email = token.replace("_at_", "@")
        users = UsersStorage.load_users()
        if email in users:
            users[email]["verified"] = True
            UsersStorage.save_users(users)
            return jsonify({"success": True})
        return jsonify({"success": False}), 400
    
class UserLogin:
    @app.route("/api/login", methods= ["POST"])
    def api_login():
        data = request.json
        email = data.get("email")
        password = data.get("password")
        users = UsersStorage.load_users()
        user = users.get(email)
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"success": False, "msg": "Usuário ou senha incorretos"}), 400
        if not user.get("verified"):
            return jsonify({"success": False, "msg": "Confirme seu email antes de entrar."}), 400
        return jsonify({"success": True})
    
if __name__ == "__main__":
    app.run(debug= True)