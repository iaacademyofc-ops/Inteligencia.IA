
import { GoogleGenAI } from "@google/genai";
import { Match, Player } from "../types";

/* Strictly using process.env.API_KEY directly as required by the SDK guidelines */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMatchPreview = async (match: Match, squad: Player[]): Promise<string> => {
  try {
    // Estatísticas da Temporada para o Pré-jogo
    const seasonTopScorer = [...squad].sort((a, b) => b.stats.goals - a.stats.goals)[0];
    const seasonTopAssistant = [...squad].sort((a, b) => b.stats.assists - a.stats.assists)[0];

    const statsContext = `
      Estatísticas do Nosso Time na Temporada:
      - Artilheiro: ${seasonTopScorer?.name} (${seasonTopScorer?.stats.goals} gols)
      - Garçom: ${seasonTopAssistant?.name} (${seasonTopAssistant?.stats.assists} assistências)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma legenda empolgante para redes sociais (Instagram/WhatsApp) para o próximo jogo.
      Confronto: Nosso Time vs ${match.opponent}
      Data/Hora: ${match.date} às ${match.time}
      Local: ${match.venue}
      Tipo: Jogo ${match.type}
      
      ${statsContext}
      
      Instruções:
      1. Use um tom profissional mas motivador.
      2. Cite o artilheiro ou o garçom como trunfos para a vitória.
      3. Inclua hashtags e emojis de futebol.
      4. O texto deve ter no máximo 300 caracteres.`
    });
    
    return response.text || "O grande dia está chegando! Prepare o seu coração para torcer pelo nosso time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A bola vai rolar! Contamos com a sua torcida no próximo confronto.";
  }
};

export const generateMatchSummary = async (match: Match, players: Player[]): Promise<string> => {
  try {
    const goals = match.events.filter(e => e.type === 'GOAL');
    const assists = match.events.filter(e => e.type === 'ASSIST');

    // Identificar o "Destaque da Partida" (quem teve mais participações em gols no jogo)
    const participationMap: Record<string, number> = {};
    match.events.forEach(e => {
      if (e.type === 'GOAL' || e.type === 'ASSIST') {
        participationMap[e.playerId] = (participationMap[e.playerId] || 0) + 1;
      }
    });
    const motmId = Object.entries(participationMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    const motmPlayer = players.find(p => p.id === motmId);

    const goalDetails = goals.map(g => {
      const p = players.find(player => player.id === g.playerId);
      return `${p?.name || 'Atleta'} (${g.minute}')`;
    }).join(', ');

    const resultDescription = match.scoreHome > match.scoreAway ? "vencemos com garra" : 
                             match.scoreHome < match.scoreAway ? "lutamos mas o resultado não veio" : "um empate muito disputado";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um resumo curto da partida para o boletim informativo do time.
      Resultado: Nosso Time ${match.scoreHome} x ${match.scoreAway} ${match.opponent}
      Resumo: ${resultDescription}
      Gols marcados por: ${goalDetails || 'Nenhum gol marcado'}
      Destaque Individual: ${motmPlayer ? `${motmPlayer.name} foi o nome do jogo!` : 'Trabalho coletivo incrível.'}
      
      Instruções:
      1. Seja direto e informativo.
      2. Mantenha o tom de união do elenco.
      3. No máximo 2 parágrafos curtos.`
    });
    
    return response.text || "Partida encerrada. Seguimos trabalhando forte para os próximos desafios.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Jogo finalizado. Agradecemos a todos que compareceram e apoiaram o time.";
  }
};
