function setupEyeToggle(inputID, btnId, iconId) {
    const passwordInput = document.getElementById(inputID);
    const togglePassword = document.getElementById(btnId);
    const eyeIcon = document.getElementById(iconId);

    if (!togglePassword || !eyeIcon || !passwordInput) return;

    togglePassword.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';

        eyeIcon.innerHTML = isHidden
            ? `
                <ellipse cx="12" cy="12" rx="8.5" ry="5.5" fill="none" stroke="#ffffff" stroke-width="2"/>
                <circle  cx="12" cy="12" r="2.2" fill="#000000"/>
                <line    x1="5"  y1="19" x2="19" y2="5" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
              `
            : `
                <ellipse cx="12" cy="12" rx="8.5" ry="5.5" fill="none" stroke="#bbb" stroke-width="2"/>
                <circle  cx="12" cy="12" r="2.2" fill="#bbb"/>
              `;
    });
}

function showError(input, message) {
    const group = input.closest('.input-group');
    let errorDiv = group.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        group.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearError(input) {
    const group = input.closest('.input-group');
    const errorDiv = group.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

// LOGIN
const loginForm = document.getElementById('login-form');
if (loginForm) {
    setupEyeToggle('password', 'togglePassword', 'eyeIcon');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const emailInput    = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        let valid = true;

        clearError(emailInput);
        clearError(passwordInput);

        if (!emailInput.value.includes('@')) {
            showError(emailInput, 'E-mail inválido.');
            valid = false;
        }

        if (valid) {
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email:    emailInput.value,
                        password: passwordInput.value
                    })
                });
                const data = await res.json();
                if (data.success) {
                    window.location.href = '/success.html';
                } else {
                    showError(passwordInput, data.msg || 'Erro no login.');
                }
            } catch (err) {
                showError(passwordInput, 'Erro de rede. Tente novamente.');
            }
        }
    });
}

// REGISTER
const registerForm = document.getElementById('register-form');
if (registerForm) {
    setupEyeToggle('register-password', 'toggleRegisterPassword', 'registerEyeIcon');
    setupEyeToggle('confirm-password', 'toggleConfirmPassword', 'confirmEyeIcon');

    const emailInput      = document.getElementById('register-email');
    const nameInput       = document.getElementById('register-name');
    const passwordInput   = document.getElementById('register-password');
    const confirmInput    = document.getElementById('confirm-password');
    const strengthMeter   = document.getElementById('password-strength');
    const matchMessage    = document.getElementById('password-match');

    // password strength meter
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasDigit = /\d/.test(val);
        const isStrong = val.length >= 10 && hasUpper && hasLower && hasDigit;
        const isMedium = val.length >= 7 && hasDigit;

        // remove previous strength classes
        strengthMeter.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
        if (isStrong) {
            strengthMeter.textContent = 'Senha forte';
            strengthMeter.classList.add('strength-strong');
        } else if (isMedium) {
            strengthMeter.textContent = 'Senha média';
            strengthMeter.classList.add('strength-medium');
        } else if (val.length > 0) {
            strengthMeter.textContent = 'Senha fraca';
            strengthMeter.classList.add('strength-weak');
        } else {
            strengthMeter.textContent = '';
        }
    });

    // password match
    function updatePasswordMatch() {
        matchMessage.classList.remove('match-ok', 'match-error');
        if (!confirmInput.value) {
            matchMessage.textContent = '';
            return;
        }
        if (confirmInput.value === passwordInput.value) {
            matchMessage.textContent = 'Senhas coincidem';
            matchMessage.classList.add('match-ok');
        } else {
            matchMessage.textContent = 'Senhas não coincidem';
            matchMessage.classList.add('match-error');
        }
    }
    confirmInput.addEventListener('input', updatePasswordMatch);
    passwordInput.addEventListener('input', updatePasswordMatch);

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        clearError(emailInput);
        clearError(nameInput);
        clearError(passwordInput);
        clearError(confirmInput);

        let valid = true;

        if (!emailInput.value.includes('@')) {
            showError(emailInput, 'E-mail inválido.');
            valid = false;
        }
        if (nameInput.value.trim().length < 2) {
            showError(nameInput, 'Nome muito curto.');
            valid = false;
        }
        if (passwordInput.value.length > 20) {
            showError(passwordInput, 'Máximo de 20 caracteres.');
            valid = false;
        }
        if (confirmInput.value !== passwordInput.value) {
            showError(confirmInput, 'Senhas não coincidem.');
            valid = false;
        }

        if (valid) {
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email:    emailInput.value,
                        name:     nameInput.value,
                        password: passwordInput.value
                    })
                });
                const data = await res.json();
                if (data.success) {
                    registerForm.style.display = 'none';
                    document.getElementById('register-success').textContent =
                        'Cadastro realizado! Verifique seu e‑mail para confirmar.';
                    document.getElementById('register-success').style.display = 'block';
                } else {
                    showError(emailInput, data.msg || 'Erro no cadastro!');
                }
            } catch (err) {
                showError(emailInput, 'Erro de rede. Tente novamente.');
            }
        }
    });
}
