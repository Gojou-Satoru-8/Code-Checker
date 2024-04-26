// Forms:
const passwordForm = document.querySelector(".password-form");
const pfpForm = document.querySelector(".pfp-form");
// Buttons (outside forms):
const editPassBtn = document.querySelector(".edit-pass-btn");
const editPfpBtn = document.querySelector(".edit-pfp-btn");
const cancelBtn = document.querySelector(".cancel-btn");
// Selections for showing and hiding password:
const passwordCurrentField = document.getElementById("password-current");
const passwordNewField = document.getElementById("password-new");
const passwordConfirmField = document.getElementById("password-confirm");
const passViews = document.querySelectorAll(".passView");

// Alerts and associated message elements:
const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");
const infoAlert = document.querySelector(".alert-info");
const successAlertMsg = successAlert.lastElementChild;
const errorAlertMsg = errorAlert.lastElementChild;
const urlUser = window.location.pathname.includes("students") ? "students" : "teachers";
console.log(urlUser);

const toggleVisibility = (element, type) => {
  if (type === "show") {
    element.classList.remove("hidden");
    element.classList.add("flex");
  } else {
    element.classList.remove("flex");
    element.classList.add("hidden");
  }
};

const showAlert = (type, message) => {
  if (type === "success") {
    toggleVisibility(errorAlert, "hide");
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

const hideAllAlerts = () => {
  toggleVisibility(successAlert, "hide");
  toggleVisibility(errorAlert, "hide");
  toggleVisibility(infoAlert, "hide");
};

passViews.forEach((passView) => {
  passView.addEventListener("click", (e) => {
    const correspondingInput = e.target.previousElementSibling;
    correspondingInput.type = e.target.checked ? "text" : "password";
  });
});

editPassBtn.addEventListener("click", (e) => {
  hideAllAlerts();
  console.log("Edit password button clicked");
  // Hide PFP Form (if active) and show Password Form:
  toggleVisibility(pfpForm, "hide");
  toggleVisibility(passwordForm, "show");
  // Hide all buttons except cancel btn:
  toggleVisibility(editPassBtn, "hide");
  toggleVisibility(editPfpBtn, "hide");
  toggleVisibility(cancelBtn, "show");
  // editPassBtn.classList.toggle("hidden");  NOTE: Merely toggling "hidden" in all 3 buttons also works in all 3
  // editPfpBtn.classList.toggle("hidden"); // event listeners for the buttons, but above is more readable
  // cancelBtn.classList.toggle("hidden");
});

editPfpBtn.addEventListener("click", (e) => {
  hideAllAlerts();
  // Hide Password Form (if active) and show PFP form:
  toggleVisibility(passwordForm, "hide");
  toggleVisibility(pfpForm, "show");
  // Hide all buttons except cancel btn:
  toggleVisibility(editPfpBtn, "hide");
  toggleVisibility(editPassBtn, "hide");
  toggleVisibility(cancelBtn, "show");
});

cancelBtn.addEventListener("click", (e) => {
  // Hide both forms:
  toggleVisibility(passwordForm, "hide");
  toggleVisibility(pfpForm, "hide");
  // Hide cancel button, show the other two buttons:
  toggleVisibility(cancelBtn, "hide");
  toggleVisibility(editPassBtn, "show");
  toggleVisibility(editPfpBtn, "show");
});

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (passwordNewField.value !== passwordConfirmField.value) {
    showAlert("error", "Passwords don't match!");
    return;
  }

  if (passwordNewField.value.length < 8 || passwordConfirmField.value.length < 8) {
    showAlert("error", "Password must be of atleast 8 characters");
    return;
  }
  // const formData = new FormData(passwordForm);
  // formData.forEach((val, name) => console.log(name, val));

  try {
    const response = await fetch(`/${urlUser}/update-password`, {
      method: "PATCH",
      body: JSON.stringify({ passwordCurrent: passwordCurrentField.value, passwordNew: passwordNewField.value }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const results = await response.json();
    console.log(results);
    if (results.status === "success") {
      showAlert("success", results.message);
      // setTimeout(() => {
      location.assign(window.location.href);
      // }, 1000);
    } else {
      showAlert("error", results.message);
    }
  } catch (err) {
    console.log(err.message);
    showAlert("error", err.message);
  }
});

pfpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // const formData = new FormData(pfpForm);
  // Or:
  const pfpInput = document.getElementById("pfp");
  console.log(pfpInput, pfpInput.name, pfpInput.files[0], pfpInput.value);
  // Here, pfpInput is the HTML element, name is the name attribute, files is an array of File Objects (single
  // in this case), and do note that value, is some fake file path (C:\\fakepath\\ file.name)
  const formData = new FormData();
  formData.append(pfpInput.name, pfpInput.files[0]);
  try {
    const response = await fetch(`/${urlUser}/update-pfp`, {
      method: "PATCH",
      body: formData,
      credentials: "include",
    });
    const results = await response.json();
    if (results.status === "success") {
      showAlert("success", results.message);
      // setTimeout(() => {
      location.assign(window.location.href);
      // }, 1000);
    } else {
      showAlert("error", results.message);
    }
  } catch (err) {
    console.log(err.message);
    showAlert("error", err.message);
  }
});
