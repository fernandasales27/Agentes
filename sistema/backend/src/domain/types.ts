export type Alternativa = {
  id: string;
  descricao: string;
  correta: boolean;
};

export type Questao = {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
};

export type FormatoResposta = "LETRAS" | "POTENCIAS_2";

export type Prova = {
  id: string;
  titulo: string;
  disciplina: string;
  professor: string;
  formatoResposta: FormatoResposta;
  questaoIds: string[];
};

export type AlternativaGerada = {
  alternativaId: string;
  descricao: string;
  correta: boolean;
  rotuloExibicao: string;
};

export type QuestaoGerada = {
  questaoId: string;
  enunciado: string;
  alternativas: AlternativaGerada[];
};

export type ProvaGerada = {
  numeroProva: number;
  questoes: QuestaoGerada[];
};

export type GeracaoLote = {
  id: string;
  provaId: string;
  quantidade: number;
  formatoResposta: FormatoResposta;
  provasGeradas: ProvaGerada[];
  criadoEm: string;
};

export type ModoCorrecao = "RIGOROSO" | "PROPORCIONAL";

export type ResultadoQuestao = {
  questao: string;
  respostaEsperada: string;
  respostaInformada: string;
  nota: number;
};

export type ResultadoAluno = {
  identificadorAluno: string;
  numeroProva: number;
  notaTotal: number;
  questoes: ResultadoQuestao[];
};

export type Correcao = {
  id: string;
  modo: ModoCorrecao;
  criadoEm: string;
  resultados: ResultadoAluno[];
};
