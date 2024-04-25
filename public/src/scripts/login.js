const title = document.querySelector(".title");
const subtitle = document.querySelector(".subtitle");
const passwordField = document.getElementById("password");
// const passwordConfirmField = document.getElementById("passwordConfirm");
const passView = document.getElementById("passView");
// const passConfirmView = document.getElementById("passConfirmView");
passView.addEventListener("click", (e) => {
  // console.log(e.target.checked);
  passwordField.type = e.target.checked ? "text" : "password";
});

const loginForm = document.querySelector(".login-form");
const forgotPassForm = document.querySelector(".forgot-pass-form");

const forgotPassButton = document.querySelector(".forgot-pass-btn");
const backToLoginButton = document.querySelector(".back-to-login-btn");

const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");
const infoAlert = document.querySelector(".alert-info");
const successAlertMsg = successAlert.lastElementChild;
const errorAlertMsg = errorAlert.lastElementChild;

console.log(errorAlert);
console.log(successAlert);

const urlUser = window.location.pathname.includes("students") ? "students" : "teachers";
console.log(urlUser);

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

const hideAllAlerts = () => {
  toggleVisibility(errorAlert, "hide");
  toggleVisibility(successAlert, "hide");
  toggleVisibility(infoAlert, "hide");
};
forgotPassButton.addEventListener("click", (e) => {
  hideAllAlerts();
  toggleVisibility(loginForm, "hide");
  toggleVisibility(forgotPassForm, "show");
  title.textContent = "Forgot Password";
  subtitle.textContent = "Enter your email to receive a link to reset password";
});

backToLoginButton.addEventListener("click", (e) => {
  hideAllAlerts();
  toggleVisibility(forgotPassForm, "hide");
  toggleVisibility(loginForm, "show");
  title.textContent = `${urlUser.at(0).toUpperCase() + urlUser.slice(1, -1)} Login`;
  subtitle.textContent = "Please enter your credentials";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // console.log("Form triggered", e.type, e.target, e.currentTarget, e.target === e.currentTarget);

  const formData = new FormData(loginForm);
  // formData.forEach((v, i)=> console.log(v, i))
  const fields = Object.fromEntries(formData);
  console.log(fields);
  try {
    showAlert("info");
    const response = await fetch(`/${urlUser}/login`, {
      method: "POST",
      body: JSON.stringify(fields),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    const results = await response.json();
    console.log(results);
    if (results.status === "fail" || results.status === "error") {
      // const errMsg = [...errorAlert.children].at(-1);
      // const errMsg = errorAlert.lastElementChild;
      // errMsg.textContent = results.message;
      // toggleVisibility(errorAlert, "show");
      setTimeout(() => {
        // Sometimes database access are fast, thus, the fetching alert flashes, so we delay the next alert by 1s.
        showAlert("error", results.message);
      }, 1000);
    } else {
      showAlert("success");
      setTimeout(() => {
        // console.log(results.redirectURL);
        results.redirectURL && location.assign(results.redirectURL);
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", "Failed due to Network Issues");
    // loginMsg.textContent = err.message;
    // console.log(loginMsg);
  }
});

forgotPassForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // const fields = [...forgotPassForm.querySelectorAll("input")].map((element) => [element.name, element.value]);
  const formData = new FormData(forgotPassForm);
  // for (const [name, val] of formData) console.log(name, val);
  const fields = Object.fromEntries(formData);
  console.log(fields);

  try {
    showAlert("info");
    const response = await fetch(`/${urlUser}/forgot-password`, {
      method: "POST",
      body: JSON.stringify(fields),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    console.log(response);
    const results = await response.json();
    if (results.status === "fail" || results.status === "error") {
      setTimeout(() => {
        showAlert("error", results.message);
      }, 1000); // Delay the error-alert to make the info-alert stay for a bit longer, avoid flashing.
    } else {
      showAlert("success", results.message + ". You may close this window!");
    }
  } catch (err) {
    console.log(err);
    showAlert("error", "Failed due to Network Issues");
  }
});
