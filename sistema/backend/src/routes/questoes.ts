import { Router } from "express";
import { Questao } from "../domain/types.js";
import { store } from "../repositories/inMemoryStore.js";
import { createId } from "../utils/id.js";

export const questoesRouter = Router();

type AlternativaInput = {
  descricao?: unknown;
  correta?: unknown;
};

type QuestaoInput = {
  enunciado?: unknown;
  alternativas?: unknown;
};

function validarQuestao(payload: QuestaoInput) {
  const enunciado = typeof payload.enunciado === "string" ? payload.enunciado.trim() : "";

  if (!enunciado) {
    return "Enunciado e obrigatorio.";
  }

  if (!Array.isArray(payload.alternativas) || payload.alternativas.length < 2) {
    return "A questao deve ter pelo menos 2 alternativas.";
  }

  const alternativas = payload.alternativas as AlternativaInput[];
  const alternativasInvalidas = alternativas.some(
    (alt) => typeof alt.descricao !== "string" || !alt.descricao.trim() || typeof alt.correta !== "boolean"
  );

  if (alternativasInvalidas) {
    return "Cada alternativa deve ter descricao valida e campo correta booleano.";
  }

  const existeCorreta = alternativas.some((alt) => alt.correta === true);
  if (!existeCorreta) {
    return "A questao deve ter pelo menos uma alternativa correta.";
  }

  const quantasCorretas = alternativas.filter((alt) => alt.correta === true).length;
  if (quantasCorretas > 1) {
    return "A questao deve ter exatamente uma alternativa correta.";
  }

  return null;
}

function montarQuestao(payload: QuestaoInput): Questao {
  const alternativas = payload.alternativas as AlternativaInput[];

  return {
    id: createId(),
    enunciado: (payload.enunciado as string).trim(),
    alternativas: alternativas.map((alt) => ({
      id: createId(),
      descricao: (alt.descricao as string).trim(),
      correta: alt.correta as boolean,
    })),
  };
}

questoesRouter.get("/", (_req, res) => {
  res.status(200).json(store.questoes);
});

questoesRouter.post("/", (req, res) => {
  const erro = validarQuestao(req.body as QuestaoInput);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const novaQuestao = montarQuestao(req.body as QuestaoInput);
  store.questoes.push(novaQuestao);
  res.status(201).json(novaQuestao);
});

questoesRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = store.questoes.findIndex((questao) => questao.id === id);

  if (index < 0) {
    res.status(404).json({ error: "Questao nao encontrada." });
    return;
  }

  const erro = validarQuestao(req.body as QuestaoInput);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const atualizada = montarQuestao(req.body as QuestaoInput);
  store.questoes[index] = {
    ...atualizada,
    id,
  };

  res.status(200).json(store.questoes[index]);
});

questoesRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = store.questoes.findIndex((questao) => questao.id === id);

  if (index < 0) {
    res.status(404).json({ error: "Questao nao encontrada." });
    return;
  }

  const provaComQuestao = store.provas.find((prova) => prova.questaoIds.includes(id));
  if (provaComQuestao) {
    res.status(400).json({ error: "Questao vinculada a uma prova existente." });
    return;
  }

  store.questoes.splice(index, 1);
  res.status(204).send();
});
