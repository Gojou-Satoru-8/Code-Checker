// NAVIGATION BUTTONS:
const navigatorDiv = document.querySelector(".navigator");
const [navigatorFirst, navigatorBtns, navigatorLast] = navigatorDiv.children;
const [navigatorLeft, currentTab, navigatorRight] = navigatorBtns.children;

// CAROUSEL ELEMENTS:
// NOTE: As number of questions varies, better to select first and last carousel through children of container.
const carousel = document.querySelector(".carousel");
const carouselFirst = carousel.firstElementChild;
const carouselLast = carousel.lastElementChild;
let carouselActive = document.querySelector(".carousel-active");
console.log(carouselActive);

// STUDENTS SIDEBAR:
const studentsSelect = document.querySelectorAll(".student-select");
let studentActive; // NOTE: Unlike carouselActive, the state is purely in JS, it doesn't have any
// associated css classes added, just the bg-color, and that too only applied after first click, not on load.

// MAIN CONTENT:    // NOTE: These will be in every carousel (ie per question)
// const codeViews = document.querySelectorAll(".code-view");
// const resultsViews = document.querySelector(".results-view");
// const remarksViews = document.querySelectorAll(".remarks-view");
const sendbtns = document.querySelectorAll(".send-btn");
const runbtns = document.querySelectorAll(".run-btn");

// MODAL:
const modalEl = document.getElementById("my_modal_3");
const modalElDiv = modalEl.querySelector(".modal-box"); // For setting background (bg-error/bg-success)
const modalMsgEl = document.querySelector(".msg-modal");

console.log(studentsSelect);
console.log(navigatorDiv);
console.log("------------------------------------");
// console.log(codeViews, resultsViews, remarksViews);

// console.log(navigatorLeft, navigatorRight, currentTab);

const setCarouselActive = (newCarouselActive) => {
  carouselActive.classList.remove("carousel-active");
  newCarouselActive.classList.add("carousel-active");
  newCarouselActive.scrollIntoView();
  carouselActive = newCarouselActive;
};

const setStudentActive = (newStudentActive) => {
  // (1) Apply highlight to new active element:
  newStudentActive.parentElement.classList.add("bg-cyan-950");
  // (2) Remove highlights from the rest (earlier method before this function was created):
  //   const restStudentsSelect = [...studentsSelect].filter((element) => element != newStudentActive);
  //   console.log("rest of studentsSelect", restStudentsSelect);
  //   restStudentsSelect.forEach((element) => element.parentElement.classList.remove("bg-cyan-950"));
  studentActive?.parentElement.classList.remove("bg-cyan-950"); // (2) Remove highlight from current one.
  //   NOTE: On document load, there is no studentActive. Hence the optional chaining
  studentActive = newStudentActive;
  // (3) Set new student-active, so event-listeners can use the data attribute for their fetch() calls
};

const showModal = (message, type = "error") => {
  //   console.log("modal type: ", type);
  modalMsgEl.textContent = message;
  if (type === "success") {
    modalElDiv.classList.remove("bg-error");
    modalElDiv.classList.add("bg-info");
  }
  modalEl.showModal();
};

navigatorLeft.addEventListener("click", (e) => {
  //   console.log(carouselActive);
  if (carouselActive === carouselFirst) {
    console.log("first carousel element active");
    return;
  }
  setCarouselActive(carouselActive.previousElementSibling);
});

navigatorRight.addEventListener("click", (e) => {
  //   console.log(carouselActive);
  if (carouselActive === carouselLast) {
    console.log("first carousel element active");
    return;
  }
  carouselActive.classList.remove("carousel-active");
  setCarouselActive(carouselActive.nextElementSibling);
});

navigatorFirst.addEventListener("click", (e) => carouselFirst.scrollIntoView());
navigatorLast.addEventListener("click", (e) => carouselLast.scrollIntoView());

studentsSelect.forEach((studentSelectEl) => {
  studentSelectEl.addEventListener("click", async (e) => {
    // (1) Set as active student:
    setStudentActive(studentSelectEl);
    // NOTE: This helps other event-listeners to get the submission id from the data-attribute of studentActive

    // (2) Get submission Id from the data attribute and make API call:
    const submissionId = studentSelectEl.dataset.submissionid;
    console.log(submissionId);
    try {
      const response = await fetch(`/students/submissions/${submissionId}?fileContents=true`, {
        credentials: "include",
      });
      console.log(response);
      const results = await response.json();
      //   console.log(results);
      if (results.status === "success") {
        // Target the code view in the active carousel only.
        const codeView = carouselActive.querySelector(".code-view");
        codeView.textContent = results.data.submission?.fileContents || "No content in file";
      }
    } catch (err) {
      showModal(err);
    }
  });
});

runbtns.forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    // (1) Check if a student was selected or button was pressed nonchalantly.
    if (!studentActive) {
      showModal("Please select a student's code to run");
      return; // NOTE: This occurs at the start when studentActive is set as the first student-select element
      // in our JS script on document load, but it hasn't explicitly selected by the user, and thus no bg color.
    }
    // (2) Get submission Id from the data attribute and make API call:
    const { submissionid } = studentActive.dataset;
    console.log(submissionid);
    try {
      const response = await fetch(`/api/v1/codes/${submissionid}`);
      console.log(response);
      const results = await response.json();
      console.log(results);
      if (results.status === "success") {
        // Target the results view in the active carousel only.
        const resultsView = carouselActive.querySelector(".results-view");
        resultsView.textContent = results.stderr || results.stdout;
      }
    } catch (err) {
      showModal(err.message);
    }
  });
});

sendbtns.forEach((button) => {
  button.addEventListener("click", async (e) => {
    e.preventDefault();
    // (1) Check if a student was selected or button was pressed nonchalantly.
    if (!studentActive) {
      showModal("Please select a student's code first to send review of");
      return; // NOTE: This occurs at the start when studentActive is set as the first student-select element
      // in our JS script on document load, but it hasn't explicitly selected by the user, and thus no bg color.
    }

    // (2) Get submission Id from the data attribute for API call:
    const { submissionid } = studentActive.dataset;
    console.log(submissionid);

    // (3) Target the remarks view in the active carousel only, to get the remarks text for API call:
    const remarksView = carouselActive.querySelector(".remarks-view");
    console.log(remarksView.value.trim());

    if (remarksView.value.trim() === "") {
      showModal("No remarks written");
      return;
    }

    // (4) Make API call with the submissionId and remarks text:

    try {
      const response = await fetch(`/students/submissions/${submissionid}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ remarks: remarksView.value.trim() }),
        headers: { "Content-Type": "application/json" },
      });
      console.log(response);
      const results = await response.json();
      console.log(results);
      if (results.status === "success") {
        remarksView.value = "";
        showModal("Review Sent", "success");
      }
    } catch (err) {
      showModal(err.message);
    }
  });
});
