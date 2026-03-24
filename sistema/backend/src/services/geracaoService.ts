import {
  FormatoResposta,
  GeracaoLote,
  Prova,
  ProvaGerada,
  Questao,
} from "../domain/types.js";
import { createId } from "../utils/id.js";

function embaralhar<T>(itens: T[]) {
  const copia = [...itens];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const aux = copia[i];
    copia[i] = copia[j];
    copia[j] = aux;
  }

  return copia;
}

function rotuloParaIndice(indice: number, formato: FormatoResposta) {
  if (formato === "LETRAS") {
    return String.fromCharCode(65 + indice);
  }

  return String(2 ** indice);
}

function manterOrdemOriginalDasQuestoes(embaralhadas: Questao[], originais: Questao[]) {
  return embaralhadas.every((questao, indice) => questao.id === originais[indice]?.id);
}

function gerarProvaIndividual(prova: Prova, questoesDaProva: Questao[], numeroProva: number): ProvaGerada {
  const questoesEmbaralhadas = embaralhar(questoesDaProva);

  // Evita manter a ordem original quando ha mais de uma questao, deixando o embaralhamento perceptivel.
  if (questoesDaProva.length > 1 && manterOrdemOriginalDasQuestoes(questoesEmbaralhadas, questoesDaProva)) {
    const primeira = questoesEmbaralhadas.shift();
    if (primeira) {
      questoesEmbaralhadas.push(primeira);
    }
  }

  return {
    numeroProva,
    questoes: questoesEmbaralhadas.map((questao) => {
      const alternativasEmbaralhadas = embaralhar(questao.alternativas);

      return {
        questaoId: questao.id,
        enunciado: questao.enunciado,
        alternativas: alternativasEmbaralhadas.map((alternativa, indice) => ({
          alternativaId: alternativa.id,
          descricao: alternativa.descricao,
          correta: alternativa.correta,
          rotuloExibicao: rotuloParaIndice(indice, prova.formatoResposta),
        })),
      };
    }),
  };
}

export function gerarLoteDeProvas(prova: Prova, todasQuestoes: Questao[], quantidade: number): GeracaoLote {
  const questoesDaProva = prova.questaoIds
    .map((questaoId) => todasQuestoes.find((questao) => questao.id === questaoId))
    .filter((questao): questao is Questao => Boolean(questao));

  const provasGeradas = Array.from({ length: quantidade }, (_item, index) =>
    gerarProvaIndividual(prova, questoesDaProva, index + 1)
  );

  return {
    id: createId(),
    provaId: prova.id,
    quantidade,
    formatoResposta: prova.formatoResposta,
    provasGeradas,
    criadoEm: new Date().toISOString(),
  };
}

function gabaritoQuestao(
  formato: FormatoResposta,
  alternativas: Array<{ correta: boolean; rotuloExibicao: string }>
) {
  if (formato === "LETRAS") {
    return alternativas
      .filter((alternativa) => alternativa.correta)
      .map((alternativa) => alternativa.rotuloExibicao)
      .join("");
  }

  return String(
    alternativas
      .filter((alternativa) => alternativa.correta)
      .reduce((soma, alternativa) => soma + Number(alternativa.rotuloExibicao), 0)
  );
}

export function gerarCsvGabarito(lote: GeracaoLote) {
  if (lote.provasGeradas.length === 0) {
    return "numeroProva";
  }

  const quantidadeQuestoes = lote.provasGeradas[0].questoes.length;
  const colunasQuestoes = Array.from({ length: quantidadeQuestoes }, (_item, index) => `q${index + 1}`);
  const cabecalho = ["numeroProva", ...colunasQuestoes].join(",");

  const linhas = lote.provasGeradas.map((provaGerada) => {
    const respostas = provaGerada.questoes.map((questao) => gabaritoQuestao(lote.formatoResposta, questao.alternativas));
    return [String(provaGerada.numeroProva), ...respostas].join(",");
  });

  return [cabecalho, ...linhas].join("\n");
}
