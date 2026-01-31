import { buildCollapseContainer } from "./collapse.js";
import { EXPAND_OPTIONS_SVG } from "../util/define-things.js";

export const buildInputForm = async () => {
  const inputFormWrapper = document.createElement("div");
  inputFormWrapper.id = "input-form-wrapper";

  const inputTitleElement = document.createElement("h2");
  inputTitleElement.innerHTML = `Tool to Prettify Your Resume <span class="title-subtitle">("align it with a job description")</span>`;
  inputTitleElement.className = "form-title";

  const inputFormElement = document.createElement("div");
  inputFormElement.id = "input-form-element";
  inputFormElement.className = "form-element";

  // const inputTypeListItem = await buildInputTypeListItem();
  const uploadListItem = await buildUploadListItem();

  const selectRowListItem = await buildSelectRowListItem();
  const modelOptionsListItem = await buildModelOptionsListItem();

  const pasteJobListItem = await buildPasteJobListItem();
  const submitListItem = await buildSubmitListItem();

  // inputFormElement.append(inputTypeListItem, uploadListItem, selectRowListItem, modelOptionsListItem, pasteJobListItem, submitListItem);
  inputFormElement.append(uploadListItem, selectRowListItem, modelOptionsListItem, pasteJobListItem, submitListItem);

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
  uploadButton.textContent = "Upload your default resume";
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

//----------

export const buildSelectRowListItem = async () => {
  const selectRowContainer = document.createElement("li");
  selectRowContainer.id = "select-row-container";
  selectRowContainer.className = "form-list-item form-row";

  const selectAIDiv = await buildSelectAIDiv();
  const selectModelDiv = await buildSelectModelDiv();
  const modelOptionsToggle = await buildModelOptionsToggle();

  selectRowContainer.append(selectAIDiv, selectModelDiv, modelOptionsToggle);

  return selectRowContainer;
};

export const buildSelectAIDiv = async () => {
  const selectAIDiv = document.createElement("div");
  selectAIDiv.id = "select-ai-div";
  selectAIDiv.className = "form-select-half";

  const selectAILabel = document.createElement("label");
  selectAILabel.setAttribute("for", "ai-type-select");
  selectAILabel.textContent = "Select AI";
  selectAILabel.className = "form-label";

  const aiSelectType = document.createElement("select");
  aiSelectType.id = "ai-type-select";
  aiSelectType.className = "form-select";
  // aiSelectType.setAttribute("data-label", "ai-type-select");

  const optionArray = [
    { value: "chatgpt", text: "ChatGPT", selected: true },
    { value: "claude", text: "Claude [DOES NOT WORK]" },
    { value: "local", text: "Local LLM [DOES NOT WORK]" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    aiSelectType.append(option);
  }

  selectAIDiv.append(selectAILabel, aiSelectType);

  return selectAIDiv;
};

export const buildSelectModelDiv = async () => {
  const selectModelDiv = document.createElement("div");
  selectModelDiv.id = "select-model-div";
  selectModelDiv.className = "form-select-half";

  const selectModelLabel = document.createElement("label");
  selectModelLabel.setAttribute("for", "model-select");
  selectModelLabel.textContent = "Select Model";
  selectModelLabel.className = "form-label";

  const modelSelect = document.createElement("select");
  modelSelect.id = "model-select";
  modelSelect.className = "form-select";
  modelSelect.setAttribute("data-label", "model-select");

  const optionArray = [
    { value: "gpt-5.2", text: "GPT 5.2", selected: true },
    { value: "gpt-5", text: "GPT 5" },
    { value: "gpt-5-mini", text: "GPT 5 Mini" },
    { value: "gpt-5-nano", text: "GPT 5 Nano" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    modelSelect.append(option);
  }

  selectModelDiv.append(selectModelLabel, modelSelect);

  return selectModelDiv;
};

export const buildModelOptionsToggle = async () => {
  const modelOptionsToggle = document.createElement("div");
  modelOptionsToggle.id = "model-options-toggle";
  modelOptionsToggle.className = "form-select-half";

  const modelOptionsLabel = document.createElement("label");
  modelOptionsLabel.setAttribute("for", "model-options-select");
  modelOptionsLabel.textContent = "Options";
  modelOptionsLabel.className = "form-label";

  const toggleWrapper = document.createElement("div");
  toggleWrapper.className = "toggle-wrapper";
  toggleWrapper.setAttribute("data-label", "modelOptionsToggle");

  const toggleButton = document.createElement("button");
  toggleButton.id = "toggle-button";
  toggleButton.className = "model-options-toggle-btn";
  toggleButton.setAttribute("data-label", "modelOptionsToggle");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-label", "Toggle model options");
  toggleButton.innerHTML = EXPAND_OPTIONS_SVG;

  toggleWrapper.append(toggleButton);

  modelOptionsToggle.append(modelOptionsLabel, toggleWrapper);

  return modelOptionsToggle;
};

//----

export const buildModelOptionsListItem = async () => {
  const modelOptionsListItem = document.createElement("li");
  modelOptionsListItem.id = "model-options-list-item";
  modelOptionsListItem.className = "form-list-item form-row";
  modelOptionsListItem.classList.add("hidden");

  const priorityDiv = await buildPriorityDiv();
  const maxTokensDiv = await buildMaxTokensDiv();
  const temperatureDiv = await buildTemperatureDiv();
  const prebuiltCheckbox = await buildPrebuiltCheckbox();
  modelOptionsListItem.append(priorityDiv, maxTokensDiv, temperatureDiv, prebuiltCheckbox);

  return modelOptionsListItem;
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
    { value: "priority", text: "Priority (Decent Speed)", selected: true },
    { value: "default", text: "Default (SLOW)" },
    { value: "flex", text: "Flex (cheapest / VERY SLOW)" },
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
  maxTokensInput.min = "1000";
  maxTokensInput.max = "1000000";
  maxTokensInput.step = "1000";
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
  temperatureLabel.textContent = "Temp";

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

export const buildPrebuiltCheckbox = async () => {
  const prebuiltCheckboxDiv = document.createElement("div");
  prebuiltCheckboxDiv.id = "prebuilt-checkbox-div";
  prebuiltCheckboxDiv.className = "form-select-half checkbox-wrapper";

  const prebuiltLabel = document.createElement("label");
  prebuiltLabel.setAttribute("for", "prebuilt-checkbox");
  prebuiltLabel.textContent = "Nuke Ohio?";
  prebuiltLabel.className = "form-label";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const prebuiltCheckbox = document.createElement("input");
  prebuiltCheckbox.type = "checkbox";
  prebuiltCheckbox.id = "prebuilt-checkbox";
  prebuiltCheckbox.className = "form-checkbox";
  prebuiltCheckbox.setAttribute("data-label", "prebuilt-checkbox");

  checkboxContainer.append(prebuiltCheckbox);
  prebuiltCheckboxDiv.append(prebuiltLabel, checkboxContainer);

  return prebuiltCheckboxDiv;
};

//----------------

export const buildPasteJobListItem = async () => {
  const pasteJobListItem = document.createElement("li");
  pasteJobListItem.id = "paste-job-list-item";
  pasteJobListItem.className = "form-list-item";

  const pasteJobLabel = document.createElement("label");
  pasteJobLabel.setAttribute("for", "paste-job-input");
  pasteJobLabel.textContent = "Job Description";
  pasteJobLabel.className = "form-label";

  const pasteJobInput = document.createElement("textarea");
  // pasteJobInput.rows = 15;
  pasteJobInput.rows = 7;
  pasteJobInput.name = "paste-job-input";
  pasteJobInput.id = "paste-job-input";
  pasteJobInput.className = "form-textarea";
  pasteJobInput.placeholder = "[Paste the ENTIRE job description here]";

  pasteJobListItem.append(pasteJobLabel, pasteJobInput);

  return pasteJobListItem;
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
