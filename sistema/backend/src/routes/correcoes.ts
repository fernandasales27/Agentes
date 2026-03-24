import { Router } from "express";
import { ModoCorrecao } from "../domain/types.js";
import { store } from "../repositories/inMemoryStore.js";
import { corrigirCsvs, relatorioCsv, validarCsvsCorrecao } from "../services/correcaoService.js";

export const correcoesRouter = Router();

correcoesRouter.post("/validar-csv", (req, res) => {
  const payload = req.body as {
    gabaritoCsv?: unknown;
    respostasCsv?: unknown;
  };

  if (typeof payload.gabaritoCsv !== "string" || typeof payload.respostasCsv !== "string") {
    res.status(400).json({ error: "gabaritoCsv e respostasCsv devem ser texto CSV." });
    return;
  }

  try {
    const resultado = validarCsvsCorrecao(payload.gabaritoCsv, payload.respostasCsv);
    res.status(200).json({
      valido: true,
      ...resultado,
    });
  } catch (error) {
    res.status(422).json({
      valido: false,
      error: (error as Error).message,
    });
  }
});

correcoesRouter.post("/", (req, res) => {
  const payload = req.body as {
    modo?: unknown;
    gabaritoCsv?: unknown;
    respostasCsv?: unknown;
  };

  const modo = payload.modo as ModoCorrecao;
  if (modo !== "RIGOROSO" && modo !== "PROPORCIONAL") {
    res.status(400).json({ error: "Modo de correcao invalido." });
    return;
  }

  if (typeof payload.gabaritoCsv !== "string" || typeof payload.respostasCsv !== "string") {
    res.status(400).json({ error: "gabaritoCsv e respostasCsv devem ser texto CSV." });
    return;
  }

  try {
    const correcao = corrigirCsvs(modo, payload.gabaritoCsv, payload.respostasCsv);
    store.correcoes.push(correcao);

    res.status(201).json({
      id: correcao.id,
      modo: correcao.modo,
      criadoEm: correcao.criadoEm,
      quantidadeResultados: correcao.resultados.length,
    });
  } catch (error) {
    res.status(422).json({ error: (error as Error).message });
  }
});

correcoesRouter.get("/:id/relatorio", (req, res) => {
  const { id } = req.params;
  const correcao = store.correcoes.find((item) => item.id === id);

  if (!correcao) {
    res.status(404).json({ error: "Correcao nao encontrada." });
    return;
  }

  res.status(200).json(correcao);
});

correcoesRouter.get("/:id/relatorio-csv", (req, res) => {
  const { id } = req.params;
  const correcao = store.correcoes.find((item) => item.id === id);

  if (!correcao) {
    res.status(404).json({ error: "Correcao nao encontrada." });
    return;
  }

  const csv = relatorioCsv(correcao);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="relatorio-${id}.csv"`);
  res.status(200).send(csv);
});
