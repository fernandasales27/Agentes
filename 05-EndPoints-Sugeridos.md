# Endpoints Sugeridos (API REST)

## Questoes
- POST /questoes
- GET /questoes
- GET /questoes/{id}
- PUT /questoes/{id}
- DELETE /questoes/{id}

## Provas Modelo
- POST /provas
- GET /provas
- GET /provas/{id}
- PUT /provas/{id}
- DELETE /provas/{id}

## Geracao de Lotes
- POST /provas/{id}/geracoes
- GET /geracoes/{id}
- GET /geracoes/{id}/pdf
- GET /geracoes/{id}/gabarito-csv

## Correcao
- POST /correcoes
- GET /correcoes/{id}
- GET /correcoes/{id}/relatorio
- GET /correcoes/{id}/relatorio-csv

## Contratos Minimos de Arquivo CSV
### Gabarito
Colunas minimas:
- numeroProva
- q1
- q2
- q3
- ...

### Respostas de alunos
Colunas minimas:
- identificadorAluno
- numeroProva
- q1
- q2
- q3
- ...

## Recomendacoes HTTP
- 200/201 para sucesso.
- 400 para erro de validacao.
- 404 para recurso inexistente.
- 422 para CSV inconsistente.
- 500 para falha interna.
