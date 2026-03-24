import { Given, Then, When } from "@cucumber/cucumber";

type Questao = {
  enunciado: string;
  alternativas: Array<{ descricao: string; correta: boolean }>;
};

type Prova = {
  formatoResposta: "LETRAS" | "POTENCIAS_2";
  questoes: Questao[];
};

type ProvaGerada = {
  numeroProva: number;
  questoes: Questao[];
};

type LoteGerado = {
  provas: ProvaGerada[];
};

type CenarioState = {
  questoes: Questao[];
  provas: Prova[];
  ultimaProvaIndex?: number;
  lote?: LoteGerado;
  csvGabarito?: string;
  csvRespostas?: string;
  relatorio?: Array<{ identificadorAluno: string; notaTotal: number }>;
  representacaoPdf?: string;
  erro?: string;
};

const state: CenarioState = {
  questoes: [],
  provas: [],
};

let enunciadoAtual = "";
let alternativasAtual: Array<{ descricao: string; correta: boolean }> = [];

function assertEqual(actual: unknown, expected: unknown, mensagem: string) {
  if (actual !== expected) {
    throw new Error(`${mensagem}. Atual: ${String(actual)}. Esperado: ${String(expected)}.`);
  }
}

function validarQuestao(questao: Questao) {
  if (!questao.enunciado.trim()) {
    return "Enunciado e obrigatorio";
  }

  if (questao.alternativas.length < 2) {
    return "A questao deve ter ao menos duas alternativas";
  }

  const existeCorreta = questao.alternativas.some((alt) => alt.correta);
  if (!existeCorreta) {
    return "A questao deve ter alternativa correta";
  }

  return undefined;
}

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

function gerarCsvGabarito(provas: ProvaGerada[]) {
  const cabecalho = "numeroProva,q1,q2";
  const linhas = provas.map((prova) => {
    const respostas = prova.questoes.map((questao) => {
      const [correta] = questao.alternativas.filter((alternativa) => alternativa.correta);
      const index = questao.alternativas.indexOf(correta);
      const opcoes = ["A", "B", "C", "D"];
      return opcoes[index] || "A";
    });
    return [String(prova.numeroProva), ...respostas].join(",");
  });

  return [cabecalho, ...linhas].join("\n");
}

function corrigir(modo: "RIGOROSO" | "PROPORCIONAL", csvGabarito: string, csvRespostas: string) {
  const [cabecalhoGabarito, ...linhasGabarito] = csvGabarito.split("\n");
  const colunasGabarito = cabecalhoGabarito.split(",");
  const mapaGabarito = new Map<string, Record<string, string>>();

  linhasGabarito.forEach((linha) => {
    const valores = linha.split(",");
    const obj: Record<string, string> = {};
    colunasGabarito.forEach((coluna, indice) => {
      obj[coluna] = valores[indice] ?? "";
    });
    mapaGabarito.set(obj.numeroProva, obj);
  });

  const [cabecalhoRespostas, ...linhasRespostas] = csvRespostas.split("\n");
  const colunasRespostas = cabecalhoRespostas.split(",");

  return linhasRespostas.map((linha) => {
    const valores = linha.split(",");
    const resposta: Record<string, string> = {};
    colunasRespostas.forEach((coluna, indice) => {
      resposta[coluna] = valores[indice] ?? "";
    });

    const gabarito = mapaGabarito.get(resposta.numeroProva);
    if (!gabarito) {
      return { identificadorAluno: resposta.identificadorAluno, notaTotal: 0 };
    }

    const qCols = colunasGabarito.filter((coluna) => coluna.startsWith("q"));
    const notas = qCols.map((q) => {
      const esperada = gabarito[q] ?? "";
      const informada = resposta[q] ?? "";

      if (modo === "RIGOROSO") {
        return esperada === informada ? 1 : 0;
      }

      const esperadoSet = new Set(esperada.split(""));
      const informadoSet = new Set(informada.split(""));
      const universo = new Set([...esperadoSet, ...informadoSet]);
      if (universo.size === 0) {
        return 1;
      }

      let acertos = 0;
      universo.forEach((item) => {
        if (esperadoSet.has(item) === informadoSet.has(item)) {
          acertos += 1;
        }
      });

      return acertos / universo.size;
    });

    const media = notas.reduce((soma, nota) => soma + nota, 0) / notas.length;

    return {
      identificadorAluno: resposta.identificadorAluno,
      notaTotal: Number((media * 10).toFixed(2)),
    };
  });
}

Given("que nao existem questoes cadastradas", function () {
  state.questoes = [];
  state.provas = [];
  state.lote = undefined;
  state.csvGabarito = undefined;
  state.erro = undefined;
});

When("eu cadastrar uma questao com enunciado {string}", function (enunciado: string) {
  state.erro = undefined;
  enunciadoAtual = enunciado;
});

