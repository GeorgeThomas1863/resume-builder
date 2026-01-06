import { buildCollapseContainer } from "./collapse.js";

export const buildInputForm = async () => {
  const inputFormWrapper = document.createElement("div");
  inputFormWrapper.id = "input-form-wrapper";

  const inputTitleElement = document.createElement("h2");
  inputTitleElement.textContent = `Tool to auto unfuck your resume ("align it with a job description")`;
  inputTitleElement.className = "form-title";

  const inputFormElement = document.createElement("div");
  inputFormElement.id = "input-form-element";
  inputFormElement.className = "form-element";

  const selectAIListItem = await buildSelectAIListItem();
  const selectFormatListItem = await buildSelectFormatListItem();
  const uploadListItem = await buildUploadListItem();
  const pasteJobListItem = await buildPasteJobListItem();
  const submitListItem = await buildSubmitListItem();

  inputFormElement.append(selectAIListItem, selectFormatListItem, uploadListItem, pasteJobListItem, submitListItem);

  // Build collapse container
  const collapseContainer = await buildCollapseContainer({
    titleElement: inputTitleElement,
    contentElement: inputFormElement,
    isExpanded: true,
    className: "",
    dataAttribute: "",
  });

  inputFormWrapper.append(collapseContainer);

  return inputFormWrapper;
};

export const buildSelectAIListItem = async () => {
  const selectAIListItem = document.createElement("li");
  selectAIListItem.id = "select-ai-list-item";
  selectAIListItem.className = "form-list-item";

  const selectAILabel = document.createElement("label");
  selectAILabel.setAttribute("for", "ai-type-select");
  selectAILabel.textContent = "Select AI";
  selectAILabel.className = "form-label";

  const aiSelectType = document.createElement("select");
  aiSelectType.id = "ai-type-select";
  aiSelectType.className = "form-select";
  aiSelectType.setAttribute("data-label", "ai-type-select");

  const optionArray = [
    { value: "local", text: "Local LLM", selected: true },
    { value: "chatgpt", text: "ChatGPT" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    aiSelectType.append(option);
  }

  selectAIListItem.append(selectAILabel, aiSelectType);

  return selectAIListItem;
};

export const buildSelectFormatListItem = async () => {
  const selectFormatListItem = document.createElement("li");
  selectFormatListItem.id = "select-format-list-item";
  selectFormatListItem.className = "form-list-item";

  const selectFormatLabel = document.createElement("label");
  selectFormatLabel.setAttribute("for", "format-select");
  selectFormatLabel.textContent = "Select Format";
  selectFormatLabel.className = "form-label";

  const formatTypeSelect = document.createElement("select");
  formatTypeSelect.id = "format-type-select";
  formatTypeSelect.className = "form-select";
  formatTypeSelect.setAttribute("data-label", "format-type-select");

  const optionArray = [
    { value: "custom", text: "Custom", selected: true },
    { value: "none", text: "None [default]" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    formatTypeSelect.append(option);
  }

  selectFormatListItem.append(selectFormatLabel, formatTypeSelect);

  return selectFormatListItem;
};

export const buildPasteJobListItem = async () => {
  const pasteJobListItem = document.createElement("li");
  pasteJobListItem.id = "paste-job-list-item";
  pasteJobListItem.className = "form-list-item";

  const pasteJobInput = document.createElement("textarea");
  // pasteJobInput.rows = 15;
  pasteJobInput.rows = 7;
  pasteJobInput.name = "paste-job-input";
  pasteJobInput.id = "paste-job-input";
  pasteJobInput.className = "form-textarea";
  pasteJobInput.placeholder = "[Paste the ENTIRE job description here]";

  pasteJobListItem.append(pasteJobInput);

  return pasteJobListItem;
};

export const buildUploadListItem = async () => {
  const uploadListItem = document.createElement("li");
  uploadListItem.id = "upload-list-item";
  uploadListItem.className = "form-list-item";

  // Create hidden file input for file upload
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "upload-file-input";
  fileInput.accept = ".pdf,.doc,.docx";
  fileInput.style.display = "none";

  const uploadButton = document.createElement("button");
  uploadButton.type = "button";
  uploadButton.className = "btn-upload";
  uploadButton.id = "upload-button";
  uploadButton.textContent = "Upload your GARBAGE resume";
  uploadButton.setAttribute("data-label", "upload-button");

  const uploadRowWrapper = document.createElement("div");
  uploadRowWrapper.className = "upload-row-wrapper";

  const uploadStatus = document.createElement("span");
  uploadStatus.id = "upload-status";
  uploadStatus.className = "upload-status";
  uploadStatus.style.marginLeft = "10px";
  uploadStatus.style.display = "none";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn-delete";
  deleteButton.id = "delete-resume-button";
  deleteButton.textContent = "Delete Resume";
  deleteButton.setAttribute("data-label", "delete-resume-button");
  deleteButton.style.display = "none";

  uploadRowWrapper.append(uploadStatus, deleteButton);

  uploadListItem.append(fileInput, uploadButton, uploadRowWrapper);

  return uploadListItem;
};

export const buildSubmitListItem = async () => {
  const submitListItem = document.createElement("li");
  submitListItem.id = "submit-list-item";
  submitListItem.className = "form-list-item";

  const submitButton = document.createElement("button");
  submitButton.id = "form-submit-button";
  submitButton.className = "btn-submit";
  submitButton.textContent = "SUBMIT";
  submitButton.setAttribute("data-label", "submit-button");

  submitListItem.append(submitButton);

  return submitListItem;
};
