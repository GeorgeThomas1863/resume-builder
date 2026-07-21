const displayElement = document.getElementById("display-element");

// Build the loading overlay (replaces buildLoadStatusMessage)
export const buildLoadingOverlay = async () => {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loading-overlay";
  loadingOverlay.className = "loading-overlay";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  const loadingText = document.createElement("div");
  loadingText.className = "loading-text";
  loadingText.textContent = "Processing your garbage, should take 30-60 seconds, inshaAllah";

  loadingOverlay.append(spinner, loadingText);

  return loadingOverlay;
};

// Show loading overlay
export const showLoadStatus = async () => {
  if (!displayElement) return null;
  console.log("SHOWING LOAD STATUS");

  let loadingOverlay = document.getElementById("loading-overlay");

  if (!loadingOverlay) {
    loadingOverlay = await buildLoadingOverlay();
    document.body.append(loadingOverlay);
  }

  loadingOverlay.classList.add("active");
  return true;
};

// Hide loading overlay
export const hideLoadStatus = async () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (!loadingOverlay) return;

  loadingOverlay.classList.remove("active");
  return true;
};

// Non-blocking toast reporting run outcome; errors linger longer
export const showRunResult = async (success, message) => {
  const existingToast = document.getElementById("run-result-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "run-result-toast";
  toast.className = `run-result-toast ${success ? "success" : "error"}`;
  toast.textContent = message;
  document.body.append(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, success ? 5000 : 10000);

  return true;
};
