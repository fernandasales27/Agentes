import { Router } from "express";
import { FormatoResposta, Prova } from "../domain/types.js";
import { store } from "../repositories/inMemoryStore.js";
import { gerarLoteDeProvas } from "../services/geracaoService.js";
import { createId } from "../utils/id.js";

export const provasRouter = Router();

type ProvaInput = {
  titulo?: unknown;
  disciplina?: unknown;
  professor?: unknown;
  formatoResposta?: unknown;
  questaoIds?: unknown;
};

function validarProva(payload: ProvaInput) {
  const titulo = typeof payload.titulo === "string" ? payload.titulo.trim() : "";
  const disciplina = typeof payload.disciplina === "string" ? payload.disciplina.trim() : "";
  const professor = typeof payload.professor === "string" ? payload.professor.trim() : "";

  if (!titulo || !disciplina || !professor) {
    return "Titulo, disciplina e professor sao obrigatorios.";
  }

  const formato = payload.formatoResposta;
  if (formato !== "LETRAS" && formato !== "POTENCIAS_2") {
    return "Formato de resposta invalido.";
  }

  if (!Array.isArray(payload.questaoIds) || payload.questaoIds.length < 1) {
    return "A prova deve conter ao menos uma questao.";
  }

  const ids = payload.questaoIds;
  const idsInvalidos = ids.some((id) => typeof id !== "string" || !id.trim());
  if (idsInvalidos) {
    return "A lista de questoes contem identificadores invalidos.";
  }

  const questoesNaoEncontradas = (ids as string[]).filter(
    (questaoId) => !store.questoes.some((questao) => questao.id === questaoId)
  );

  if (questoesNaoEncontradas.length > 0) {
    return "Existem questoes nao cadastradas na prova.";
  }

  return null;
}

function montarProva(payload: ProvaInput): Prova {
  return {
    id: createId(),
    titulo: (payload.titulo as string).trim(),
    disciplina: (payload.disciplina as string).trim(),
    professor: (payload.professor as string).trim(),
    formatoResposta: payload.formatoResposta as FormatoResposta,
    questaoIds: (payload.questaoIds as string[]).map((id) => id.trim()),
  };
}

provasRouter.get("/", (_req, res) => {
  res.status(200).json(store.provas);
});

provasRouter.post("/", (req, res) => {
  const erro = validarProva(req.body as ProvaInput);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const novaProva = montarProva(req.body as ProvaInput);
  store.provas.push(novaProva);
  res.status(201).json(novaProva);
});

provasRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = store.provas.findIndex((prova) => prova.id === id);

  if (index < 0) {
    res.status(404).json({ error: "Prova nao encontrada." });
    return;
  }

  const erro = validarProva(req.body as ProvaInput);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const atualizada = montarProva(req.body as ProvaInput);
  store.provas[index] = {
    ...atualizada,
    id,
  };

  res.status(200).json(store.provas[index]);
});

provasRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = store.provas.findIndex((prova) => prova.id === id);

  if (index < 0) {
    res.status(404).json({ error: "Prova nao encontrada." });
    return;
  }

  store.provas.splice(index, 1);
  store.geracoes = store.geracoes.filter((geracao) => geracao.provaId !== id);
  res.status(204).send();
});

provasRouter.post("/:id/geracoes", (req, res) => {
  const { id } = req.params;
  const prova = store.provas.find((item) => item.id === id);

  if (!prova) {
    res.status(404).json({ error: "Prova nao encontrada." });
    return;
  }

  const quantidade = Number((req.body as { quantidade?: unknown }).quantidade ?? 0);
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 500) {
    res.status(400).json({ error: "Quantidade deve ser um numero inteiro entre 1 e 500." });
    return;
  }

  const lote = gerarLoteDeProvas(prova, store.questoes, quantidade);
  store.geracoes.push(lote);

  res.status(201).json({
    id: lote.id,
    provaId: lote.provaId,
    quantidade: lote.quantidade,
    formatoResposta: lote.formatoResposta,
    criadoEm: lote.criadoEm,
  });
});
