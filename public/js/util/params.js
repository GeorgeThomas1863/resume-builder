export const buildSubmitParams = async () => {
  return {
    route: "/submit",
    inputPath: null,
    aiType: document.getElementById("ai-type-select").value,
    modelType: document.getElementById("model-select").value,
    serviceTier: document.getElementById("priority-select").value,
    maxTokens: document.getElementById("max-tokens-input").value,
    temperature: document.getElementById("temperature-input").value,
    nukeOhio: document.getElementById("prebuilt-checkbox").checked,
    pi: document.getElementById("pi-checkbox").checked
  };
};
