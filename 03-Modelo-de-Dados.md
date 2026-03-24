# Modelo de Dados (Proposta)

## 1. Entidades

### Questao
- id: UUID
- enunciado: text
- createdAt: datetime
- updatedAt: datetime

### Alternativa
- id: UUID
- questaoId: UUID (FK Questao)
- ordemBase: int
- descricao: text
- correta: boolean

### ProvaModelo
- id: UUID
- titulo: string
- disciplina: string
- professor: string
- dataProva: date
- cabecalhoExtra: text (opcional)
- formatoResposta: enum (LETRAS, POTENCIAS_2)
- createdAt: datetime

### ProvaModeloQuestao
- id: UUID
- provaModeloId: UUID (FK ProvaModelo)
- questaoId: UUID (FK Questao)
- ordemBase: int

### GeracaoLote
- id: UUID
- provaModeloId: UUID (FK ProvaModelo)
- quantidade: int
- seed: string (opcional)
- createdAt: datetime

### ProvaGerada
- id: UUID
- geracaoLoteId: UUID (FK GeracaoLote)
- numeroProva: int

### ProvaGeradaQuestao
- id: UUID
- provaGeradaId: UUID (FK ProvaGerada)
- questaoId: UUID (FK Questao)
- ordemNaProva: int

### ProvaGeradaAlternativa
- id: UUID
- provaGeradaQuestaoId: UUID (FK ProvaGeradaQuestao)
- alternativaId: UUID (FK Alternativa)
- ordemNaQuestao: int
- rotuloExibicao: string (A/B/C ou 1/2/4/8)

### GabaritoQuestao
- id: UUID
- provaGeradaId: UUID (FK ProvaGerada)
- questaoId: UUID (FK Questao)
- respostaEsperadaTexto: string
- respostaEsperadaValor: int (opcional, para potencias)

### Correcao
- id: UUID
- geracaoLoteId: UUID (FK GeracaoLote)
- modoCorrecao: enum (RIGOROSO, PROPORCIONAL)
- arquivoRespostasOriginal: string
- createdAt: datetime

### ResultadoAluno
- id: UUID
- correcaoId: UUID (FK Correcao)
- identificadorAluno: string (nome/cpf/email)
- numeroProva: int
- notaTotal: decimal(5,2)

### ResultadoAlunoQuestao
- id: UUID
- resultadoAlunoId: UUID (FK ResultadoAluno)
- questaoId: UUID
- respostaInformada: string
- notaQuestao: decimal(5,2)
- status: enum (ACERTO, PARCIAL, ERRO)

## 2. Relacionamentos
- Questao 1:N Alternativa
- ProvaModelo N:N Questao (via ProvaModeloQuestao)
- ProvaModelo 1:N GeracaoLote
- GeracaoLote 1:N ProvaGerada
- ProvaGerada 1:N ProvaGeradaQuestao
- ProvaGeradaQuestao 1:N ProvaGeradaAlternativa
- ProvaGerada 1:N GabaritoQuestao
- GeracaoLote 1:N Correcao
- Correcao 1:N ResultadoAluno
- ResultadoAluno 1:N ResultadoAlunoQuestao

## 3. Regras de Integridade
- Questao deve ter >= 2 alternativas.
- Questao deve ter >= 1 alternativa correta.
- ProvaModelo deve ter >= 1 questao para ser gerada.
- NumeroProva deve ser unico dentro de um GeracaoLote.
- Correcao deve referenciar um GeracaoLote existente.

## 4. Observacoes de Persistencia
- Usar transacao na geracao de lote para garantir consistencia entre provas e gabaritos.
- Persistir mapeamento final de ordem de questoes e alternativas para auditoria da correcao.
- Indexar campos frequentes: numeroProva, provaModeloId, geracaoLoteId, correcaoId.
