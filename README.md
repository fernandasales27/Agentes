# Experimento Pratico com Agente - Sistema de Provas

Este repositorio contem a implementacao do experimento pratico de desenvolvimento com agente para um sistema web de criacao e correcao de provas.

## Estrutura do repositorio
- sistema/frontend: React + TypeScript
- sistema/backend: Node.js + TypeScript
- sistema/cucumber: Cucumber + Gherkin
- 01-Requisitos-E-Arquitetura.md: requisitos e arquitetura proposta
- 02-Backlog-Inicial.md: epicos e historias iniciais
- 03-Modelo-de-Dados.md: modelo de dados
- 04-Cenarios-Aceitacao.feature: cenarios de referencia
- 05-EndPoints-Sugeridos.md: endpoints sugeridos
- AGENTS.md: diretrizes do agente no projeto
- ENTREGA-CHECKLIST.md: checklist final da entrega
- HistoricoDoMeuExperimento-template.csv: template para historico de interacoes
- RevisaoDoSistemaDoMeuColega.md: template de revisao da entrega do colega

## Setup rapido

Stack	Versão

React	18.3.1

TypeScript	5.6.2 (uniforme em todos os packages)

Vite	5.4.8

Express	4.21.0

PDFKit	0.15.0

Cucumber	11.0.1

tsx (dev runner)	4.19.1

Pre-requisito: Node.js LTS com npm.

1. Entrar na pasta do sistema:
   cd sistema
2. Instalar dependencias de todos os modulos:
   npm run install:all
3. Validar tudo (build + testes de aceitacao):
   npm run check

## Execucao local
1. Backend (porta 3000):
   - cd sistema/backend
   - npm run dev
2. Frontend:
   - cd sistema/frontend
   - npm run dev
3. Testes de aceitacao:
   - cd sistema/cucumber
   - npm run test:acceptance

## Roteiro de demonstracao (5 minutos)
### Minuto 1 - Contexto e arquitetura
- Mostrar rapidamente AGENTS.md e 01-Requisitos-E-Arquitetura.md.
- Explicar separacao entre frontend, backend e cucumber.

### Minuto 2 - Cadastro base
- Na aba Questoes: cadastrar uma questao com alternativas.
- Na aba Provas: criar uma prova selecionando questoes e formato de resposta.

### Minuto 3 - Geracao
- Na aba Geracao: gerar lote com 2 ou 3 provas.
- Mostrar metadados do PDF.
- Baixar PDF e gabarito CSV.

### Minuto 4 - Correcao
- Na aba Correcao: validar CSVs.
- Executar correcao em modo RIGOROSO.
- Carregar relatorio e relatorio CSV.

### Minuto 5 - Diferencial de regra
- Executar novamente em modo PROPORCIONAL.
- Comparar nota de aluno parcialmente correto para mostrar diferenca entre modos.

## Checklist de apresentacao
- [ ] Build passando (npm run check em sistema)
- [ ] Frontend e backend rodando localmente
- [ ] Geracao de PDF demonstrada
- [ ] Gabarito CSV demonstrado
- [ ] Correcao RIGOROSO e PROPORCIONAL demonstrada
- [ ] Relatorio final demonstrado

## Referencias internas
- sistema/README.md
- ENTREGA-CHECKLIST.md
- RevisaoDoSistemaDoMeuColega.md
- HistoricoDoMeuExperimento-template.csv
