import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "",
});

export const runAI = async (resumeText, inputParams) => {
  const { aiType, jobInput } = inputParams;

  console.log("RUNNING AI");
  console.log(inputParams);

  //build local as default
  if (aiType === "chatgpt") return await runChatGPT(resumeText, jobInput);

  const messageInput = await buildMessageInput(resumeText, jobInput);
  console.log("MESSAGE INPUT");
  console.log(messageInput);

  const params = {
    model: "openai/gpt-oss-20b",
    input: messageInput,
  };

  const res = await client.responses.create(params);
  console.log("MODEL RESPONSE");
  console.log(res);

  return res.output_text;
};

export const runChatGPT = async (resumeText, jobInput) => {};

export const buildMessageInput = async (resumeText, jobInput) => {
  const messageInput = [
    {
      role: "system",
      content: `You are a helpful assistant that is an expert in resume writing and job searching.

## Instructions:

Your job is to take the provided Resume and Job Description and output a new resume that is specifically tailored to the job description. 

To do this you will be provided with the following information:

- A Job Description (labeled as "Job Description") and a Resume (labeled as "Resume").

- You will need to output a new resume that is specifically tailored to the job description by rewriting / rephrasing the content in the resume provided.

## Rules:

Please follow the following rules when outputting the new resume:

- The new resume should be tailored to the job description and the resume provided.
- The new resume should be in the same format as the original resume.
- The new resume should be in the same language as the original resume.
- The new resume should be in the same style as the original resume.
- The new resume should be in the same format as the original resume.
- The new resume should be in the same language as the original resume.
- The new resume should be in the same style as the original resume.
- The new resume should be highly professional and formal, and should be concise and easy to read.
- The new resume should be approximately the same length as the original resume, which is 1 page in length.
- Do NOT invent or make up any information in the new resume that is not provided in the original resume.
- Do NOT reference the original resume or that this is a new resume.
- Do NOT use markdown formatting, or other formatting not in the original resume. Just the plain text.
`,
    },
    {
      role: "user",
      content: `Here is the original Resume: ${resumeText}

---------------------------------

And here is the Job Description ${jobInput}

---------------------------------

Again follow the above rules / instructions to output a new resume specifically tailored to the job description.

Only output the new resume, no other text or formatting.`,
    },
  ];

  return messageInput;
};
