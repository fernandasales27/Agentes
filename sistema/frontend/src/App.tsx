import { FormEvent, useEffect, useState } from "react";

type Alternativa = {
  id: string;
  descricao: string;
  correta: boolean;
};

type Questao = {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
};

type FormatoResposta = "LETRAS" | "POTENCIAS_2";

type Prova = {
  id: string;
  titulo: string;
  disciplina: string;
  professor: string;
  formatoResposta: FormatoResposta;
  questaoIds: string[];
};

type LoteGeracaoResumo = {
  id: string;
  provaId: string;
  quantidade: number;
  formatoResposta: FormatoResposta;
  criadoEm: string;
};

type PdfMetadata = {
  geracaoId: string;
  provaId: string;
  titulo: string;
  disciplina: string;
  professor: string;
  formatoResposta: FormatoResposta;
  quantidadeProvas: number;
  numeroInicial: number;
  numeroFinal: number;
  questoesPorProva: number;
  criadoEm: string;
};

type ModoCorrecao = "RIGOROSO" | "PROPORCIONAL";

type ResultadoAluno = {
  identificadorAluno: string;
  numeroProva: number;
  notaTotal: number;
};

type CorrecaoResumo = {
  id: string;
  modo: ModoCorrecao;
  criadoEm: string;
  quantidadeResultados: number;
};

type CorrecaoDetalhada = {
  id: string;
  modo: ModoCorrecao;
  criadoEm: string;
  resultados: ResultadoAluno[];
};

type ValidacaoCsvResultado = {
  valido: boolean;
  linhasGabarito: number;
  linhasRespostas: number;
  colunasQuestoes: string[];
  provasDisponiveis: string[];
};

