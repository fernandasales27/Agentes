import { Correcao, ModoCorrecao, ResultadoAluno, ResultadoQuestao } from "../domain/types.js";
import { createId } from "../utils/id.js";

type LinhaCsv = Record<string, string>;

type CsvParse = {
  cabecalho: string[];
  dados: LinhaCsv[];
};

function parseCsv(texto: string): CsvParse {
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  if (linhas.length < 2) {
    throw new Error("CSV deve conter cabecalho e ao menos uma linha de dados.");
  }

  const cabecalho = linhas[0].split(",").map((coluna) => coluna.trim());
  const dados = linhas.slice(1).map((linha) => {
    const colunas = linha.split(",").map((coluna) => coluna.trim());
    const objeto: LinhaCsv = {};

    cabecalho.forEach((coluna, indice) => {
      objeto[coluna] = colunas[indice] ?? "";
    });

    return objeto;
  });

  return { cabecalho, dados };
}

export function validarCsvsCorrecao(gabaritoCsv: string, respostasCsv: string) {
  const gabarito = parseCsv(gabaritoCsv);
  const respostas = parseCsv(respostasCsv);

  if (!gabarito.cabecalho.includes("numeroProva")) {
    throw new Error("CSV de gabarito deve conter coluna numeroProva.");
  }

  if (!respostas.cabecalho.includes("numeroProva") || !respostas.cabecalho.includes("identificadorAluno")) {
    throw new Error("CSV de respostas deve conter colunas identificadorAluno e numeroProva.");
  }

  const colunasQuestoes = gabarito.cabecalho.filter((coluna) => /^q\d+$/i.test(coluna));
  if (colunasQuestoes.length === 0) {
    throw new Error("CSV de gabarito deve conter colunas de questoes (q1, q2, ...).");
  }

  const faltantesEmRespostas = colunasQuestoes.filter((coluna) => !respostas.cabecalho.includes(coluna));
  if (faltantesEmRespostas.length > 0) {
    throw new Error(`CSV de respostas sem colunas obrigatorias: ${faltantesEmRespostas.join(", ")}.`);
  }

  const provasDisponiveis = new Set(gabarito.dados.map((linha) => linha.numeroProva));
  const provasSemGabarito = respostas.dados
    .map((linha) => linha.numeroProva)
    .filter((numeroProva) => !provasDisponiveis.has(numeroProva));

  if (provasSemGabarito.length > 0) {
    const unicas = [...new Set(provasSemGabarito)];
    throw new Error(`Nao existe gabarito para as provas: ${unicas.join(", ")}.`);
  }

  return {
    linhasGabarito: gabarito.dados.length,
    linhasRespostas: respostas.dados.length,
    colunasQuestoes,
    provasDisponiveis: Array.from(provasDisponiveis),
  };
}

function normalizarToken(valor: string) {
  return valor.replace(/\s+/g, "").toUpperCase();
}

function setFromToken(valor: string) {
  return new Set(normalizarToken(valor).split("").filter((item) => item.length > 0));
}

function notaQuestaoRigorosa(esperada: string, informada: string) {
  const e = normalizarToken(esperada);
  const i = normalizarToken(informada);
  return e === i ? 1 : 0;
}

function notaQuestaoProporcional(esperada: string, informada: string) {
  const esperadoNumerico = Number(normalizarToken(esperada));
  const informadoNumerico = Number(normalizarToken(informada));
  const ambosNumericos = !Number.isNaN(esperadoNumerico) && !Number.isNaN(informadoNumerico);

  if (ambosNumericos) {
    const base = Math.max(Math.abs(esperadoNumerico), 1);
    const erroRelativo = Math.abs(esperadoNumerico - informadoNumerico) / base;
    return Math.max(0, 1 - erroRelativo);
  }

  const esperadoSet = setFromToken(esperada);
  const informadoSet = setFromToken(informada);
  const universo = new Set([...esperadoSet, ...informadoSet]);

  if (universo.size === 0) {
    return 1;
  }

  let acertos = 0;
  universo.forEach((item) => {
    const emEsperado = esperadoSet.has(item);
    const emInformado = informadoSet.has(item);
    if (emEsperado === emInformado) {
      acertos += 1;
    }
  });

  return acertos / universo.size;
}

function calcularNotaQuestao(modo: ModoCorrecao, esperada: string, informada: string) {
  if (modo === "RIGOROSO") {
    return notaQuestaoRigorosa(esperada, informada);
  }

  return notaQuestaoProporcional(esperada, informada);
}

export function corrigirCsvs(modo: ModoCorrecao, gabaritoCsv: string, respostasCsv: string): Correcao {
  const validacao = validarCsvsCorrecao(gabaritoCsv, respostasCsv);
  const gabarito = parseCsv(gabaritoCsv);
  const respostas = parseCsv(respostasCsv);
  const { colunasQuestoes } = validacao;

  const mapaGabarito = new Map<string, LinhaCsv>();
  gabarito.dados.forEach((linha) => {
    mapaGabarito.set(linha.numeroProva, linha);
  });

  const resultados: ResultadoAluno[] = respostas.dados.map((linhaResposta) => {
    const numeroProva = Number(linhaResposta.numeroProva);
    const linhaGabarito = mapaGabarito.get(linhaResposta.numeroProva);

    if (!linhaGabarito) {
      throw new Error(`Nao existe gabarito para a prova ${linhaResposta.numeroProva}.`);
    }

    const questoes: ResultadoQuestao[] = colunasQuestoes.map((questao) => {
      const esperada = linhaGabarito[questao] ?? "";
      const informada = linhaResposta[questao] ?? "";
      const nota = calcularNotaQuestao(modo, esperada, informada);

      return {
        questao,
        respostaEsperada: esperada,
        respostaInformada: informada,
        nota,
      };
    });

    const media = questoes.reduce((soma, questao) => soma + questao.nota, 0) / questoes.length;

    return {
      identificadorAluno: linhaResposta.identificadorAluno,
      numeroProva,
      notaTotal: Number((media * 10).toFixed(2)),
      questoes,
    };
  });

  return {
    id: createId(),
    modo,
    criadoEm: new Date().toISOString(),
    resultados,
  };
}

export function relatorioCsv(correcao: Correcao) {
  const cabecalho = "identificadorAluno,numeroProva,notaTotal";
  const linhas = correcao.resultados.map((resultado) =>
    [resultado.identificadorAluno, String(resultado.numeroProva), String(resultado.notaTotal)].join(",")
  );

  return [cabecalho, ...linhas].join("\n");
}
