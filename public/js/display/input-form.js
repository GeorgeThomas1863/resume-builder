import { buildCollapseContainer } from "./collapse.js";
import { EXPAND_OPTIONS_SVG, modelMap, builderDefaultModels } from "../util/define-things.js";

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

  const builderSelectRowListItem = await buildBuilderSelectRowListItem();
  const screenerSelectRowListItem = await buildScreenerSelectRowListItem();
  const modelOptionsListItem = await buildModelOptionsListItem();

  const pasteJobListItem = await buildPasteJobListItem();
  const saveOptionsListItem = await buildSaveOptionsListItem();
  const submitListItem = await buildSubmitListItem();

  inputFormElement.append(uploadListItem, builderSelectRowListItem, screenerSelectRowListItem, modelOptionsListItem, pasteJobListItem, saveOptionsListItem, submitListItem);

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
  fileInput.accept = ".docx,.pdf";
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

export const buildBuilderSelectRowListItem = async () => {
  const builderSelectRow = document.createElement("li");
  builderSelectRow.id = "builder-select-row";
  builderSelectRow.className = "form-list-item form-row";

  const selectAIDiv = await buildSelectAIDiv();
  const selectModelDiv = await buildSelectModelDiv();
  const toggleSpacerDiv = await buildToggleSpacerDiv();

  builderSelectRow.append(selectAIDiv, selectModelDiv, toggleSpacerDiv);

  return builderSelectRow;
};

export const buildScreenerSelectRowListItem = async () => {
  const screenerSelectRow = document.createElement("li");
  screenerSelectRow.id = "screener-select-row";
  screenerSelectRow.className = "form-list-item form-row";

  const screenerAIDiv = await buildScreenerAIDiv();
  const screenerModelDiv = await buildScreenerModelDiv();
  const modelOptionsToggle = await buildModelOptionsToggle();

  screenerSelectRow.append(screenerAIDiv, screenerModelDiv, modelOptionsToggle);

  return screenerSelectRow;
};

export const buildSelectAIDiv = async () => buildAISelectDiv("ai-type-select", "First Pass AI", "select-ai-div");

export const buildSelectModelDiv = async () => buildModelSelectDiv("model-select", "Select Model", "select-model-div", builderDefaultModels.chatgpt);

export const buildScreenerAIDiv = async () => buildAISelectDiv("screener-ai-type-select", "Screener AI", "select-screener-ai-div", true);

export const buildScreenerModelDiv = async () => buildModelSelectDiv("screener-model-select", "Screener Model", "select-screener-model-div");

const buildAISelectDiv = async (selectId, labelText, divId, hasDataLabel = false) => {
  const selectDiv = document.createElement("div");
  selectDiv.id = divId;
  selectDiv.className = "form-select-half";
  const label = document.createElement("label");
  label.setAttribute("for", selectId);
  label.textContent = labelText;
  label.className = "form-label";
  const select = document.createElement("select");
  select.id = selectId;
  select.className = "form-select";
  if (hasDataLabel) select.setAttribute("data-label", selectId);
  const options = [{ value: "chatgpt", text: "ChatGPT", selected: true }, { value: "claude", text: "Claude" }, { value: "local", text: "Local LLM" }];
  for (let index = 0; index < options.length; index++) {
    const option = document.createElement("option");
    option.value = options[index].value;
    option.textContent = options[index].text;
    if (options[index].selected) option.selected = true;
    select.append(option);
  }
  selectDiv.append(label, select);
  return selectDiv;
};

