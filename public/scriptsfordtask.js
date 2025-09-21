// ====================== Main Script ======================
document.addEventListener("DOMContentLoaded", () => {

  // ====================== Newsletter Modal ======================
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterEmail = document.getElementById("newsletterEmail");
  const thankYouModalEl = document.getElementById("thankYouModal");

  if (newsletterForm && newsletterEmail && thankYouModalEl) {
    const thankYouModal = new bootstrap.Modal(thankYouModalEl);
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (newsletterEmail.value.trim() !== "") {
        thankYouModal.show();
        newsletterForm.reset();
      }
    });
  }

  // ====================== Contact Form Validation ======================
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const phoneField = document.getElementById("phone");
    const messageField = document.getElementById("message");

    contactForm.addEventListener("submit", function (e) {
      let valid = true;

      if (nameField && nameField.value.trim() === "") {
        showError(nameField, "You did not enter your name");
        valid = false;
      } else clearError(nameField);

      const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (emailField && !emailPattern.test(emailField.value.trim())) {
        showError(emailField, "Please enter a valid email address");
        valid = false;
      } else clearError(emailField);

      const phonePattern = /^[0-9]{10}$/;
      if (phoneField && !phonePattern.test(phoneField.value.trim())) {
        showError(phoneField, "Phone must be 10 digits");
        valid = false;
      } else clearError(phoneField);

      if (messageField && messageField.value.trim() === "") {
        showError(messageField, "Message cannot be empty");
        valid = false;
      } else clearError(messageField);

      if (!valid) e.preventDefault();
    });
  }

  function showError(input, message) {
    if (!input) return;
    let errorSpan = input.parentNode.querySelector(".error-message");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error-message text-danger ms-2";
      errorSpan.style.float = "right";
      errorSpan.style.fontSize = "0.9rem";
      input.parentNode.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function clearError(input) {
    if (!input) return;
    let errorSpan = input.parentNode.querySelector(".error-message");
    if (errorSpan) errorSpan.textContent = "";
  }

  // ====================== Greeting Toast ======================
  const toastEl = document.getElementById("greetingToast");
  const greetingElement = document.getElementById("greetingMessage");
  if (toastEl && greetingElement) {
    const hour = new Date().getHours();
    let timeGreeting = "Welcome to OtaZora!";
    if (hour < 12) timeGreeting = "Good morning!";
    else if (hour < 18) timeGreeting = "Good afternoon!";
    else timeGreeting = "Good evening!";

    greetingElement.innerHTML = timeGreeting;
    new bootstrap.Toast(toastEl, { delay: 5000 }).show();
  }

  // ====================== Hover Highlight Effect ======================
  document.querySelectorAll(".section-box").forEach(box => {
    box.addEventListener("mouseover", () => { box.style.backgroundColor = "#ffeaa7"; });
    box.addEventListener("mouseout", () => { box.style.backgroundColor = ""; });
  });

  // ====================== Back to Top Button ======================
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) backToTopBtn.classList.add("show");
      else backToTopBtn.classList.remove("show");
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ====================== Bootstrap Validation ======================
  (() => {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  })();

  // ====================== Register/Login Toggle ======================
  const showRegisterBtn = document.getElementById("showRegister");
  const showLoginBtn = document.getElementById("showLogin");
  const registerFormEl = document.getElementById("registerForm");
  const loginFormEl = document.getElementById("loginForm");

  if (showRegisterBtn && showLoginBtn && registerFormEl && loginFormEl) {
    showRegisterBtn.addEventListener("click", () => {
      registerFormEl.style.display = "block";
      loginFormEl.style.display = "none";
    });

    showLoginBtn.addEventListener("click", () => {
      registerFormEl.style.display = "none";
      loginFormEl.style.display = "block";
    });
  }

  // ====================== CAPTCHA ======================
  const captchaCanvas = document.getElementById("captchaCanvas");
  const ctx = captchaCanvas ? captchaCanvas.getContext("2d") : null;
  const captchaInput = document.getElementById("captchaInput");
  const captchaVerifyBtn = document.getElementById("captchaVerifyBtn");
  const captchaRefreshBtn = document.getElementById("captchaRefreshBtn");
  const captchaMsg = document.getElementById("captchaMsg");
  const submitBtn = document.getElementById("submitBtn");

  let captchaCode = "";

  function generateCaptcha() {
    if (!ctx) return;
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#000";
    captchaCode = Math.floor(100000 + Math.random() * 900000).toString();
    ctx.fillText(captchaCode, 10, 30);
  }

  if (ctx) generateCaptcha();

  if (captchaVerifyBtn) {
    captchaVerifyBtn.addEventListener("click", () => {
      if (captchaInput.value === captchaCode) {
        captchaMsg.classList.add("text-success");
        captchaMsg.textContent = "Captcha passed! You can now submit.";
        captchaMsg.classList.remove("d-none");
        submitBtn.disabled = false;
      } else {
        captchaMsg.classList.add("text-danger");
        captchaMsg.textContent = "Captcha incorrect. Try again.";
        captchaMsg.classList.remove("d-none");
        submitBtn.disabled = true;
      }
    });
  }

  if (captchaRefreshBtn) {
    captchaRefreshBtn.addEventListener("click", () => {
      generateCaptcha();
      captchaInput.value = "";
      captchaMsg.classList.add("d-none");
      submitBtn.disabled = true;
    });
  }

  // ====================== Popup Helper ======================
  function showPopup(message, title = "Notice") {
    const modalEl = document.getElementById("feedbackModal");
    if (!modalEl) return alert(message);
    modalEl.querySelector(".modal-title").innerText = title;
    modalEl.querySelector("#feedbackMessage").innerText = message;
    new bootstrap.Modal(modalEl).show();
    console.log(`${title}: ${message}`); // log to terminal (via server console)
  }

  // ====================== Registration Handler ======================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        email: document.getElementById("email").value,
        dob: document.getElementById("dob").value,
        password: document.getElementById("password").value,
      };
      try {
        const res = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        showPopup(result.message || "Registration successful!", "Registration");
      } catch {
        showPopup("Registration failed.", "Error");
      }
    });
  }

  // ====================== Login Handler ======================
  const loginForm = document.getElementById("login");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value,
      };
      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        showPopup(result.message || "Login successful!", "Login");
        if (result.success) {
          document.getElementById("logout").style.display = "block";
        }
      } catch {
        showPopup("Login failed.", "Error");
      }
    });
  }

  // ====================== Logout Handler ======================
  const logoutForm = document.getElementById("logout");
  if (logoutForm) {
    logoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/logout", { method: "POST" });
        const result = await res.json();
        showPopup(result.message || "Logged out.", "Logout");
        document.getElementById("logout").style.display = "none";
      } catch {
        showPopup("Logout failed.", "Error");
      }
    });
  }

  // ====================== Search Bar ======================
  const searchBox = document.getElementById("searchBox");
  const searchResults = document.getElementById("searchResults");
  if (searchBox && searchResults) {
    searchBox.addEventListener("keypress", async function (e) {
      if (e.key === "Enter") {
        const query = searchBox.value.trim();
        if (query === "") {
          searchResults.innerHTML = "";
          searchResults.classList.remove("show");
          return;
        }
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.products.length > 0) {
          searchResults.innerHTML = data.products.map(
            p => `<a href="${p.page}" class="dropdown-item">
                    <strong>${p.name}</strong><br>
                    <small>${p.description}</small><br>
                    <em>$${p.price}</em>
                  </a>`
          ).join("");
          searchResults.classList.add("show");
        } else {
          searchResults.innerHTML = "<span class='dropdown-item text-muted'>No results found.</span>";
          searchResults.classList.add("show");
        }
      }
    });
  }
});
