document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const formsWrapper = document.querySelector('.forms-wrapper');

  // Link triggers
  const showRegisterLink = document.getElementById('showRegister');
  const showLoginLink = document.getElementById('showLogin');
  const showForgotPasswordLink = document.getElementById('showForgotPassword');
  const backToLoginLink = document.getElementById('backToLogin');

  const allForms = [loginForm, registerForm, forgotPasswordForm];

  // Function to show a specific form and hide others with transitions
  const showForm = (formToShow) => {
    if (!formToShow) return;

    allForms.forEach(form => {
      if (form === formToShow) {
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        form.style.transform = 'scale(1)';
        // We use display none/block to prevent invisible forms from being tabbable
        form.style.display = 'block'; 
      } else if (form) {
        form.style.opacity = '0';
        form.style.pointerEvents = 'none';
        form.style.transform = 'scale(0.98)';
        // After transition, hide it completely
        setTimeout(() => {
          if (form.style.opacity === '0') form.style.display = 'none';
        }, 500); // 500ms matches the CSS transition time
      }
    });
    // Adjust container height
    setTimeout(() => {
      formsWrapper.style.height = `${formToShow.scrollHeight}px`;
    }, 100); // Small delay to allow form to render
  };

  // Main function to control visibility based on URL hash
  const updateView = () => {
    const hash = window.location.hash;
    if (hash === '#register') {
      showForm(registerForm);
    } else if (hash === '#forgot-password') {
      showForm(forgotPasswordForm);
    } else {
      showForm(loginForm);
    }
  };

  // Event listeners for links
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'register';
    });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'login';
    });
  }
  if (showForgotPasswordLink) {
    showForgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'forgot-password';
    });
  }
  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'login';
    });
  }

  // Listen to hash changes to update the view
  window.addEventListener('hashchange', updateView);

  // Set initial view on page load
  updateView();

  // Listen for successful registration to switch back to login
  document.addEventListener('registrationSuccess', () => {
    window.location.hash = 'login';
  });

  // Recalculate height on window resize
  window.addEventListener('resize', updateView);
}); 