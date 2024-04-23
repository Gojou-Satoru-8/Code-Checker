const notifyAndDisappear = (alertElement, message) => {
  const alertMsgElement = [...alertElement.children].at(-1);
  alertMsgElement.textContent = message;
  alertElement.classList.remove("hidden");
  setTimeout(() => {
    alertElement.classList.add("hidden");
  }, 10000);
};

const form = document.querySelector("form");

// BUTTONS:
const submitBtn = document.querySelector(".submit-btn");
const viewDeleteBtnsDivs = [...document.querySelectorAll(".view-delete-btns")];

// ALERTS:
const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");

// Text from HTML:
const courseCode = document.querySelector(".course-code").textContent.trim();
const assignmentID = document.querySelector(".assign-id").textContent.trim();

const acceptedFileExtensions = ["py", "c", "cpp", "js"];

const addDeletionBehaviour = function () {
  viewDeleteBtnsDivs.forEach((div) => {
    const deleteBtn = div.lastElementChild;
    deleteBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      // NOTE: HTML attributes are always converted to lower case.
      const { studentid, questionid } = e.target.dataset;
      const response = await fetch(`/students/${studentid}/submissions/${questionid}`, {
        method: "DELETE",
        credentials: "include",
      });
      console.log(response);
      //   const results = await response.json();   // causes error since status code 204 sends no content
      //   console.log(results);
      if (response.status === 204) {
        notifyAndDisappear(successAlert, "Deleted Successfully");
        div.classList.add("hidden");
      }
    });
  });
};

addDeletionBehaviour();

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // As the button is inside a form, default behaviour will reload the page
  const files = [];
  const errors = [];

  const inputFormData = new FormData(form);
  //   for (const [name, val] of inputFormData) console.log(name, val);
  // Here, name is the question.id and val is the file selected for upload
  for (const [questionID, file] of inputFormData) {
    // console.log(questionID, file);
    if (file.name && file.size) {
      // NOTE: If no file is selected for upload, they don't have a name and have size 0.

      const fileExt = file.name.split(".").at(-1);
      if (acceptedFileExtensions.includes(fileExt))
        files.push([file.name, new File([file], `${questionID}.${fileExt}`, { type: file.type })]);
      else errors.push(file.name);

      // file.name = questionID;  // NOTE: This doesn't modify file name as File objects are immutable
      // Thus, gotta make a new file with desired name, with the contents of the old one.
    }
  }

  console.log(files);
  console.log(errors);
  // NOTE: files: array of [old_filename, new File object with name = questionID + accepted extension]
  // NOTE: errors: array of those files (old file names) which had invalid extensions

  if (errors.length != 0) {
    notifyAndDisappear(
      errorAlert,
      `Problems with these files: ${errors.join(", ")}. Accepted file types: .py, .js, .cpp, .c`,
    );
  }

  if (files.length != 0) {
    const uploadFormData = new FormData();
    for (const [, file] of files) uploadFormData.append("codeFiles", file);

    for (const [name, file] of uploadFormData) console.log(name, file);

    try {
      const response = await fetch(`/students/courses/${courseCode}/assignments/${assignmentID}`, {
        method: "POST",
        //   headers: { "Content-Type": "multipart/form-data" },
        body: uploadFormData,
      });
      console.log(response);

      const results = await response.json();
      console.log(results);

      if (results.status === "success") {
        notifyAndDisappear(
          successAlert,
          `Successfully uploaded file: ${files.map(([oldFileName]) => oldFileName).join(",")}.`,
        );
        console.log(results.questionIds);

        results.questionIds.forEach((questionId) => {
          const [inputField] = document.getElementsByName(questionId);
          //   console.log("Inputfield", inputField);
          //   console.log("--------------------------");

          // Input fields which have the name set to the questionIds returned by the response from uploading files.
          const div = inputField.nextElementSibling;
          //   console.log("Div to show", div);
          //   console.log("--------------------------");

          div.classList.remove("hidden");
          const [viewBtn, deleteBtn] = [...div.children];
          viewBtn.firstElementChild.setAttribute("href", `/students/${results.studentId}/submissions/${questionId}`);
          deleteBtn.dataset.studentId = results.studentId;
          deleteBtn.dataset.questionId = questionId;
          //   console.log(viewBtn, deleteBtn);
          //   console.log("--------------------------");
        });
      } else {
        notifyAndDisappear(errorAlert, results.message);
      }
    } catch (err) {
      notifyAndDisappear(errorAlert, err.message);
    }
  } else {
    // If no files had the right extension, none were pushed to files array, and thus no upload.
    notifyAndDisappear(errorAlert, "No files (with valid extensions) to upload");
  }
});
