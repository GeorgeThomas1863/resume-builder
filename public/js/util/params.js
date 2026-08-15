export const buildSubmitParams = async () => {
  return {
    route: "/submit",
    aiType: document.getElementById("ai-type-select").value,
    modelType: document.getElementById("model-select").value,
    screenerAiType: document.getElementById("screener-ai-type-select").value,
    screenerModelType: document.getElementById("screener-model-select").value,
    serviceTier: document.getElementById("priority-select").value,
    maxTokens: document.getElementById("max-tokens-input").value,
    temperature: document.getElementById("temperature-input").value,
    useSpecialInfo: document.getElementById("prebuilt-checkbox").checked,
    pi: document.getElementById("pi-checkbox").checked,
    saveDir: document.getElementById("save-dir-input").value.trim(),
    editingMinutes: document.getElementById("editing-minutes-input").value.trim() || "auto",
  };
};
