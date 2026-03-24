# Sistema

Sistema web do experimento pratico de criacao, geracao e correcao de provas.

## Estrutura

- frontend: aplicacao React + TypeScript
- backend: API Node.js + TypeScript
- cucumber: testes de aceitacao com Gherkin/Cucumber

## Pre-requisitos
- Node.js LTS com npm

## Scripts unificados
Na pasta sistema, use:

1. Instalar tudo:
	npm run install:all
2. Build completo:
	npm run build:all
3. Testes de aceitacao:
	npm run test:acceptance
4. Validacao completa:
	npm run check

## Como comecar
Cada modulo possui seu proprio package.json e scripts:

1. Acesse a pasta desejada (frontend, backend ou cucumber).
2. Execute npm install.
3. Rode os scripts definidos no package.json.

## Execucao local (desenvolvimento)
1. Backend:
	- pasta: sistema/backend
	- comando: npm run dev
	- porta padrao: 3000
2. Frontend:
	- pasta: sistema/frontend
	- comando: npm run dev
	- usa proxy para /api apontando para backend local

## Principais funcionalidades implementadas
1. CRUD de questoes fechadas.
2. CRUD de provas com formato LETRAS ou POTENCIAS_2.
3. Geracao de lote de provas com embaralhamento.
4. Gabarito CSV por lote.
5. Geracao de PDF das provas com:
	- cabecalho
	- rodape por numero da prova
	- area final para nome e CPF
	- quebra de pagina automatica
6. Correcao em modo RIGOROSO e PROPORCIONAL.
7. Relatorio de notas em JSON e CSV.
8. Validacao previa de CSVs de correcao.

## Endpoints principais
Base: /api

1. Questoes:
	- POST /questoes
	- GET /questoes
	- PUT /questoes/:id
	- DELETE /questoes/:id
2. Provas:
	- POST /provas
	- GET /provas
	- PUT /provas/:id
	- DELETE /provas/:id
	- POST /provas/:id/geracoes
3. Geracoes:
	- GET /geracoes/:id
	- GET /geracoes/:id/gabarito-csv
	- GET /geracoes/:id/pdf-metadata
	- GET /geracoes/:id/pdf
4. Correcoes:
	- POST /correcoes/validar-csv
	- POST /correcoes
	- GET /correcoes/:id/relatorio
	- GET /correcoes/:id/relatorio-csv
