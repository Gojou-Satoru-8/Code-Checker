const notifyAndDisappear = (alertElement, message) => {
  const alertMsgElement = [...alertElement.children].at(-1);
  alertMsgElement.textContent = message;
  alertElement.classList.remove("hidden");
  setTimeout(() => {
    alertElement.classList.add("hidden");
  }, 10000);
};

const form = document.querySelector("form");
// const inputFields = [...document.querySelectorAll(".codeFiles")];
const submitBtn = document.querySelector(".submit-btn");
const successAlert = document.querySelector(".alert-success");
const errorAlert = document.querySelector(".alert-error");

const courseCode = document.querySelector(".course-code").textContent.trim();
const assignmentID = document.querySelector(".assign-id").textContent.trim();
const acceptedFileExtensions = ["py", "c", "cpp", "js"];

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // As the button is inside a form, default behaviour will reload the page
  //   console.log(inputFields);
  const files = [];
  const errors = [];
  //   inputFields.forEach((el) => {
  //     // console.log(el.name, el.value, el.files);
  //     console.log([...el.files][0]); // el.files is an array of all files selected for upload.
  //     const [file] = [...el.files];
  //     file.name = el.name; // This doesn't modify file name
  //     files.push(new File([file], el.name)); // Thus, gotta make a new file with a new name.
  //   });

  const inputFormData = new FormData(form);
  //   console.log(inputFormData);
  //   for (const [name, val] of formData) console.log(name, val);
  // Here, name is the question.id and val is the file selected for upload
  for (const [questionID, file] of inputFormData) {
    // console.log(questionID);
    // console.log(file);
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
