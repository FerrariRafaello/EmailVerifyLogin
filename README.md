# SLogin

Uma Web‑API simples em Flask para registro, confirmação de e‑mail e login de usuários.

## Funcionalidades

1. **Registro**  
   - Recebe `name`, `email` e `password`  
   - Hash de senha com `werkzeug.security.generate_password_hash`  
   - Geração de token simples no formato `email.replace('@','_at_')`  
   - Envio de e‑mail de confirmação via SMTP (Flask‑Mail)

2. **Confirmação de e‑mail**  
   - Link de confirmação que chama `/api/confirm_email?token=…`  
   - Marca `verified = True` no armazenamento JSON

3. **Login**  
   - Validação de usuário e senha com `check_password_hash`  
   - Checa se o e‑mail já foi confirmado

4. **Frontend estático**  
   - Páginas HTML: `login.html`, `register.html`, `email_confirm.html`, `success.html`  
   - Validações e feedback em JavaScript  
   - Estilização moderna via `style.css`

## Pré‑requisitos

- Python 3.8+  
- [pipenv](https://pipenv.pypa.io/en/latest/) ou `venv` + `pip`

## Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/slogin.git
cd slogin/backend

# Crie e ative um virtualenv
python3 -m venv venv
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt
