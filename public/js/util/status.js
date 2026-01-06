const displayElement = document.getElementById("display-element");

export const buildLoadStatusMessage = async () => {
  const loadStatusMessageDiv = document.createElement("div");
  loadStatusMessageDiv.id = "load-status-message-div";
  loadStatusMessageDiv.className = "load-status-message-div";
  loadStatusMessageDiv.style.display = "none";

  return loadStatusMessageDiv;
};

//--------------

export const showLoadStatus = async () => {
  if (!displayElement) return null;
  console.log("SHOWING LOAD STATUS");

  const loadStatusMessageDiv = await buildLoadStatusMessage();
  if (!loadStatusMessageDiv) return null;

  loadStatusMessageDiv.innerHTML = "";
  loadStatusMessageDiv.style.display = "block";

  const loadStatusMessage = document.createElement("div");
  loadStatusMessage.className = "load-status-message";
  loadStatusMessage.textContent = "DATA SUBMITTED, BUILDING RESUME [SHOULD TAKE 10-20 SECONDS]";

  loadStatusMessageDiv.append(loadStatusMessage);
  loadStatusMessage.append(loadStatusMessageDiv);
  return true;
};

export const hideLoadStatus = async () => {
  const loadStatusMessageDiv = document.getElementById("load-status-message-div");
  if (!loadStatusMessageDiv) return;
  loadStatusMessageDiv.innerHTML = "";
  loadStatusMessageDiv.style.display = "none";

  return true;
};
