const passwordField = document.getElementById("password");
// const passwordConfirmField = document.getElementById("passwordConfirm");
const passView = document.getElementById("passView");
// const passConfirmView = document.getElementById("passConfirmView");
passView.addEventListener("click", (e) => {
  // console.log(e.target.checked);
  passwordField.type = e.target.checked ? "text" : "password";
});

const form = document.querySelector(".login-form");
const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");
console.log(errorAlert);
console.log(successAlert);

const urlUser = window.location.pathname.includes("students") ? "students" : "teachers";
console.log(urlUser);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  // formData.forEach((v, i)=> console.log(v, i))
  const dataObj = Object.fromEntries(formData);
  console.log(dataObj);
  try {
    const response = await fetch(`/${urlUser}/login`, {
      method: "POST",
      body: JSON.stringify(dataObj),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    const results = await response.json();
    console.log(results);
    if (results.status === "fail" || results.status === "error") {
      const errMsg = [...errorAlert.children].at(-1);
      errMsg.textContent = results.message;
      errorAlert.classList.remove("hidden");
      errorAlert.classList.add("flex");
    } else {
      successAlert.classList.remove("hidden");
      successAlert.classList.add("flex");
      errorAlert.classList.add("hidden");
      setTimeout(() => {
        // console.log(results.redirectURL);
        results.redirectURL && location.assign(results.redirectURL);
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    // loginMsg.textContent = err.message;
    // console.log(loginMsg);
  }
});
