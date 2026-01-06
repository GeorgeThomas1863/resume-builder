export const buildLoadStatusMessage = async () => {
  const loadStatusMessageDiv = document.createElement("div");
  loadStatusMessageDiv.id = "load-status-message-div";
  loadStatusMessageDiv.className = "load-status-message-div";
  loadStatusMessageDiv.style.display = "none";

  return loadStatusMessageDiv;
};

//--------------

export const showLoadStatus = async () => {
  console.log("SHOWING LOAD STATUS");

  const loadStatusMessageDiv = document.getElementById("load-status-message-div");
  if (!loadStatusMessageDiv) return;
  loadStatusMessageDiv.innerHTML = "";
  loadStatusMessageDiv.style.display = "block";

  const loginStatusMessage = document.createElement("div");
  loginStatusMessage.className = "login-status-message";
  loginStatusMessage.textContent = "DATA SUBMITTED, BUILDING RESUME [SHOULD TAKE 10-20 SECONDS]";

  loadStatusMessageDiv.append(loginStatusMessage);
  return true;
};

export const hideLoadStatus = async () => {
  const loadStatusMessageDiv = document.getElementById("load-status-message-div");
  if (!loadStatusMessageDiv) return;
  loadStatusMessageDiv.innerHTML = "";
  loadStatusMessageDiv.style.display = "none";

  return true;
};
