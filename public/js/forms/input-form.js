export const buildInputForm = async () => {
  const inputFormWrapper = document.createElement("div");
  inputFormWrapper.id = "input-form-wrapper";

  const inputTitleElement = document.createElement("h2");
  inputTitleElement.textContent = "Unfuck your resume below:";
  inputTitleElement.className = "form-title";

  const inputFormElement = document.createElement("div");
  inputFormElement.id = "input-form-element";
  inputFormElement.className = "form-element";

  const selectAIListItem = await buildSelectAIListItem();
  const uploadListItem = await buildUploadListItem();
  const pasteJobListItem = await buildPasteJobListItem();
  const submitListItem = await buildSubmitListItem();

  inputFormElement.append(selectAIListItem, uploadListItem, pasteJobListItem, submitListItem);

  inputFormWrapper.append(inputTitleElement, inputFormElement);

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

export const buildPasteJobListItem = async () => {
  const pasteJobListItem = document.createElement("li");
  pasteJobListItem.id = "paste-job-list-item";
  pasteJobListItem.className = "form-list-item";

  //   const pasteJobLabel = document.createElement("label");
  //   pasteJobLabel.setAttribute("for", "paste-job");
  //   pasteJobLabel.className = "form-label";
  //   pasteJobLabel.textContent = "Paste the ENTIRE job description here:";

  const pasteJobInput = document.createElement("textarea");
  pasteJobInput.rows = 12;
  pasteJobInput.name = "paste-job-input";
  pasteJobInput.id = "paste-job-input";
  pasteJobInput.className = "form-textarea";
  pasteJobInput.placeholder = "[Paste the ENTIRE job description here]";

  //   pasteJobListItem.append(pasteJobLabel, pasteJobInput);
  pasteJobListItem.append(pasteJobInput);

  return pasteJobListItem;
};

export const buildUploadListItem = async () => {
  const uploadListItem = document.createElement("li");
  uploadListItem.id = "upload-list-item";
  uploadListItem.className = "form-list-item";

  const uploadButton = document.createElement("button");
  uploadButton.type = "button";
  uploadButton.className = "btn-upload";
  uploadButton.id = "upload-button";
  uploadButton.textContent = "Upload your DEFAULT resume";
  uploadButton.setAttribute("data-label", "upload-button");

  uploadListItem.append(uploadButton);

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
