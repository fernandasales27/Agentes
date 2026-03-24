import { Router } from "express";
import { store } from "../repositories/inMemoryStore.js";
import { gerarCsvGabarito } from "../services/geracaoService.js";
import { gerarPdfDoLote } from "../services/pdfService.js";

export const geracoesRouter = Router();

geracoesRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  const lote = store.geracoes.find((item) => item.id === id);

  if (!lote) {
    res.status(404).json({ error: "Geracao nao encontrada." });
    return;
  }

  res.status(200).json(lote);
});

geracoesRouter.get("/:id/gabarito-csv", (req, res) => {
  const { id } = req.params;
  const lote = store.geracoes.find((item) => item.id === id);

  if (!lote) {
    res.status(404).json({ error: "Geracao nao encontrada." });
    return;
  }

  const csv = gerarCsvGabarito(lote);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="gabarito-${id}.csv"`);
  res.status(200).send(csv);
});

geracoesRouter.get("/:id/pdf-metadata", (req, res) => {
  const { id } = req.params;
  const lote = store.geracoes.find((item) => item.id === id);

  if (!lote) {
    res.status(404).json({ error: "Geracao nao encontrada." });
    return;
  }

  const prova = store.provas.find((item) => item.id === lote.provaId);
  if (!prova) {
    res.status(404).json({ error: "Prova associada a geracao nao encontrada." });
    return;
  }

  const numeros = lote.provasGeradas.map((item) => item.numeroProva);
  const numeroInicial = numeros.length > 0 ? Math.min(...numeros) : 0;
  const numeroFinal = numeros.length > 0 ? Math.max(...numeros) : 0;
  const questoesPorProva = lote.provasGeradas[0]?.questoes.length ?? 0;

  res.status(200).json({
    geracaoId: lote.id,
    provaId: lote.provaId,
    titulo: prova.titulo,
    disciplina: prova.disciplina,
    professor: prova.professor,
    formatoResposta: lote.formatoResposta,
    quantidadeProvas: lote.quantidade,
    numeroInicial,
    numeroFinal,
    questoesPorProva,
    criadoEm: lote.criadoEm,
  });
});

geracoesRouter.get("/:id/pdf", async (req, res) => {
  const { id } = req.params;
  const lote = store.geracoes.find((item) => item.id === id);

  if (!lote) {
    res.status(404).json({ error: "Geracao nao encontrada." });
    return;
  }

  const prova = store.provas.find((item) => item.id === lote.provaId);
  if (!prova) {
    res.status(404).json({ error: "Prova associada a geracao nao encontrada." });
    return;
  }

  try {
    const pdfBuffer = await gerarPdfDoLote(lote, prova);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="provas-${id}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: `Falha ao gerar PDF: ${(error as Error).message}` });
  }
});
