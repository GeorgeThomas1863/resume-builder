import { buildCollapseContainer } from "./collapse.js";
import { EXPAND_OPTIONS_SVG } from "../util/define-things.js";

export const buildInputForm = async () => {
  const inputFormWrapper = document.createElement("div");
  inputFormWrapper.id = "input-form-wrapper";

  const inputTitleElement = document.createElement("h2");
  inputTitleElement.textContent = `Tool to auto unfuck your resume ("align it with a job description")`;
  inputTitleElement.className = "form-title";

  const inputFormElement = document.createElement("div");
  inputFormElement.id = "input-form-element";
  inputFormElement.className = "form-element";

  const selectRowListItem = await buildSelectRowListItem();
  const inputTypeListItem = await buildInputTypeListItem();

  const uploadListItem = await buildUploadListItem();
  const pasteJobListItem = await buildPasteJobListItem();
  const submitListItem = await buildSubmitListItem();

  inputFormElement.append(selectRowListItem, inputTypeListItem, uploadListItem, pasteJobListItem, submitListItem);

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

export const buildSelectRowListItem = async () => {
  const selectRowContainer = document.createElement("li");
  selectRowContainer.id = "select-row-container";
  selectRowContainer.className = "form-list-item form-row";

  const selectAIListItem = await buildSelectAIListItem();
  const selectModelListItem = await buildSelectModelListItem();
  const modelOptionsListItem = await buildModelOptionsListItem();

  selectRowContainer.append(selectAIListItem, selectModelListItem, modelOptionsListItem);

  return selectRowContainer;
};

export const buildSelectAIListItem = async () => {
  const selectAIListItem = document.createElement("li");
  selectAIListItem.id = "select-ai-list-item";
  selectAIListItem.className = "form-select-half";

  const selectAILabel = document.createElement("label");
  selectAILabel.setAttribute("for", "ai-type-select");
  selectAILabel.textContent = "Select AI";
  selectAILabel.className = "form-label";

  const aiSelectType = document.createElement("select");
  aiSelectType.id = "ai-type-select";
  aiSelectType.className = "form-select";
  aiSelectType.setAttribute("data-label", "ai-type-select");

  const optionArray = [
    { value: "chatgpt", text: "ChatGPT", selected: true },
    { value: "local", text: "Local LLM" },
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

export const buildSelectModelListItem = async () => {
  const selectModelListItem = document.createElement("div");
  selectModelListItem.id = "select-model-list-item";
  selectModelListItem.className = "form-select-half";

  const selectModelLabel = document.createElement("label");
  selectModelLabel.setAttribute("for", "model-select");
  selectModelLabel.textContent = "Select Model";
  selectModelLabel.className = "form-label";

  const modelSelect = document.createElement("select");
  modelSelect.id = "model-select";
  modelSelect.className = "form-select";
  modelSelect.setAttribute("data-label", "model-select");

  const optionArray = [
    { value: "gpt-5-nano", text: "GPT 5 Nano", selected: true },
    { value: "gpt-5-mini", text: "GPT 5 Mini" },
    { value: "gpt-5", text: "GPT 5" },
    { value: "gpt-5.2", text: "GPT 5.2" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    modelSelect.append(option);
  }

  selectModelListItem.append(selectModelLabel, modelSelect);

  return selectModelListItem;
};

export const buildModelOptionsListItem = async () => {
  const modelOptionsListItem = document.createElement("li");
  modelOptionsListItem.id = "model-options-list-item";
  modelOptionsListItem.className = "form-select-half";

  const modelOptionsLabel = document.createElement("label");
  modelOptionsLabel.setAttribute("for", "model-options-select");
  modelOptionsLabel.textContent = "Model Options";
  modelOptionsLabel.className = "form-label";

  const toggleWrapper = document.createElement("div");
  toggleWrapper.className = "toggle-wrapper";
  toggleWrapper.setAttribute("data-label", "modelOptionsToggle");

  const toggleButton = document.createElement("button");
  toggleButton.id = "model-options-toggle";
  toggleButton.className = "model-options-toggle-btn";
  toggleButton.setAttribute("data-label", "modelOptionsToggle");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-label", "Toggle model options");
  toggleButton.innerHTML = EXPAND_OPTIONS_SVG;

  toggleWrapper.append(toggleButton);

  modelOptionsListItem.append(modelOptionsLabel, toggleWrapper);

  return modelOptionsListItem;
};

//----

export const buildModelOptionsContentWrapper = async () => {
  const modelOptionsContentWrapper = document.createElement("div");
  modelOptionsContentWrapper.id = "model-options-content-wrapper";
  modelOptionsContentWrapper.className = "form-list-item form-row";
  modelOptionsContentWrapper.classList.add("hidden");

  const priorityDiv = await buildPriorityDiv();
  const maxTokensDiv = await buildMaxTokensDiv();
  const temperatureDiv = await buildTemperatureDiv();
  modelOptionsContentWrapper.append(priorityDiv, maxTokensDiv, temperatureDiv);
  return modelOptionsContentWrapper;
};

//for service_tier
export const buildPriorityDiv = async () => {
  const priorityDiv = document.createElement("div");
  priorityDiv.id = "priority-div";
  priorityDiv.className = "form-select-half";

  const priorityLabel = document.createElement("label");
  priorityLabel.setAttribute("for", "priority-select");
  priorityLabel.textContent = "Priority";
  priorityLabel.className = "form-label";

  const prioritySelect = document.createElement("select");
  prioritySelect.id = "priority-select";
  prioritySelect.className = "form-select";
  prioritySelect.setAttribute("data-label", "priority-select");

  const optionArray = [
    { value: "flex", text: "Flex (slowest/cheapest)", selected: true },
    { value: "standard", text: "Standard" },
    { value: "priority", text: "Priority (fastest/most expensive)" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    prioritySelect.append(option);
  }

  priorityDiv.append(priorityLabel, prioritySelect);

  return priorityDiv;
};

export const buildMaxTokensDiv = async () => {
  const maxTokensDiv = document.createElement("div");
  maxTokensDiv.id = "max-tokens-div";
  maxTokensDiv.className = "form-select-half";

  const maxTokensLabel = document.createElement("label");
  maxTokensLabel.setAttribute("for", "max-tokens-input");
  maxTokensLabel.className = "form-label";
  maxTokensLabel.textContent = "Max Tokens";

  const maxTokensInput = document.createElement("input");
  maxTokensInput.type = "number";
  maxTokensInput.id = "max-tokens-input";
  maxTokensInput.className = "form-input";
  maxTokensInput.min = "1";
  maxTokensInput.max = "1000000";
  maxTokensInput.step = "1";
  maxTokensInput.value = "50000";
  maxTokensInput.placeholder = "50000";

  maxTokensDiv.append(maxTokensLabel, maxTokensInput);

  return maxTokensDiv;
};

export const buildTemperatureDiv = async () => {
  // Temperature option
  const temperatureDiv = document.createElement("div");
  temperatureDiv.id = "temperature-div";
  temperatureDiv.className = "form-select-half";

  const temperatureLabel = document.createElement("label");
  temperatureLabel.setAttribute("for", "temperature-input");
  temperatureLabel.className = "form-label";
  temperatureLabel.textContent = "Temperature";

  const temperatureInput = document.createElement("input");
  temperatureInput.type = "number";
  temperatureInput.id = "temperature-input";
  temperatureInput.className = "form-input";
  temperatureInput.min = "0";
  temperatureInput.max = "2";
  temperatureInput.step = "0.1";
  temperatureInput.value = "1";
  temperatureInput.placeholder = "1";

  temperatureDiv.append(temperatureLabel, temperatureInput);
  return temperatureDiv;
};

//----------------

export const buildInputTypeListItem = async () => {
  const inputTypeListItem = document.createElement("li");
  inputTypeListItem.id = "input-type-list-item";
  inputTypeListItem.className = "form-list-item";

  const inputTypeLabel = document.createElement("label");
  inputTypeLabel.setAttribute("for", "input-type-select");
  inputTypeLabel.textContent = "Select Input Type";
  inputTypeLabel.className = "form-label";

  const inputTypeSelect = document.createElement("select");
  inputTypeSelect.id = "input-type-select";
  inputTypeSelect.className = "form-select";
  inputTypeSelect.setAttribute("data-label", "input-type-select");

  const optionArray = [
    { value: "prebuilt", text: "Use Pre-Built", selected: true },
    { value: "custom", text: "Upload Custom Resume" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    inputTypeSelect.append(option);
  }

  inputTypeListItem.append(inputTypeLabel, inputTypeSelect);

  return inputTypeListItem;
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
