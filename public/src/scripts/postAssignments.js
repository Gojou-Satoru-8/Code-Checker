const courseCodeEl = document.querySelector(".course-code");
const modalEl = document.getElementById("my_modal_3");
const modalElDiv = modalEl.querySelector(".modal-box"); // For setting background (bg-error/bg-success)
const modalMsgEl = document.querySelector(".msg-modal");
const assignmentNameField = document.querySelector(".assign-name");
const submitBtn = document.querySelector(".submit-btn");
const numberField = document.querySelector(".num-questions");
const form = document.querySelector(".form");
const html = `<div class="card bg-base-100 shadow-xl">
<div class="card-body flex flex-row justify-center">
  <label for="question-#" class="card-title grow basis-2/5">Question #</h2>
  <textarea id="question-#" name="question-#" class="textarea textarea-primary grow basis-3/5" placeholder="Question Text"></textarea>
</div>
</div>`;

numberField.addEventListener("change", (e) => {
  //   console.log(e.target.value);
  const numQuestions = e.target.value;
  const questionFields = [...form.children];
  //   const questionFieldHTML = questionFields.at(0);
  //   console.log(questionFieldHTML);

  if (numQuestions > 0) {
    questionFields.forEach((element) => element.remove());
    for (let i = 1; i <= numQuestions; i++) form.insertAdjacentHTML("beforeend", html.replaceAll("#", `${i}`));
  }
});

submitBtn.addEventListener("click", async (e) => {
  // e.preventDefault();  // NOTE: Not required since it isn't within a form.

  const courseCode = courseCodeEl.textContent.trim();
  const assignmentName = assignmentNameField.value;
  const questionTextAreas = [...document.querySelectorAll(".textarea")];
  // console.log(questionTextAreas);
  // questionTextAreas.forEach((el) => console.log(el.id, el.value));
  const questions = questionTextAreas.map((element) => element.value.trim()).filter((text) => text !== "");
  console.log(questions);
  // Validate before http request:
  if (!assignmentName) {
    // alert("Please fill in the Assignment Name");
    modalMsgEl.textContent = "Please fill in the Assignment Name";
    modalEl.showModal();
  } else if (questions.length === 0) {
    // alert("Please enter at least one question");
    modalMsgEl.textContent = "Please enter at least one question";
    modalEl.showModal();
  }
  // Make http request:
  else {
    try {
      const response = await fetch(`/teachers/courses/${courseCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode, assignmentName, questions }),
      });
      console.log(response);
      const results = await response.json();
      console.log(results);
      modalMsgEl.textContent = results.message;
      modalEl.showModal();
      if (results.status === "success") {
        modalElDiv.classList.remove("bg-error");
        modalElDiv.classList.add("bg-info");
        setTimeout(() => {
          results.redirectUrl && location.assign(results.redirectUrl);
        }, 1000);
      }
      // setTimeout()
    } catch (err) {
      console.log(err);
    }
  }
});
