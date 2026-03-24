import { Router } from "express";
import { correcoesRouter } from "./correcoes.js";
import { geracoesRouter } from "./geracoes.js";
import { provasRouter } from "./provas.js";
import { questoesRouter } from "./questoes.js";

export const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "API base do sistema de provas",
  });
});

router.use("/questoes", questoesRouter);
router.use("/provas", provasRouter);
router.use("/geracoes", geracoesRouter);
router.use("/correcoes", correcoesRouter);