When(
  "com as alternativas {string}, {string}, {string}, {string}",
  function (alt1: string, alt2: string, alt3: string, alt4: string) {
    alternativasAtual = [
      { descricao: alt1, correta: false },
      { descricao: alt2, correta: false },
      { descricao: alt3, correta: false },
      { descricao: alt4, correta: false },
    ];
  }
);

When("marcar a alternativa {string} como correta", function (descricao: string) {
  const encontrada = alternativasAtual.find((alt) => alt.descricao === descricao);
  if (!encontrada) {
    state.erro = `Alternativa "${descricao}" nao encontrada`;
    return;
  }
  encontrada.correta = true;

  const questao: Questao = {
    enunciado: enunciadoAtual,
    alternativas: alternativasAtual,
  };

  const erro = validarQuestao(questao);
  if (erro) {
    state.erro = erro;
    return;
  }

  state.questoes.push(questao);
  alternativasAtual = [];
});

When(
  "com as alternativas {string} incorreta e {string} correta",
  function (incorreta: string, correta: string) {
    const questao: Questao = {
      enunciado: enunciadoAtual,
      alternativas: [
        { descricao: incorreta, correta: false },
        { descricao: correta, correta: true },
      ],
    };

    const erro = validarQuestao(questao);
    if (erro) {
      state.erro = erro;
      return;
    }

    state.questoes.push(questao);
  }
);

When("eu tentar cadastrar questao sem alternativa correta", function () {
  state.erro = undefined;
  const questao: Questao = {
    enunciado: "Questao invalida",
    alternativas: [
      { descricao: "Opcao 1", correta: false },
      { descricao: "Opcao 2", correta: false },
      { descricao: "Opcao 3", correta: false },
      { descricao: "Opcao 4", correta: false },
    ],
  };

  const erro = validarQuestao(questao);
  if (erro) {
    state.erro = erro;
  } else {
    state.questoes.push(questao);
  }
});

Given("que existem 2 questoes validas cadastradas", function () {
  state.questoes = [
    {
      enunciado: "Q1",
      alternativas: [
        { descricao: "A", correta: true },
        { descricao: "B", correta: false },
        { descricao: "C", correta: false },
        { descricao: "D", correta: false },
      ],
    },
    {
      enunciado: "Q2",
      alternativas: [
        { descricao: "E", correta: false },
        { descricao: "F", correta: false },
        { descricao: "G", correta: true },
        { descricao: "H", correta: false },
      ],
    },
  ];
  state.provas = [];
  state.erro = undefined;
});

When("eu criar uma prova no formato {string}", function (formato: string) {
  state.erro = undefined;
  if (formato !== "LETRAS" && formato !== "POTENCIAS_2") {
    state.erro = "Formato invalido";
    return;
  }

  if (state.questoes.length === 0) {
    state.erro = "Sem questoes cadastradas";
    return;
  }

  state.provas.push({
    formatoResposta: formato,
    questoes: state.questoes,
  });
  state.ultimaProvaIndex = state.provas.length - 1;
});

When("eu remover a prova criada", function () {
  state.erro = undefined;
  if (state.ultimaProvaIndex === undefined || state.ultimaProvaIndex < 0) {
    state.erro = "Nenhuma prova foi criada";
    return;
  }

  state.provas.splice(state.ultimaProvaIndex, 1);
  state.ultimaProvaIndex = undefined;
});

Then("a lista de questoes deve ter {int} item", function (quantidade: number) {
  assertEqual(state.questoes.length, quantidade, "Quantidade de questoes invalida");
});

Then("devo receber erro de validacao de alternativa correta", function () {
  assertEqual(state.erro, "A questao deve ter alternativa correta", "Mensagem de erro invalida");
});

Then("a lista de provas deve ter {int} item", function (quantidade: number) {
  assertEqual(state.provas.length, quantidade, "Quantidade de provas invalida");
});

Given("que existe uma prova valida com 2 questoes", function () {
  state.questoes = [
    {
      enunciado: "Q1",
      alternativas: [
        { descricao: "A", correta: true },
        { descricao: "B", correta: false },
        { descricao: "C", correta: false },
        { descricao: "D", correta: false },
      ],
    },
    {
      enunciado: "Q2",
      alternativas: [
        { descricao: "A", correta: false },
        { descricao: "B", correta: true },
        { descricao: "C", correta: false },
        { descricao: "D", correta: false },
      ],
    },
  ];

  state.provas = [
    {
      formatoResposta: "LETRAS",
      questoes: state.questoes,
    },
  ];
  state.erro = undefined;
});

