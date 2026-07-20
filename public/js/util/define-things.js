export const EYE_CLOSED_SVG = `
  <svg id= "eye-closed-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-label="pwToggle">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-label="pwToggle"/>
    <circle cx="12" cy="12" r="3" data-label="pwToggle"/>
    <path d="M2 2l20 20" data-label="pwToggle"/>
  </svg>
`;

export const EYE_OPEN_SVG = `
  <svg id= "eye-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-label="pwToggle">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-label="pwToggle"/>
    <circle cx="12" cy="12" r="3" data-label="pwToggle"/>
  </svg>
`;

export const EXPAND_OPTIONS_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" data-label="modelOptionsToggle">
      <line x1="12" y1="5" x2="12" y2="19" data-label="modelOptionsToggle"></line>
      <line class="horizontal-line" x1="5" y1="12" x2="19" y2="12" data-label="modelOptionsToggle"></line>
    </svg>
  `;

export const modelMap = {
  chatgpt: [
    { value: "gpt-5.6-sol", text: "GPT 5.6 Sol", selected: true },
    { value: "gpt-5.6-terra", text: "GPT 5.6 Terra" },
    { value: "gpt-5.6-luna", text: "GPT 5.6 Luna" },
    { value: "gpt-5.5", text: "GPT 5.5" },
    { value: "gpt-5.4-mini", text: "GPT 5.4 Mini" },
    { value: "gpt-5.4-nano", text: "GPT 5.4 Nano (cheapest)" },
  ],
  claude: [
    { value: "claude-fable-5", text: "Claude Fable 5" },
    { value: "claude-opus-4-8", text: "Claude Opus 4.8", selected: true },
    { value: "claude-sonnet-5", text: "Claude Sonnet 5" },
    { value: "claude-haiku-4-5", text: "Claude Haiku 4.5" },
  ],
  local: [{ value: "meta-llama-3.1-8b-instruct", text: "Meta-Llama 3.1 8B Instruct" }],
};

// builder-pass default overrides per AI type; the screener keeps the modelMap `selected` flags
export const builderDefaultModels = { chatgpt: "gpt-5.6-terra" };
