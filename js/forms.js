(function () {
  const toast = document.getElementById('toast');

  function showToast(msg, icon) {
    if (!toast) return;
    toast.querySelector('.toast-icon').textContent = icon || '✓';
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 4000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function showError(input, errorEl, msg) {
    input.style.borderColor = '#ff5e7a';
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input, errorEl) {
    input.style.borderColor = '';
    if (errorEl) errorEl.classList.remove('visible');
  }

  // ── Contact form ──────────────────────────────────────────────
  const contactForm = document.getElementById('form-contacto');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const nameInput = contactForm.querySelector('#nombre');
      const nameError = contactForm.querySelector('#error-nombre');
      if (nameInput && nameInput.value.trim().length < 2) {
        showError(nameInput, nameError, 'Introduce tu nombre.');
        valid = false;
      } else if (nameInput) {
        clearError(nameInput, nameError);
      }

      const emailInput = contactForm.querySelector('#email-contacto');
      const emailError = contactForm.querySelector('#error-email-contacto');
      if (emailInput && !isValidEmail(emailInput.value)) {
        showError(emailInput, emailError, 'Email no válido.');
        valid = false;
      } else if (emailInput) {
        clearError(emailInput, emailError);
      }

      const msgInput = contactForm.querySelector('#mensaje');
      const msgError = contactForm.querySelector('#error-mensaje');
      if (msgInput && msgInput.value.trim().length < 10) {
        showError(msgInput, msgError, 'El mensaje es demasiado breve.');
        valid = false;
      } else if (msgInput) {
        clearError(msgInput, msgError);
      }

      if (!valid) return;

      contactForm.reset();
      showToast('Mensaje recibido. Respondemos en menos de 48 h.', '✉');
    });
  }

  // ── Clear errors on input ─────────────────────────────────────
  document.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      const errId = el.id ? '#error-' + el.id : null;
      if (errId) {
        const errEl = document.querySelector(errId);
        if (errEl) errEl.classList.remove('visible');
      }
    });
  });
})();
