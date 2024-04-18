const passwordField = document.getElementById("password");
// const passwordConfirmField = document.getElementById("passwordConfirm");
const passView = document.getElementById("passView");
// const passConfirmView = document.getElementById("passConfirmView");
passView.addEventListener("click", (e) => {
  // console.log(e.target.checked);
  passwordField.type = e.target.checked ? "text" : "password";
});

const form = document.querySelector(".login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  // formData.forEach((v, i)=> console.log(v, i))
  const dataObj = Object.fromEntries(formData);
  console.log(dataObj);
  try {
    const response = await fetch("/students/login", {
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
    // console.log(results.redirectURL);

    location.assign(results.redirectURL);
  } catch (err) {
    console.log(JSON.parse(err));
  }
});
