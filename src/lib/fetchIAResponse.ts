import { setApiKey, query } from "groq";

setApiKey('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');

export const fetchIAResponse = async (prompt: string) => {
  try {
    const response = await query(prompt);
    return response;
  } catch (error) {
    console.error("Erro ao obter resposta da IA:", error);
    throw error; // Rejeitar o erro para que o componente possa lidar com isso
  }
};
