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
  const buttonListItem = await buildButtonListItem();

  inputFormElement.append(selectAIListItem, uploadListItem, buttonListItem);

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

export const buildUploadListItem = async () => {
  const uploadListItem = document.createElement("li");
  uploadListItem.id = "upload-list-item";
  uploadListItem.className = "form-list-item";

  const uploadLabel = document.createElement("label");
  uploadLabel.setAttribute("for", "upload-select");
  uploadLabel.textContent = "Upload your DEFAULT resume";
  uploadLabel.className = "form-label";

  const uploadButton = document.createElement("button");
  uploadButton.type = "button";
  uploadButton.className = "upload-button";
  uploadButton.textContent = "Upload File";
  uploadListItem.appendChild(uploadButton);

  return uploadListItem;
};

export const buildButtonListItem = async () => {
  const buttonListItem = document.createElement("li");
  buttonListItem.id = "button-list-item";

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "button-wrapper";

  const submitButton = document.createElement("button");
  submitButton.id = "form-submit-button";
  submitButton.className = "btn-submit";
  submitButton.textContent = "SUBMIT";
  submitButton.setAttribute("data-label", "submit-button");

  buttonWrapper.append(submitButton);

  buttonListItem.append(buttonWrapper);

  return buttonListItem;
};
