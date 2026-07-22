const displayElement = document.getElementById("display-element");

const RESULT_AUTO_DISMISS_MS = 15000;
let resultDismissTimer = null;

// Show loading overlay in spinner mode
export const showLoadStatus = async () => {
  if (!displayElement) return null;

  const loadingOverlay = getLoadingOverlay();
  clearTimeout(resultDismissTimer);
  loadingOverlay.classList.remove("result-mode");
  loadingOverlay.classList.add("active");
  return true;
};

// Swap the overlay to the run outcome; OK dismisses it, success also auto-dismisses
export const showRunResult = async (success, message) => {
  const loadingOverlay = getLoadingOverlay();

  const resultMessage = document.getElementById("run-result-message");
  resultMessage.textContent = message;
  resultMessage.className = `run-result-message ${success ? "success" : "error"}`;

  loadingOverlay.classList.add("result-mode", "active");

  clearTimeout(resultDismissTimer);
  if (success) resultDismissTimer = setTimeout(dismissRunResult, RESULT_AUTO_DISMISS_MS);
  return true;
};

//----------------------

// Get the overlay, building and attaching it on first use
const getLoadingOverlay = () => {
  const existingOverlay = document.getElementById("loading-overlay");
  if (existingOverlay) return existingOverlay;

  const loadingOverlay = buildLoadingOverlay();
  document.body.append(loadingOverlay);
  return loadingOverlay;
};

// Build the loading overlay: spinner + status text + hidden result panel
const buildLoadingOverlay = () => {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loading-overlay";
  loadingOverlay.className = "loading-overlay";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  const loadingText = document.createElement("div");
  loadingText.className = "loading-text";
  loadingText.textContent = "Processing your garbage, should take 30-60 seconds, inshaAllah";

  loadingOverlay.append(spinner, loadingText, buildResultPanel());
  return loadingOverlay;
};

// Build the result panel shown in place of the spinner when a run finishes
const buildResultPanel = () => {
  const resultPanel = document.createElement("div");
  resultPanel.className = "run-result-panel";

  const resultMessage = document.createElement("div");
  resultMessage.id = "run-result-message";
  resultMessage.className = "run-result-message";

  const okButton = document.createElement("button");
  okButton.type = "button";
  okButton.className = "run-result-ok-btn";
  okButton.textContent = "OK";
  okButton.addEventListener("click", dismissRunResult);

  resultPanel.append(resultMessage, okButton);
  return resultPanel;
};

// Hide the overlay and reset it to spinner mode for the next run
const dismissRunResult = () => {
  clearTimeout(resultDismissTimer);

  const loadingOverlay = document.getElementById("loading-overlay");
  if (!loadingOverlay) return;

  loadingOverlay.classList.remove("active", "result-mode");
};
