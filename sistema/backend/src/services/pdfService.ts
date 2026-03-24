import { Buffer } from "node:buffer";
import PDFDocument from "pdfkit";
import { GeracaoLote, Prova } from "../domain/types.js";

const MARGEM_INFERIOR_UTIL = 80;

function linhaHorizontal(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#777").stroke();
  doc.moveDown(0.5);
}

function formatarDataCabecalho(dataIso: string) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) {
    return "Data: --/--/----";
  }

  return `Data: ${data.toLocaleDateString("pt-BR")}`;
}

function cabecalhoProva(
  doc: PDFKit.PDFDocument,
  prova: Prova,
  numeroProva: number,
  dataCabecalho: string,
  continuidade = false
) {
  doc.fontSize(16).fillColor("#111").text(prova.titulo || "Prova", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(11).text(`Disciplina: ${prova.disciplina}`);
  doc.text(`Professor: ${prova.professor}`);
  doc.text(dataCabecalho);
  doc.text(`Formato de resposta: ${prova.formatoResposta}`);
  doc.text(`Numero da prova: ${numeroProva}`);
  if (continuidade) {
    doc.text("Pagina de continuidade", { align: "right" });
  }
  linhaHorizontal(doc);
}

function rodapeProva(doc: PDFKit.PDFDocument, numeroProva: number) {
  const y = doc.page.height - 40;
  doc.fontSize(9).fillColor("#333").text(`Numero da prova: ${numeroProva}`, 50, y, {
    width: doc.page.width - 100,
    align: "center",
  });
}

function estimarAlturaQuestao(
  doc: PDFKit.PDFDocument,
  textoQuestao: string,
  alternativas: Array<{ rotuloExibicao: string; descricao: string }>,
  formatoResposta: GeracaoLote["formatoResposta"]
) {
  const largura = doc.page.width - 100;
  let total = 0;

  doc.fontSize(12);
  total += doc.heightOfString(textoQuestao, { width: largura }) + 8;

  doc.fontSize(11);
  alternativas.forEach((alternativa) => {
    total += doc.heightOfString(`(${alternativa.rotuloExibicao}) ${alternativa.descricao}`, { width: largura }) + 4;
  });

  doc.fontSize(10);
  if (formatoResposta === "LETRAS") {
    total += doc.heightOfString("Resposta (letras): __________________________", { width: largura }) + 8;
  } else {
    total += doc.heightOfString("Resposta (somatorio): _______________________", { width: largura }) + 8;
  }

  total += 10;
  return total;
}

function garantirEspacoParaQuestao(
  doc: PDFKit.PDFDocument,
  alturaNecessaria: number,
  prova: Prova,
  numeroProva: number,
  dataCabecalho: string
) {
  const limite = doc.page.height - MARGEM_INFERIOR_UTIL;
  if (doc.y + alturaNecessaria <= limite) {
    return;
  }

  rodapeProva(doc, numeroProva);
  doc.addPage();
  cabecalhoProva(doc, prova, numeroProva, dataCabecalho, true);
}

function garantirEspacoParaFinal(
  doc: PDFKit.PDFDocument,
  prova: Prova,
  numeroProva: number,
  dataCabecalho: string
) {
  const alturaFinal = 70;
  const limite = doc.page.height - MARGEM_INFERIOR_UTIL;

  if (doc.y + alturaFinal <= limite) {
    return;
  }

  rodapeProva(doc, numeroProva);
  doc.addPage();
  cabecalhoProva(doc, prova, numeroProva, dataCabecalho, true);
}

export async function gerarPdfDoLote(lote: GeracaoLote, prova: Prova) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  const dataCabecalho = formatarDataCabecalho(lote.criadoEm);

  doc.on("data", (chunk: Buffer) => {
    chunks.push(chunk);
  });

  const finalizado = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on("error", reject);
  });

  lote.provasGeradas.forEach((provaGerada, indiceProva) => {
    if (indiceProva > 0) {
      doc.addPage();
    }

    cabecalhoProva(doc, prova, provaGerada.numeroProva, dataCabecalho);

    provaGerada.questoes.forEach((questao, indiceQuestao) => {
      const alturaQuestao = estimarAlturaQuestao(
        doc,
        `${indiceQuestao + 1}) ${questao.enunciado}`,
        questao.alternativas,
        lote.formatoResposta
      );

      garantirEspacoParaQuestao(doc, alturaQuestao, prova, provaGerada.numeroProva, dataCabecalho);

      doc.fontSize(12).fillColor("#111").text(`${indiceQuestao + 1}) ${questao.enunciado}`);
      doc.moveDown(0.3);

      questao.alternativas.forEach((alternativa) => {
        doc.fontSize(11).fillColor("#111").text(`(${alternativa.rotuloExibicao}) ${alternativa.descricao}`);
      });

      if (lote.formatoResposta === "LETRAS") {
        doc.moveDown(0.3);
        doc.fontSize(10).text("Resposta (letras): __________________________");
      } else {
        doc.moveDown(0.3);
        doc.fontSize(10).text("Resposta (somatorio): _______________________");
      }

      doc.moveDown(0.7);
    });

    garantirEspacoParaFinal(doc, prova, provaGerada.numeroProva, dataCabecalho);

    linhaHorizontal(doc);
    doc.fontSize(11).text("Nome do aluno: ____________________________________________");
    doc.moveDown(0.4);
    doc.text("CPF: ______________________________________________________");

    rodapeProva(doc, provaGerada.numeroProva);
  });

  doc.end();
  return finalizado;
}
