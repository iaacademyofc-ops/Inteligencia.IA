
// Fixed: Usando o padrão de inicialização correto e dependendo estritamente de process.env.API_KEY.
import { GoogleGenAI, Type } from "@google/genai";
import { Match, Player, Modality, TeamGender } from "../types.ts";

export interface AIResponse {
  caption: string;
  headline: string;
}

export interface AthleteFeedback {
  feedback: string;
  focusPoint: string;
  motivationalQuote: string;
}

export interface TrainingPlan {
  summary: string;
  exercises: {
    task: string;
    reps: string;
    focus: string;
  }[];
  nutritionTip: string;
}

export interface StaffMotivation {
  verse: string;
  reference: string;
  application: string;
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInstitutionalDocumentAI = async (
  docType: string,
  clubName: string,
  modality: string,
  gender: string
): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um rascunho profissional de um ${docType} para o clube "${clubName}", modalidade ${modality}, categoria ${gender}. O texto deve ser formal, conter cláusulas padrão e espaços para preenchimento de dados (como [DATA], [NOME], [CNPJ]).`,
      config: {
        systemInstruction: "Você é um consultor jurídico esportivo sênior. Redija documentos institucionais precisos, seguindo as normas esportivas brasileiras e legislação vigente.",
      },
    });
    return response.text || "Erro ao gerar documento.";
  } catch (error) {
    return `Rascunho de ${docType} para ${clubName}. Por favor, revise com seu departamento jurídico.`;
  }
};

export const generateTrainingPlanAI = async (player: Player): Promise<TrainingPlan> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ATLETA: ${player.name} POSIÇÃO: ${player.position} STATS: ${player.stats.goals} gols em ${player.stats.matches} jogos.`,
      config: {
        systemInstruction: "Você é um cientista do esporte de elite. Gere um plano de treinamento individualizado em JSON com: summary (resumo técnico), exercises (lista de 3 exercícios com task, reps e focus) e nutritionTip (dica de dieta).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  focus: { type: Type.STRING }
                },
                required: ["task", "reps", "focus"]
              }
            },
            nutritionTip: { type: Type.STRING }
          },
          required: ["summary", "exercises", "nutritionTip"]
        }
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      summary: "Foco em fundamentos básicos.",
      exercises: [{ task: "Corrida leve", reps: "15 min", focus: "Resistência" }],
      nutritionTip: "Mantenha-se hidratado."
    };
  }
};

export const generateBirthdayMessageAI = async (player: Player): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma mensagem curta e vibrante de aniversário para o atleta ${player.name} que joga na posição de ${player.position}. Ele tem ${player.stats.goals} gols na temporada.`,
      config: {
        systemInstruction: "Você é o mestre de cerimônias de um clube de elite. Escreva uma mensagem de parabéns que misture esporte e motivação. Máximo 200 caracteres.",
      },
    });
    return response.text || `Parabéns, ${player.name}! Muita saúde e vitórias na sua caminhada como nosso ${player.position}!`;
  } catch (error) {
    return `Parabéns, ${player.name}! Que este novo ciclo seja repleto de conquistas e gols!`;
  }
};

export const generateStaffMotivation = async (): Promise<StaffMotivation> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Gere uma mensagem motivacional de liderança para uma comissão técnica de esportes baseada em um versículo bíblico.",
      config: {
        systemInstruction: `Você é um mentor espiritual e tático para grandes treinadores. 
        Gere um objeto JSON com:
        1. verse: O texto do versículo bíblico (Português).
        2. reference: A referência bíblica (Ex: Provérbios 27:17).
        3. application: Como esse princípio se aplica à gestão de um time e liderança de atletas.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING },
            reference: { type: Type.STRING },
            application: { type: Type.STRING },
          },
          required: ["verse", "reference", "application"],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return {
      verse: "O ferro afia o ferro; assim o homem afia o rosto do seu amigo.",
      reference: "Provérbios 27:17",
      application: "A evolução do time depende da colaboração e do feedback constante entre os membros da comissão."
    };
  }
};

export const generateAthletePerformanceAI = async (
  player: Player,
  modality: Modality
): Promise<AthleteFeedback> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ATLETA: ${player.name} (#${player.number}) POSIÇÃO: ${player.position} STATS: ${player.stats.goals} gols, ${player.stats.assists} assistências em ${player.stats.matches} jogos.`,
      config: {
        systemInstruction: `Analise a performance e dê feedback técnico e motivacional.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            focusPoint: { type: Type.STRING },
            motivationalQuote: { type: Type.STRING },
          },
          required: ["feedback", "focusPoint", "motivationalQuote"],
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { feedback: "Mantenha o foco!", focusPoint: "Treinos físicos.", motivationalQuote: "Desista de desistir." };
  }
};

export const generateScoutingAI = async (player: Player, opponent: string, modality: Modality): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dica tática para ${player.name} contra ${opponent}.`,
    });
    return response.text || "Foco no posicionamento.";
  } catch (error) {
    return "Jogue com inteligência.";
  }
};

export const generateMatchPreview = async (match: Match, squad: Player[], modality: Modality, gender: TeamGender, highlightedPlayers: Player[]): Promise<AIResponse> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Pré-jogo contra ${match.opponent}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { caption: { type: Type.STRING }, headline: { type: Type.STRING } },
          required: ["caption", "headline"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { caption: "Matchday!", headline: "HOJE TEM JOGO" };
  }
};

export const generateMatchSummary = async (match: Match, players: Player[], modality: Modality, gender: TeamGender, highlightedPlayers: Player[]): Promise<AIResponse> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resultado: ${match.scoreHome}x${match.scoreAway}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { caption: { type: Type.STRING }, headline: { type: Type.STRING } },
          required: ["caption", "headline"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { caption: "Fim de jogo.", headline: "RESULTADO FINAL" };
  }
};