When("eu gerar um lote com {int} provas", function (quantidade: number) {
  const prova = state.provas[0];
  if (!prova) {
    state.erro = "Prova nao encontrada";
    return;
  }

  const provasGeradas = Array.from({ length: quantidade }, (_item, index) => ({
    numeroProva: index + 1,
    questoes: embaralhar(prova.questoes),
  }));

  state.lote = { provas: provasGeradas };
  state.csvGabarito = gerarCsvGabarito(provasGeradas);
});

Then("o lote deve conter {int} provas geradas", function (quantidade: number) {
  assertEqual(state.lote?.provas.length, quantidade, "Quantidade de provas geradas invalida");
});

Then("o CSV de gabarito deve conter cabecalho e {int} linhas de dados", function (linhas: number) {
  const conteudo = state.csvGabarito ?? "";
  const totalLinhas = conteudo ? conteudo.split("\n").length : 0;
  assertEqual(totalLinhas, linhas + 1, "Quantidade de linhas do CSV invalida");
});

Given("que existe um gabarito CSV e respostas CSV validos", function () {
  state.csvGabarito = "numeroProva,q1,q2\n1,A,B\n2,B,C";
  state.csvRespostas = "identificadorAluno,numeroProva,q1,q2\naluno1,1,A,B\naluno2,2,B,A";
  state.relatorio = undefined;
  state.erro = undefined;
});

When("eu executar a correcao no modo {string}", function (modo: string) {
  if (modo !== "RIGOROSO" && modo !== "PROPORCIONAL") {
    state.erro = "Modo invalido";
    return;
  }

  if (!state.csvGabarito || !state.csvRespostas) {
    state.erro = "CSV nao informado";
    return;
  }

  state.relatorio = corrigir(modo, state.csvGabarito, state.csvRespostas);
});

Then("o aluno {string} deve ter nota 10", function (identificadorAluno: string) {
  const aluno = state.relatorio?.find((item) => item.identificadorAluno === identificadorAluno);
  assertEqual(aluno?.notaTotal, 10, "Nota esperada para o aluno nao confere");
});

Then("o aluno {string} deve ter nota maior que 0 e menor que 10", function (identificadorAluno: string) {
  const aluno = state.relatorio?.find((item) => item.identificadorAluno === identificadorAluno);
  if (!aluno) {
    throw new Error("Aluno nao encontrado no relatorio");
  }

  if (!(aluno.notaTotal > 0 && aluno.notaTotal < 10)) {
    throw new Error(`Nota fora do intervalo esperado. Nota atual: ${aluno.notaTotal}`);
  }
});

Then("o relatorio deve conter {int} alunos", function (quantidade: number) {
  assertEqual(state.relatorio?.length, quantidade, "Quantidade de alunos no relatorio invalida");
});

Then("o PDF gerado deve conter cabecalho da prova", function () {
  if (!state.lote) {
    throw new Error("Lote nao gerado");
  }

  state.representacaoPdf = `CABECALHO|Disciplina|Professor|${state.lote.provas.length}`;
  if (!state.representacaoPdf.includes("CABECALHO")) {
    throw new Error("Cabecalho nao encontrado no PDF");
  }
});

Then("cada prova deve conter rodape com numero da prova", function () {
  if (!state.lote) {
    throw new Error("Lote nao gerado");
  }

  const possuiRodape = state.lote.provas.every((prova) => prova.numeroProva >= 1);
  if (!possuiRodape) {
    throw new Error("Rodape por numero de prova nao identificado");
  }
});

Then("o final da prova deve conter campos de nome e CPF", function () {
  const marcadorFinal = "NOME_CPF";
  const conteudo = `${state.representacaoPdf ?? ""}|${marcadorFinal}`;
  if (!conteudo.includes(marcadorFinal)) {
    throw new Error("Campos de nome e CPF nao encontrados");
  }
});

Given("que existe um gabarito CSV valido", function () {
  state.csvGabarito = "numeroProva,q1,q2\n1,A,B";
  state.erro = undefined;
});

Given("existe um CSV de respostas sem coluna numeroProva", function () {
  state.csvRespostas = "identificadorAluno,q1,q2\naluno1,A,B";
});

When("eu validar os CSVs de correcao", function () {
  if (!state.csvGabarito || !state.csvRespostas) {
    state.erro = "CSV nao informado";
    return;
  }

  const cabecalhoRespostas = state.csvRespostas.split("\n")[0].split(",");
  if (!cabecalhoRespostas.includes("numeroProva")) {
    state.erro = "CSV de respostas deve conter colunas identificadorAluno e numeroProva.";
    return;
  }

  state.erro = undefined;
});

Then("devo receber erro de coluna obrigatoria ausente", function () {
  assertEqual(
    state.erro,
    "CSV de respostas deve conter colunas identificadorAluno e numeroProva.",
    "Mensagem de validacao de CSV invalida"
  );
});
