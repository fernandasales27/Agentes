import { Correcao, GeracaoLote, Prova, Questao } from "../domain/types.js";

export const store = {
  questoes: [] as Questao[],
  provas: [] as Prova[],
  geracoes: [] as GeracaoLote[],
  correcoes: [] as Correcao[],
};
