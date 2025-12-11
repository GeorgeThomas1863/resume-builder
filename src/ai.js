import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
});

export const runAI = async (resumeText, inputParams) => {
  const { aiType, jobInput } = inputParams;

  //build local as default
  if (aiType === "chatgpt") return await runChatGPT(resumeText, jobInput);

  const messageInput = await buildMessageInput(resumeText, jobInput);

  const params = {
    model: "openai/gpt-oss-20b",
    messages: messageInput,
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 10000,
    stream: false,
  };

  const res = await client.responses.create(params);
  console.log("MODEL RESPONSE");
  console.log(res);
};

export const runChatGPT = async (resumeText, jobInput) => {};

export const buildMessageInput = async (resumeText, jobInput) => {
  const messageInput = [
    {
      role: "system",
      // content: "You are a helpful assistant that helps with resume writing and job searching."
      content: "You are a helpful assistant",
    },
    {
      role: "user",
      //content: `Resume: ${resumeText}\nJob Description: ${jobInput}`
      content: "What is the capital of alabama?",
    },
  ];

  return messageInput;
};
