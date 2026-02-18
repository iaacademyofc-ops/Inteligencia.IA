// DO add comment above each fix.
// Fixed: Using the correct initialization pattern and strictly relying on process.env.API_KEY.
// Fixed: Moving role-playing instructions to systemInstruction and defining a responseSchema for JSON output.

import { GoogleGenAI, Type } from "@google/genai";
import { Match, Player, Modality, TeamGender } from "../types.ts";

export interface AIResponse {
  caption: string;
  headline: string;
}

export const generateMatchPreview = async (
  match: Match, 
  squad: Player[], 
  modality: Modality, 
  gender: TeamGender,
  highlightedPlayers: Player[]
): Promise<AIResponse> => {
  // Always use a named parameter and obtain API key exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const seasonTopScorer = [...squad].sort((a, b) => b.stats.goals - a.stats.goals)[0];
    
    // Constrói contexto dos jogadores destacados
    const playerStatsContext = highlightedPlayers.map(p => 
      `${p.name} (#${p.number}): ${p.stats.goals} gols e ${p.stats.assists} assistências na temporada.`
    ).join(' | ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `CONTEXTO: Pré-jogo de ${modality} (${gender}) contra ${match.opponent}.
      DESTAQUES DA ARTE: ${playerStatsContext}
      ARTILHEIRO DO TIME: ${seasonTopScorer?.name} (${seasonTopScorer?.stats.goals} gols).`,
      config: {
        systemInstruction: `Você é um Social Media de um clube de elite. 
        TAREFA: Gere dois textos (caption e headline) em português brasileiro.
        1. caption: Legenda viral para Instagram (máx 280 chars) com emojis e convocação da torcida.
        2. headline: Um título CURTO e IMPACTANTE para o banner visual (máx 45 chars), citando o poder dos destaques ou a importância do jogo.
        
        IMPORTANTE: Use terminologia de ${modality}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: "Legenda viral para Instagram.",
            },
            headline: {
              type: Type.STRING,
              description: "Título curto e impactante para o banner.",
            },
          },
          required: ["caption", "headline"],
        },
      },
    });
    
    // Correct text extraction: response.text is a property, not a method.
    const result = JSON.parse(response.text || '{"caption": "", "headline": ""}');
    return {
      caption: result.caption || "Dia de decisão! O manto está pronto.",
      headline: result.headline || "RUMO À VITÓRIA"
    };
  } catch (error) {
    console.error("Gemini Preview Error:", error);
    return { caption: "A bola vai rolar!", headline: "MATCHDAY" };
  }
};

export const generateMatchSummary = async (
  match: Match, 
  players: Player[],
  modality: Modality,
  gender: TeamGender,
  highlightedPlayers: Player[]
): Promise<AIResponse> => {
  // Always use a named parameter and obtain API key exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const goals = match.events.filter(e => e.type === 'GOAL');
    const goalsDetail = goals.map(g => {
      const p = players.find(player => player.id === g.playerId);
      return `${p?.name || 'Atleta'} (Gol aos ${g.minute}')`;
    }).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `PLACAR: Nosso Clube ${match.scoreHome} x ${match.scoreAway} ${match.opponent}.
      EVENTOS: ${goalsDetail}.
      DESTAQUES SELECIONADOS: ${highlightedPlayers.map(p => p.name).join(', ')}.`,
      config: {
        systemInstruction: `Você é um cronista esportivo. 
        TAREFA: Gere dois textos (caption e headline) em português brasileiro.
        1. caption: Texto épico de encerramento (máx 300 chars) exaltando os autores dos gols ou a luta do time.
        2. headline: Título de placar para o banner (máx 45 chars). Ex: "VITÓRIA GIGANTE EM CASA" ou "RESULTADO FINAL".

        Contexto: ${modality} (${gender}).`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: "Texto épico de encerramento.",
            },
            headline: {
              type: Type.STRING,
              description: "Título de placar final.",
            },
          },
          required: ["caption", "headline"],
        },
      },
    });
    
    // Correct text extraction: response.text is a property, not a method.
    const result = JSON.parse(response.text || '{"caption": "", "headline": ""}');
    return {
      caption: result.caption || "Fim de jogo. Honramos as cores do time.",
      headline: result.headline || (match.scoreHome > match.scoreAway ? "VITÓRIA!" : "FIM DE JOGO")
    };
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return { caption: "Partida encerrada.", headline: "RESULTADO FINAL" };
  }
};