
import { GoogleGenAI } from "@google/genai";
import { Match, Player, Modality, TeamGender } from "../types";

/* Utilizando a chave de API diretamente do ambiente conforme as diretrizes */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMatchPreview = async (
  match: Match, 
  squad: Player[], 
  modality: Modality, 
  gender: TeamGender,
  highlightedPlayers: Player[]
): Promise<string> => {
  try {
    const seasonTopScorer = [...squad].sort((a, b) => b.stats.goals - a.stats.goals)[0];
    const seasonTopAssistant = [...squad].sort((a, b) => b.stats.assists - a.stats.assists)[0];

    const highlightsText = highlightedPlayers.length > 0 
      ? `OS PROTAGONISTAS DESTA ARTE: ${highlightedPlayers.map(p => `${p.name} (Camisa ${p.number})`).join(', ')}.`
      : '';

    const modalityLingo = modality === Modality.FUTSAL ? "quadra, 40x20, ala/pivô" : 
                         modality === Modality.FUT7 ? "society, gramado sintético, Fut7" : 
                         "campo, 90 minutos, gramado";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um Social Media Manager de um clube profissional de elite. Escreva uma legenda IMPACTANTE e VIRAL para o Instagram/X sobre o próximo jogo.

DADOS DO TIME:
- Clube: Nosso Time (${gender} - ${modality})
- Próximo Desafio: Contra ${match.opponent}
- Local/Data: ${match.venue} às ${match.time} em ${match.date}

ESTATÍSTICAS PARA INCLUIR (Seja criativo ao citar):
- Nosso matador na temporada: ${seasonTopScorer?.name || 'O elenco'} com ${seasonTopScorer?.stats.goals || 0} gols.
- Mestre das assistências: ${seasonTopAssistant?.name || 'O time'} servindo a galera.

DESTAQUES DA ARTE:
${highlightsText}

REGRAS DE OURO:
1. Use terminologia de ${modality} (${modalityLingo}).
2. Se houver protagonistas (destaques), fale que eles estão prontos para o combate.
3. Crie um senso de URGÊNCIA e CONVOCAÇÃO para a torcida.
4. Use emojis que combinem com a energia do esporte.
5. Máximo 280 caracteres. Termine com uma pergunta para engajamento.`
    });
    
    return response.text || "Dia de decisão! O manto está pronto e nossa história continua em campo.";
  } catch (error) {
    console.error("Gemini Preview Error:", error);
    return "A bola vai rolar! Contamos com a sua torcida no próximo confronto.";
  }
};

export const generateMatchSummary = async (
  match: Match, 
  players: Player[],
  modality: Modality,
  gender: TeamGender,
  highlightedPlayers: Player[]
): Promise<string> => {
  try {
    const goals = match.events.filter(e => e.type === 'GOAL');
    const resultDescription = match.scoreHome > match.scoreAway ? "UMA VITÓRIA GIGANTE" : 
                             match.scoreHome < match.scoreAway ? "LUTAMOS ATÉ O FIM" : "TUDO IGUAL";

    const goalsText = goals.length > 0 
      ? `RELATÓRIO DE GOLS: ${goals.map(g => {
          const p = players.find(player => player.id === g.playerId);
          return `${p?.name || 'Atleta'} aos ${g.minute}'`;
        }).join(', ')}.`
      : 'Partida sem gols.';

    const highlightsText = highlightedPlayers.length > 0 
      ? `DESTAQUE PARA: ${highlightedPlayers.map(p => p.name).join(' e ')} que brilharam na arte do resultado.`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um cronista esportivo moderno. Escreva um boletim de encerramento de partida ÉPICO para redes sociais.

PLACAAR FINAL:
Nosso Clube ${match.scoreHome} x ${match.scoreAway} ${match.opponent}
Veredito: ${resultDescription}

ACONTECIMENTOS:
${goalsText}
${highlightsText}

CONTEXTO: ${modality} (${gender})

INSTRUÇÕES:
1. Se vencemos, exalte a força do grupo e a liderança técnica.
2. Se empatamos/perdemos, fale com honra sobre o suor derramado e o foco no próximo treino.
3. Cite os autores dos gols como heróis da jornada.
4. Use um tom de "notícia urgente" e "orgulho pelo escudo".
5. Máximo 300 caracteres com emojis. Use hashtags como #Resiliencia #NossoClube.`
    });
    
    return response.text || "Fim de jogo. Honramos as cores do time até o último apito.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Partida encerrada. Agradecemos o apoio de cada torcedor que esteve conosco.";
  }
};