const buildModelSelectDiv = async (selectId, labelText, divId, defaultValue) => {
  const selectDiv = document.createElement("div");
  selectDiv.id = divId;
  selectDiv.className = "form-select-half";
  const label = document.createElement("label");
  label.setAttribute("for", selectId);
  label.textContent = labelText;
  label.className = "form-label";
  const select = document.createElement("select");
  select.id = selectId;
  select.className = "form-select";
  select.setAttribute("data-label", selectId);
  for (let index = 0; index < modelMap.chatgpt.length; index++) {
    const optionData = modelMap.chatgpt[index];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (defaultValue ? optionData.value === defaultValue : optionData.selected) option.selected = true;
    select.append(option);
  }
  selectDiv.append(label, select);
  return selectDiv;
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

// invisible twin of the options toggle — keeps both select rows the same width
export const buildToggleSpacerDiv = async () => {
  const spacerDiv = document.createElement("div");
  spacerDiv.id = "toggle-spacer";
  spacerDiv.className = "form-select-half";
  spacerDiv.setAttribute("aria-hidden", "true");

  const spacerLabel = document.createElement("label");
  spacerLabel.textContent = "Options";
  spacerLabel.className = "form-label";

  const spacerWrapper = document.createElement("div");
  spacerWrapper.className = "toggle-wrapper";

  const spacerButton = document.createElement("button");
  spacerButton.type = "button";
  spacerButton.className = "model-options-toggle-btn";
  spacerButton.tabIndex = -1;
  spacerButton.innerHTML = EXPAND_OPTIONS_SVG;

  spacerWrapper.append(spacerButton);
  spacerDiv.append(spacerLabel, spacerWrapper);

  return spacerDiv;
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
  const verboseCheckbox = await buildVerboseCheckbox();
  const prebuiltCheckbox = await buildPrebuiltCheckbox();
  const piCheckbox = await buildPICheckbox();

  modelOptionsListItem.append(priorityDiv, maxTokensDiv, temperatureDiv, verboseCheckbox, prebuiltCheckbox, piCheckbox);

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

export const buildVerboseCheckbox = async () => {
  const verboseCheckboxDiv = document.createElement("div");
  verboseCheckboxDiv.id = "verbose-checkbox-div";
  verboseCheckboxDiv.className = "form-select-half checkbox-wrapper";

  const verboseLabel = document.createElement("label");
  verboseLabel.setAttribute("for", "verbose-checkbox");
  verboseLabel.textContent = "Verbose Resume (2-Page)";
  verboseLabel.className = "form-label";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const verboseCheckbox = document.createElement("input");
  verboseCheckbox.type = "checkbox";
  verboseCheckbox.id = "verbose-checkbox";
  verboseCheckbox.className = "form-checkbox";
  verboseCheckbox.checked = true;
  verboseCheckbox.setAttribute("data-label", "verbose-checkbox");

  checkboxContainer.append(verboseCheckbox);
  verboseCheckboxDiv.append(verboseLabel, checkboxContainer);

  return verboseCheckboxDiv;
};

export const buildPrebuiltCheckbox = async () => {
  const prebuiltCheckboxDiv = document.createElement("div");
  prebuiltCheckboxDiv.id = "prebuilt-checkbox-div";
  prebuiltCheckboxDiv.className = "form-select-half checkbox-wrapper";

  const prebuiltLabel = document.createElement("label");
  prebuiltLabel.setAttribute("for", "prebuilt-checkbox");
  prebuiltLabel.textContent = "Use Special Info";
  prebuiltLabel.className = "form-label";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const prebuiltCheckbox = document.createElement("input");
  prebuiltCheckbox.type = "checkbox";
  prebuiltCheckbox.id = "prebuilt-checkbox";
  prebuiltCheckbox.className = "form-checkbox";
  prebuiltCheckbox.checked = true;
  prebuiltCheckbox.setAttribute("data-label", "prebuilt-checkbox");

  checkboxContainer.append(prebuiltCheckbox);
  prebuiltCheckboxDiv.append(prebuiltLabel, checkboxContainer);

  return prebuiltCheckboxDiv;
};

export const buildPICheckbox = async () => {
  const piCheckboxDiv = document.createElement("div");
  piCheckboxDiv.id = "pi-checkbox-div";
  piCheckboxDiv.className = "form-select-half checkbox-wrapper";

  const piLabel = document.createElement("label");
  piLabel.setAttribute("for", "pi-checkbox");
  piLabel.textContent = "PI?";
  piLabel.className = "form-label";

  const piCheckboxContainer = document.createElement("div");
  piCheckboxContainer.className = "checkbox-container";

  const piCheckbox = document.createElement("input");
  piCheckbox.type = "checkbox";
  piCheckbox.id = "pi-checkbox";
  piCheckbox.className = "form-checkbox";
  piCheckbox.setAttribute("data-label", "pi-checkbox");

  piCheckboxContainer.append(piCheckbox);
  piCheckboxDiv.append(piLabel, piCheckboxContainer);

  return piCheckboxDiv;
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

export const buildSaveOptionsListItem = async () => {
  const saveOptionsListItem = document.createElement("li");
  saveOptionsListItem.id = "save-options-list-item";
  saveOptionsListItem.className = "form-list-item";

  const saveDirRow = document.createElement("div");
  saveDirRow.id = "save-dir-row";

  const saveDirLabel = document.createElement("label");
  saveDirLabel.setAttribute("for", "save-dir-input");
  saveDirLabel.className = "form-label";
  saveDirLabel.textContent = "Default save location";

  const saveDirInput = document.createElement("input");
  saveDirInput.type = "text";
  saveDirInput.id = "save-dir-input";
  saveDirInput.className = "form-input";
  saveDirInput.placeholder = "Folder where resumes are saved";

  saveDirRow.append(saveDirLabel, saveDirInput);

  try {
    const res = await fetch("/default-save-dir");
    if (res.ok) {
      const data = await res.json();
      if (data.path) saveDirInput.value = data.path;
    }
  } catch { /* non-blocking — input stays empty if fetch fails */ }

  const editingMinutesRow = document.createElement("div");
  editingMinutesRow.id = "editing-minutes-row";

  const editingMinutesLabel = document.createElement("label");
  editingMinutesLabel.setAttribute("for", "editing-minutes-input");
  editingMinutesLabel.textContent = "Editing Time (min)";
  editingMinutesLabel.className = "form-label";

  const editingMinutesInput = document.createElement("input");
  editingMinutesInput.type = "text";
  editingMinutesInput.id = "editing-minutes-input";
  editingMinutesInput.className = "form-input";
  editingMinutesInput.placeholder = "auto";
  editingMinutesInput.value = "auto";

  editingMinutesRow.append(editingMinutesLabel, editingMinutesInput);

  saveOptionsListItem.append(saveDirRow, editingMinutesRow);

  return saveOptionsListItem;
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
