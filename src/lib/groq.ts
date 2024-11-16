import { setApiKey, query } from "groq";

setApiKey('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');

export const fetchIAResponse = async (prompt: string) => {
  const response = await query(prompt);
  return response;
};
