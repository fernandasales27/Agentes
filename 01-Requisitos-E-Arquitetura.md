# Requisitos e Arquitetura do Sistema

## 1. Visao Geral
Aplicacao web para criacao, geracao e correcao de provas de questoes fechadas, com variacoes de provas por aluno, gabarito por versao e relatorio final de notas.

Stack obrigatoria:
- Cliente: React + TypeScript
- Servidor: Node.js + TypeScript
- Testes de aceitacao: Cucumber com cenarios em Gherkin

## 2. Escopo Funcional
O sistema deve permitir:
1. Gerenciamento de questoes fechadas.
2. Gerenciamento de provas (baseadas em questoes cadastradas).
3. Geracao de provas em PDF com variacao de ordem.
4. Geracao de CSV de gabaritos por prova.
5. Correcao de respostas de alunos com dois modos de rigor.
6. Emissao de relatorio de notas da turma.

## 3. Requisitos Funcionais
### RF01 - Gerenciar Questoes
- Incluir questao com enunciado.
- Incluir alternativas com descricao e indicador de correta/incorreta.
- Alterar questao.
- Remover questao.
- Listar questoes.

### RF02 - Gerenciar Provas
- Criar prova com metadados de cabecalho (disciplina, professor, data etc.).
- Selecionar questoes previamente cadastradas.
- Definir formato de resposta:
  - Letras (A, B, C...)
  - Potencias de 2 (1, 2, 4, 8...)
- Alterar prova.
- Remover prova.
- Listar provas.

### RF03 - Gerar Provas Individuais em PDF
- Receber quantidade de provas a gerar.
- Variar ordem das questoes em cada prova.
- Variar ordem das alternativas em cada questao.
- Incluir cabecalho da prova.
- Incluir rodape em cada pagina com numero da prova individual.
- Incluir ao final espaco para nome e CPF do aluno.

### RF04 - Gerar CSV de Gabarito
- Gerar um CSV com uma linha por prova individual.
- Cada linha deve conter:
  - numero da prova
  - resposta esperada de cada questao
- No modo letras: conjunto de letras corretas.
- No modo potencias: somatorio esperado das alternativas corretas.

### RF05 - Corrigir Provas
- Receber CSV de gabarito.
- Receber CSV de respostas dos alunos.
- Relacionar respostas ao gabarito correto via numero da prova.
- Corrigir em modo rigoroso.
- Corrigir em modo proporcional.
- Calcular nota final por aluno.
- Gerar relatorio final da turma.

### RF06 - Exportar Relatorio
- Permitir exportacao do relatorio de notas em CSV.

## 4. Regras de Negocio
- RN01: Uma prova so pode ser criada com questoes existentes.
- RN02: Cada questao deve possuir pelo menos 2 alternativas.
- RN03: Cada questao deve possuir pelo menos 1 alternativa correta.
- RN04: O gabarito deve refletir exatamente o embaralhamento da prova individual.
- RN05: No modo rigoroso, qualquer erro na questao zera a questao.
- RN06: No modo proporcional, pontuacao da questao e proporcional ao percentual de acertos de marcacao/desmarcacao.
- RN07: Correcao depende do numero da prova para encontrar o gabarito correto.
- RN08: Validar consistencia e formato dos CSVs de entrada.

## 5. Requisitos Nao Funcionais
### RNF01 - Tecnologia
- Frontend em React + TypeScript.
- Backend em Node.js + TypeScript.

### RNF02 - Qualidade
- Codigo modular, legivel e testavel.
- Tratamento padronizado de erros de validacao.

### RNF03 - Usabilidade
- Fluxo simples para professor: cadastrar, montar, gerar e corrigir.
- Feedback de progresso para geracao/correcao em lote.

### RNF04 - Seguranca
- Validacao de entradas e uploads.
- Sanitizacao de dados textuais.
- Limite de tamanho para arquivos enviados.

### RNF05 - Performance
- Processamento eficiente de lotes de provas e correcoes.

## 6. Arquitetura Proposta
Arquitetura em camadas, com separacao de responsabilidades.

### 6.1 Frontend (React + TypeScript)
Modulos:
- Questoes: CRUD de questoes e alternativas.
- Provas: criacao e edicao de provas.
- Geracao: solicitacao de lote e download de PDF/CSV.
- Correcao: upload dos CSVs e exibicao de notas.

Camadas:
- Componentes de UI
- Estado e cache (ex.: React Query)
- Servicos HTTP

### 6.2 Backend (Node + TypeScript)
Camadas:
- Controllers: entrada/saida HTTP.
- Services: regras de negocio.
- Repositories: persistencia.
- Providers: PDF, CSV, randomizacao/embaralhamento.

### 6.3 Persistencia
Banco relacional recomendado (PostgreSQL).

Entidades principais:
- Questao
- Alternativa
- ProvaModelo
- ProvaQuestao
- ProvaGerada
- GabaritoQuestao
- Correcao
- ResultadoAluno

### 6.4 Integracoes de Arquivo
- Geracao de PDF das provas.
- Geracao de CSV de gabarito.
- Leitura de CSV de respostas dos alunos.
- Exportacao de CSV de relatorio.

## 7. Fluxo Principal
1. Professor cadastra questoes.
2. Professor monta uma prova base e define formato de resposta.
3. Sistema gera N provas individuais em PDF e CSV de gabaritos.
4. Professor coleta respostas dos alunos (CSV externo).
5. Sistema corrige em modo rigoroso ou proporcional.
6. Sistema apresenta e exporta relatorio final de notas.