type AbaTela = "QUESTOES" | "PROVAS" | "GERACAO" | "CORRECAO";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Falha na requisicao");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaTela>("QUESTOES");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  const [enunciado, setEnunciado] = useState("");
  const [alt1, setAlt1] = useState("");
  const [alt2, setAlt2] = useState("");
  const [alt3, setAlt3] = useState("");
  const [alt4, setAlt4] = useState("");
  const [alt1Correta, setAlt1Correta] = useState(false);
  const [alt2Correta, setAlt2Correta] = useState(false);
  const [alt3Correta, setAlt3Correta] = useState(false);
  const [alt4Correta, setAlt4Correta] = useState(false);
  const [questaoIdEmEdicao, setQuestaoIdEmEdicao] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [formatoResposta, setFormatoResposta] = useState<FormatoResposta>("LETRAS");
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>([]);
  const [provaIdEmEdicao, setProvaIdEmEdicao] = useState<string | null>(null);
  const [provaIdParaGeracao, setProvaIdParaGeracao] = useState("");
  const [quantidadeGeracao, setQuantidadeGeracao] = useState(1);
  const [ultimoLote, setUltimoLote] = useState<LoteGeracaoResumo | null>(null);
  const [gabaritoCsv, setGabaritoCsv] = useState("");
  const [pdfMetadata, setPdfMetadata] = useState<PdfMetadata | null>(null);
  const [modoCorrecao, setModoCorrecao] = useState<ModoCorrecao>("RIGOROSO");
  const [respostasCsv, setRespostasCsv] = useState("identificadorAluno,numeroProva,q1,q2\naluno1,1,A,B");
  const [ultimaCorrecao, setUltimaCorrecao] = useState<CorrecaoResumo | null>(null);
  const [relatorio, setRelatorio] = useState<CorrecaoDetalhada | null>(null);
  const [relatorioCsvConteudo, setRelatorioCsvConteudo] = useState("");
  const [validacaoCsv, setValidacaoCsv] = useState<ValidacaoCsvResultado | null>(null);

  async function carregarTudo() {
    try {
      const [listaQuestoes, listaProvas] = await Promise.all([
        fetchJson<Questao[]>("/api/questoes"),
        fetchJson<Prova[]>("/api/provas"),
      ]);
      setQuestoes(listaQuestoes);
      setProvas(listaProvas);
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  useEffect(() => {
    void carregarTudo();
  }, []);

  async function criarOuEditarQuestao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setOk("");

    try {
      const alternativasArray = [
        { descricao: alt1, correta: alt1Correta },
        { descricao: alt2, correta: alt2Correta },
        { descricao: alt3, correta: alt3Correta },
        { descricao: alt4, correta: alt4Correta },
      ].filter((alt) => alt.descricao.trim() !== "");

      if (questaoIdEmEdicao) {
        // Modo edição
        await fetchJson<Questao>(`/api/questoes/${questaoIdEmEdicao}`, {
          method: "PUT",
          body: JSON.stringify({
            enunciado,
            alternativas: alternativasArray,
          }),
        });
        setOk("Questao atualizada com sucesso.");
      } else {
        // Modo criação
        await fetchJson<Questao>("/api/questoes", {
          method: "POST",
          body: JSON.stringify({
            enunciado,
            alternativas: alternativasArray,
          }),
        });
        setOk("Questao criada com sucesso.");
      }

      setEnunciado("");
      setAlt1("");
      setAlt2("");
      setAlt3("");
      setAlt4("");
      setAlt1Correta(false);
      setAlt2Correta(false);
      setAlt3Correta(false);
      setAlt4Correta(false);
      setQuestaoIdEmEdicao(null);
      await carregarTudo();
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  function carregarQuestaoParaEdicao(questao: Questao) {
    setEnunciado(questao.enunciado);
    setQuestaoIdEmEdicao(questao.id);
    
    const alts = questao.alternativas;
    setAlt1(alts[0]?.descricao || "");
    setAlt1Correta(alts[0]?.correta || false);
    setAlt2(alts[1]?.descricao || "");
    setAlt2Correta(alts[1]?.correta || false);
    setAlt3(alts[2]?.descricao || "");
    setAlt3Correta(alts[2]?.correta || false);
    setAlt4(alts[3]?.descricao || "");
    setAlt4Correta(alts[3]?.correta || false);
    
    setErro("");
    setOk("");
  }

  function cancelarEdicaoQuestao() {
    setEnunciado("");
    setAlt1("");
    setAlt2("");
    setAlt3("");
    setAlt4("");
    setAlt1Correta(false);
    setAlt2Correta(false);
    setAlt3Correta(false);
    setAlt4Correta(false);
    setQuestaoIdEmEdicao(null);
    setErro("");
    setOk("");
  }

  async function removerQuestao(questaoId: string) {
    setErro("");
    setOk("");

    try {
      await fetchJson<void>(`/api/questoes/${questaoId}`, {
        method: "DELETE",
      });

      setOk("Questao removida com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  function marcarCorretaAlt(altNumber: number) {
    // Garante que apenas uma alternativa possa ser marcada como correta
    setAlt1Correta(altNumber === 1);
    setAlt2Correta(altNumber === 2);
    setAlt3Correta(altNumber === 3);
    setAlt4Correta(altNumber === 4);
  }

  function desmarcarCorretaSeHouverMultiplas() {
    // Se mais de uma está marcada, desmarca todas (para o usuário escolher novamente)
    const totalCorretas = [alt1Correta, alt2Correta, alt3Correta, alt4Correta].filter(Boolean).length;
    if (totalCorretas > 1) {
      setAlt1Correta(false);
      setAlt2Correta(false);
      setAlt3Correta(false);
      setAlt4Correta(false);
      setErro("Apenas uma alternativa pode ser correta. Escolha novamente.");
    }
  }

  async function criarOuEditarProva(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setOk("");

    try {
      if (provaIdEmEdicao) {
        // Modo edição
        await fetchJson<Prova>(`/api/provas/${provaIdEmEdicao}`, {
          method: "PUT",
          body: JSON.stringify({
            titulo,
            disciplina,
            professor,
            formatoResposta,
            questaoIds: questoesSelecionadas,
          }),
        });
        setOk("Prova atualizada com sucesso.");
      } else {
        // Modo criação
        await fetchJson<Prova>("/api/provas", {
          method: "POST",
          body: JSON.stringify({
            titulo,
            disciplina,
            professor,
            formatoResposta,
            questaoIds: questoesSelecionadas,
          }),
        });
        setOk("Prova criada com sucesso.");
      }

      setTitulo("");
      setDisciplina("");
      setProfessor("");
      setFormatoResposta("LETRAS");
      setQuestoesSelecionadas([]);
      setProvaIdEmEdicao(null);
      await carregarTudo();
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  function carregarProvaParaEdicao(prova: Prova) {
    setTitulo(prova.titulo);
    setDisciplina(prova.disciplina);
    setProfessor(prova.professor);
    setFormatoResposta(prova.formatoResposta);
    setQuestoesSelecionadas(prova.questaoIds);
    setProvaIdEmEdicao(prova.id);
    setErro("");
    setOk("");
  }

  function cancelarEdicaoProva() {
    setTitulo("");
    setDisciplina("");
    setProfessor("");
    setFormatoResposta("LETRAS");
    setQuestoesSelecionadas([]);
    setProvaIdEmEdicao(null);
    setErro("");
    setOk("");
  }

  function toggleQuestao(questaoId: string) {
    setQuestoesSelecionadas((atual) => {
      if (atual.includes(questaoId)) {
        return atual.filter((id) => id !== questaoId);
      }
      return [...atual, questaoId];
    });
  }

  async function removerProva(provaId: string) {
    setErro("");
    setOk("");

    try {
      await fetchJson<void>(`/api/provas/${provaId}`, {
        method: "DELETE",
      });

      setOk("Prova removida com sucesso.");
      await carregarTudo();
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function gerarLote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setOk("");
    setGabaritoCsv("");
    setPdfMetadata(null);

    try {
      const lote = await fetchJson<LoteGeracaoResumo>(`/api/provas/${provaIdParaGeracao}/geracoes`, {
        method: "POST",
        body: JSON.stringify({ quantidade: quantidadeGeracao }),
      });

      setUltimoLote(lote);
      setOk(`Lote ${lote.id} gerado com sucesso.`);
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function carregarGabaritoCsv() {
    setErro("");
    setOk("");

    if (!ultimoLote) {
      setErro("Gere um lote antes de solicitar o gabarito.");
      return;
    }

    try {
      const response = await fetch(`/api/geracoes/${ultimoLote.id}/gabarito-csv`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao obter CSV de gabarito");
      }

      const csv = await response.text();
      setGabaritoCsv(csv);
      setOk("CSV de gabarito carregado.");
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function carregarMetadataPdf() {
    setErro("");
    setOk("");

    if (!ultimoLote) {
      setErro("Gere um lote antes de consultar os metadados do PDF.");
      return;
    }

    try {
      const data = await fetchJson<PdfMetadata>(`/api/geracoes/${ultimoLote.id}/pdf-metadata`);
      setPdfMetadata(data);
      setOk("Metadados do PDF carregados.");
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function baixarPdfDoLote() {
    setErro("");
    setOk("");

    if (!ultimoLote) {
      setErro("Gere um lote antes de baixar o PDF.");
      return;
    }

    try {
      const response = await fetch(`/api/geracoes/${ultimoLote.id}/pdf`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao baixar PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `provas-${ultimoLote.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setOk("PDF do lote baixado com sucesso.");
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function executarCorrecao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setOk("");
    setRelatorio(null);
    setRelatorioCsvConteudo("");

    try {
      const correcao = await fetchJson<CorrecaoResumo>("/api/correcoes", {
        method: "POST",
        body: JSON.stringify({
          modo: modoCorrecao,
          gabaritoCsv,
          respostasCsv,
        }),
      });

      setUltimaCorrecao(correcao);
      setOk(`Correcao ${correcao.id} executada com sucesso.`);
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function validarCsvsCorrecao() {
    setErro("");
    setOk("");

    try {
      const data = await fetchJson<ValidacaoCsvResultado>("/api/correcoes/validar-csv", {
        method: "POST",
        body: JSON.stringify({
          gabaritoCsv,
          respostasCsv,
        }),
      });

      setValidacaoCsv(data);
      setOk("CSVs validados com sucesso.");
    } catch (error) {
      setValidacaoCsv(null);
      setErro((error as Error).message);
    }
  }

  async function carregarRelatorio() {
    setErro("");
    setOk("");

    if (!ultimaCorrecao) {
      setErro("Execute uma correcao antes de carregar o relatorio.");
      return;
    }

    try {
      const data = await fetchJson<CorrecaoDetalhada>(`/api/correcoes/${ultimaCorrecao.id}/relatorio`);
      setRelatorio(data);
      setOk("Relatorio carregado.");
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  async function carregarRelatorioCsv() {
    setErro("");
    setOk("");

    if (!ultimaCorrecao) {
      setErro("Execute uma correcao antes de carregar o CSV de relatorio.");
      return;
    }

    try {
      const response = await fetch(`/api/correcoes/${ultimaCorrecao.id}/relatorio-csv`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao obter CSV de relatorio");
      }

      const csv = await response.text();
      setRelatorioCsvConteudo(csv);
      setOk("CSV de relatorio carregado.");
    } catch (error) {
      setErro((error as Error).message);
    }
  }

  const estiloAba = (aba: AbaTela) => ({
    border: abaAtiva === aba ? "2px solid #111" : "1px solid #bbb",
    background: abaAtiva === aba ? "#f7f7f7" : "#fff",
    padding: "0.5rem 0.9rem",
    marginRight: "0.5rem",
    cursor: "pointer",
  });

  const secaoStyle = { marginTop: "1.2rem", borderTop: "1px solid #ddd", paddingTop: "1rem" };

  return (
    <main style={{ fontFamily: "Segoe UI, sans-serif", padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <h1>Sistema de Provas</h1>
      <p>Fluxo organizado por etapas para cadastro, geracao e correcao.</p>

      <div style={{ marginTop: "1rem" }}>
        <button type="button" style={estiloAba("QUESTOES")} onClick={() => setAbaAtiva("QUESTOES")}>
          Questoes
        </button>
        <button type="button" style={estiloAba("PROVAS")} onClick={() => setAbaAtiva("PROVAS")}>
          Provas
        </button>
        <button type="button" style={estiloAba("GERACAO")} onClick={() => setAbaAtiva("GERACAO")}>
          Geracao
        </button>
        <button type="button" style={estiloAba("CORRECAO")} onClick={() => setAbaAtiva("CORRECAO")}>
          Correcao
        </button>
      </div>

      {erro ? <p style={{ color: "#b00020", marginTop: "1rem" }}>{erro}</p> : null}
      {ok ? <p style={{ color: "#0a7a2f", marginTop: "1rem" }}>{ok}</p> : null}

      {abaAtiva === "QUESTOES" ? (
        <>
          <section style={secaoStyle}>
            <h2>{questaoIdEmEdicao ? "Editar Questao" : "Criar Questao"}</h2>
            <form onSubmit={criarOuEditarQuestao}>
              <label>
                Enunciado
                <br />
                <input value={enunciado} onChange={(e) => setEnunciado(e.target.value)} style={{ width: "100%" }} />
              </label>
              <br />
              <br />
              <label>
                Alternativa 1
                <br />
                <input value={alt1} onChange={(e) => setAlt1(e.target.value)} style={{ width: "100%" }} />
              </label>
              <label style={{ marginLeft: "0.5rem" }}>
                <input type="checkbox" checked={alt1Correta} onChange={() => marcarCorretaAlt(1)} /> Correta
              </label>
              <br />
              <br />
              <label>
                Alternativa 2
                <br />
                <input value={alt2} onChange={(e) => setAlt2(e.target.value)} style={{ width: "100%" }} />
              </label>
              <label style={{ marginLeft: "0.5rem" }}>
                <input type="checkbox" checked={alt2Correta} onChange={() => marcarCorretaAlt(2)} /> Correta
              </label>
              <br />
              <br />
              <label>
                Alternativa 3
                <br />
                <input value={alt3} onChange={(e) => setAlt3(e.target.value)} style={{ width: "100%" }} />
              </label>
              <label style={{ marginLeft: "0.5rem" }}>
                <input type="checkbox" checked={alt3Correta} onChange={() => marcarCorretaAlt(3)} /> Correta
              </label>
              <br />
              <br />
              <label>
                Alternativa 4
                <br />
                <input value={alt4} onChange={(e) => setAlt4(e.target.value)} style={{ width: "100%" }} />
              </label>
              <label style={{ marginLeft: "0.5rem" }}>
                <input type="checkbox" checked={alt4Correta} onChange={() => marcarCorretaAlt(4)} /> Correta
              </label>
              <br />
              <br />
              <button type="submit">{questaoIdEmEdicao ? "Atualizar questao" : "Salvar questao"}</button>
              {questaoIdEmEdicao ? (
                <button
                  type="button"
                  onClick={cancelarEdicaoQuestao}
                  style={{ marginLeft: "0.5rem", backgroundColor: "#757575", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Cancelar
                </button>
              ) : null}
            </form>
          </section>

          <section style={secaoStyle}>
            <h2>Questoes Cadastradas</h2>
            {questoes.length === 0 ? <p>Nenhuma questao cadastrada.</p> : null}
            <ul>
              {questoes.map((questao) => (
                <li key={questao.id} style={{ marginBottom: "0.8rem" }}>
                  <strong>{questao.enunciado}</strong>
                  <ul>
                    {questao.alternativas.map((alternativa) => (
                      <li key={alternativa.id}>
                        {alternativa.descricao} {alternativa.correta ? "(correta)" : ""}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => carregarQuestaoParaEdicao(questao)}
                    style={{ marginTop: "0.4rem", marginRight: "0.4rem", backgroundColor: "#1976d2", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removerQuestao(questao.id)}
                    style={{ marginTop: "0.4rem", backgroundColor: "#d32f2f", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {abaAtiva === "PROVAS" ? (
        <>
          <section style={secaoStyle}>
            <h2>{provaIdEmEdicao ? "Editar Prova" : "Criar Prova"}</h2>
            <form onSubmit={criarOuEditarProva}>
              <label>
                Titulo
                <br />
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={{ width: "100%" }} />
              </label>
              <br />
              <br />
              <label>
                Disciplina
                <br />
                <input value={disciplina} onChange={(e) => setDisciplina(e.target.value)} style={{ width: "100%" }} />
              </label>
              <br />
              <br />
              <label>
                Professor
                <br />
                <input value={professor} onChange={(e) => setProfessor(e.target.value)} style={{ width: "100%" }} />
              </label>
              <br />
              <br />
              <label>
                Formato de resposta
                <br />
                <select value={formatoResposta} onChange={(e) => setFormatoResposta(e.target.value as FormatoResposta)}>
                  <option value="LETRAS">Letras</option>
                  <option value="POTENCIAS_2">Potencias de 2</option>
                </select>
              </label>
              <br />
              <br />
              <div>
                <strong>Selecione as questoes:</strong>
                {questoes.length === 0 ? <p>Cadastre questoes antes de criar a prova.</p> : null}
                {questoes.map((questao) => (
                  <label key={questao.id} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={questoesSelecionadas.includes(questao.id)}
                      onChange={() => toggleQuestao(questao.id)}
                    />
                    {questao.enunciado}
                  </label>
                ))}
              </div>
              <br />
              <button type="submit">{provaIdEmEdicao ? "Atualizar prova" : "Salvar prova"}</button>
              {provaIdEmEdicao ? (
                <button
                  type="button"
                  onClick={cancelarEdicaoProva}
                  style={{ marginLeft: "0.5rem", backgroundColor: "#757575", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Cancelar
                </button>
              ) : null}
            </form>
          </section>

          <section style={secaoStyle}>
            <h2>Provas Cadastradas</h2>
            {provas.length === 0 ? <p>Nenhuma prova cadastrada.</p> : null}
            <ul>
              {provas.map((prova) => (
                <li key={prova.id} style={{ marginBottom: "0.8rem" }}>
                  <div>
                    {prova.titulo} - {prova.disciplina} - {prova.professor} - {prova.formatoResposta} ({prova.questaoIds.length} questoes)
                  </div>
                  <button
                    type="button"
                    onClick={() => carregarProvaParaEdicao(prova)}
                    style={{ marginTop: "0.4rem", marginRight: "0.4rem", backgroundColor: "#1976d2", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removerProva(prova.id)}
                    style={{ marginTop: "0.4rem", backgroundColor: "#d32f2f", color: "#fff", padding: "0.4rem 0.8rem", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {abaAtiva === "GERACAO" ? (
        <section style={secaoStyle}>
          <h2>Gerar Lote de Provas</h2>
          <form onSubmit={gerarLote}>
            <label>
              Prova
              <br />
              <select value={provaIdParaGeracao} onChange={(e) => setProvaIdParaGeracao(e.target.value)}>
                <option value="">Selecione...</option>
                {provas.map((prova) => (
                  <option key={prova.id} value={prova.id}>
                    {prova.titulo} ({prova.formatoResposta})
                  </option>
                ))}
              </select>
            </label>
            <br />
            <br />
            <label>
              Quantidade
              <br />
              <input
                type="number"
                min={1}
                max={500}
                value={quantidadeGeracao}
                onChange={(e) => setQuantidadeGeracao(Number(e.target.value))}
              />
            </label>
            <br />
            <br />
            <button type="submit">Gerar lote</button>
          </form>

          {ultimoLote ? (
            <p style={{ marginTop: "0.8rem" }}>
              Ultimo lote: {ultimoLote.id} | prova {ultimoLote.provaId} | quantidade {ultimoLote.quantidade}
            </p>
          ) : null}

          <button type="button" onClick={carregarGabaritoCsv} style={{ marginTop: "0.8rem" }}>
            Carregar gabarito CSV do ultimo lote
          </button>
          <button type="button" onClick={carregarMetadataPdf} style={{ marginTop: "0.8rem", marginLeft: "0.5rem" }}>
            Ver metadados do PDF
          </button>
          <button type="button" onClick={baixarPdfDoLote} style={{ marginTop: "0.8rem", marginLeft: "0.5rem" }}>
            Baixar PDF do lote
          </button>

          {pdfMetadata ? (
            <ul style={{ marginTop: "0.8rem" }}>
              <li>Titulo: {pdfMetadata.titulo}</li>
              <li>Disciplina: {pdfMetadata.disciplina}</li>
              <li>Professor: {pdfMetadata.professor}</li>
              <li>Formato: {pdfMetadata.formatoResposta}</li>
              <li>Quantidade de provas: {pdfMetadata.quantidadeProvas}</li>
              <li>Intervalo de numeros: {pdfMetadata.numeroInicial} a {pdfMetadata.numeroFinal}</li>
              <li>Questoes por prova: {pdfMetadata.questoesPorProva}</li>
            </ul>
          ) : null}

          {gabaritoCsv ? (
            <pre
              style={{
                marginTop: "0.8rem",
                background: "#f5f5f5",
                padding: "0.8rem",
                overflowX: "auto",
              }}
            >
              {gabaritoCsv}
            </pre>
          ) : null}
        </section>
      ) : null}

      {abaAtiva === "CORRECAO" ? (
        <section style={secaoStyle}>
          <h2>Correcao de Provas</h2>
          <form onSubmit={executarCorrecao}>
            <label>
              Modo de correcao
              <br />
              <select value={modoCorrecao} onChange={(e) => setModoCorrecao(e.target.value as ModoCorrecao)}>
                <option value="RIGOROSO">RIGOROSO</option>
                <option value="PROPORCIONAL">PROPORCIONAL</option>
              </select>
            </label>
            <br />
            <br />
            <label>
              CSV de gabarito
              <br />
              <textarea
                value={gabaritoCsv}
                onChange={(e) => setGabaritoCsv(e.target.value)}
                rows={6}
                style={{ width: "100%" }}
              />
            </label>
            <br />
            <br />
            <label>
              CSV de respostas
              <br />
              <textarea
                value={respostasCsv}
                onChange={(e) => setRespostasCsv(e.target.value)}
                rows={6}
                style={{ width: "100%" }}
              />
            </label>
            <br />
            <br />
            <button type="button" onClick={validarCsvsCorrecao} style={{ marginRight: "0.5rem" }}>
              Validar CSVs
            </button>
            <button type="submit">Executar correcao</button>
          </form>

          {validacaoCsv ? (
            <p style={{ marginTop: "0.8rem" }}>
              Validacao: {validacaoCsv.linhasGabarito} linhas de gabarito, {validacaoCsv.linhasRespostas} linhas de
              respostas, questoes {validacaoCsv.colunasQuestoes.join(", ")}.
            </p>
          ) : null}

          {ultimaCorrecao ? (
            <p style={{ marginTop: "0.8rem" }}>
              Ultima correcao: {ultimaCorrecao.id} | modo {ultimaCorrecao.modo} | resultados {ultimaCorrecao.quantidadeResultados}
            </p>
          ) : null}

          <button type="button" onClick={carregarRelatorio} style={{ marginTop: "0.8rem" }}>
            Carregar relatorio
          </button>
          <button type="button" onClick={carregarRelatorioCsv} style={{ marginTop: "0.8rem", marginLeft: "0.5rem" }}>
            Carregar relatorio CSV
          </button>

          {relatorio ? (
            <ul style={{ marginTop: "0.8rem" }}>
              {relatorio.resultados.map((resultado) => (
                <li key={`${resultado.identificadorAluno}-${resultado.numeroProva}`}>
                  {resultado.identificadorAluno} - prova {resultado.numeroProva} - nota {resultado.notaTotal}
                </li>
              ))}
            </ul>
          ) : null}

          {relatorioCsvConteudo ? (
            <pre
              style={{
                marginTop: "0.8rem",
                background: "#f5f5f5",
                padding: "0.8rem",
                overflowX: "auto",
              }}
            >
              {relatorioCsvConteudo}
            </pre>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
