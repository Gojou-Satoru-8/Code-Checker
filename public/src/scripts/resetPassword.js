const form = document.querySelector(".form");
const passwordField = document.getElementById("password");
const passwordConfirmField = document.getElementById("passwordConfirm");
const passView = document.getElementById("passView");
const passConfirmView = document.getElementById("passConfirmView");

const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");
const infoAlert = document.querySelector(".alert-info");
const successAlertMsg = successAlert.lastElementChild;
const errorAlertMsg = errorAlert.lastElementChild;

passView.addEventListener("click", (e) => {
  // console.log(e.target.checked);
  passwordField.type = e.target.checked ? "text" : "password";
});
passConfirmView.addEventListener("click", (e) => {
  // console.log(e.target.checked);
  passwordConfirmField.type = e.target.checked ? "text" : "password";
});

// const urlUser = window.location.pathname.includes("students") ? "students" : "teachers";
const toggleVisibility = (element, type) => {
  // NOTE: Specifically for flex elements where merely toggling "hidden" isn't possible, as "flex"
  // is also applied to the same (display) property.
  if (type === "show") {
    element.classList.remove("hidden");
    element.classList.add("flex");
  } else if (type === "hide") {
    element.classList.remove("flex");
    element.classList.add("hidden");
  }
};

const showAlert = (type, message) => {
  // Alerts are supposed to be exclusively shown, hence toggleVisibility function is not enough, gotta remove
  // other alerts from view too.
  if (type === "success") {
    toggleVisibility(errorAlert, "hide"); // Gotta hide all error and info alerts that may still be in view.
    toggleVisibility(infoAlert, "hide");
    if (message) successAlertMsg.textContent = message;
    toggleVisibility(successAlert, "show");
  } else if (type === "error") {
    toggleVisibility(successAlert, "hide");
    toggleVisibility(infoAlert, "hide");
    if (message) errorAlertMsg.textContent = message;
    toggleVisibility(errorAlert, "show");
  } else {
    toggleVisibility(successAlert, "hide");
    toggleVisibility(errorAlert, "hide");
    toggleVisibility(infoAlert, "show");
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const fields = Object.fromEntries(formData);
  console.log(fields);
  if (fields.password != fields.passwordConfirm) {
    showAlert("error", "Passwords don't match");
    return;
  }
  try {
    showAlert("info");
    const response = await fetch(window.location.href, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    console.log(response);
    const results = await response.json();
    console.log(results);
    if (results.status === "fail" || results.status === "error") {
      setTimeout(() => {
        // NOTE: If DB access is fast, then the info-alert would flash, thus we delay the error-alert by 1s.
        showAlert("error", results.message);
      }, 1000);
    } else {
      showAlert("success", results.message);
      setTimeout(() => {
        results.redirectURL && location.assign(results.redirectURL);
      }, 1000);
    }
  } catch (err) {
    // console.log(err.message);
    showAlert("error", err.message);
  }
});
