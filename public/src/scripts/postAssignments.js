const assignmentName = document.querySelector(".assign-name");
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

submitBtn.addEventListener("click", (e) => {
  // Make http request:
});
