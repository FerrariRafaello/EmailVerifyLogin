# SLogin

A simple Flask web API for user registration, email confirmation, and login.

## Features
1. **Registration**  
   - Accepts `name`, `email`, and `password`  
   - Password hashing with `werkzeug.security.generate_password_hash`  
   - Generates a simple token using `email.replace('@', '_at_')`  
   - Sends a confirmation email via SMTP using Flask‑Mail

2. **Email Confirmation**  
   - Confirmation link calls `/api/confirm_email?token=…`  
   - Marks `verified = True` in the JSON storage

3. **Login**  
   - Validates user and password with `check_password_hash`  
   - Checks that the email has been confirmed

4. **Static Frontend**  
   - HTML pages: `login.html`, `register.html`, `email_confirm.html`, `success.html`  
   - Client‑side validation and feedback with JavaScript  
   - Modern styling via `style.css`
---

## Prerequisites

- Python 3.8+  
- [pipenv](https://pipenv.pypa.io/en/latest/) or `venv` + `pip`
---

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/slogin.git
cd slogin/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
License
MIT License
