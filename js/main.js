document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  initContactForm();
});

// Submits the contact form via fetch so the visitor stays on the page.
// The form keeps its action/method, so if this never runs the browser
// falls back to a normal POST and the enquiry still reaches Formspree.
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button ? button.textContent : '';

  const show = (message, ok) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', !ok);
    status.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (status) status.hidden = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        show("Thanks — we've got your details and will be in touch shortly.", true);
        return;
      }

      // Formspree returns field-level reasons on a 4xx; surface them when present.
      const data = await response.json().catch(() => null);
      const detail = data && data.errors ? data.errors.map((e) => e.message).join(', ') : '';
      show(detail || 'Something went wrong. Please email hello@wolfstays.com instead.', false);
    } catch {
      show('Network error. Please check your connection, or email hello@wolfstays.com.', false);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
    }
  });
}
