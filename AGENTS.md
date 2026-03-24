# AGENTS.md

## Objetivo
Este repositorio contem o experimento pratico de desenvolvimento com agente para um sistema web de criacao e correcao de provas.

## Escopo Tecnico Obrigatorio
- Frontend: React + TypeScript
- Backend: Node.js + TypeScript
- Testes de aceitacao: Cucumber + Gherkin

## Estrutura Esperada
- sistema/frontend
- sistema/backend
- sistema/cucumber

## Diretrizes de Implementacao
1. Manter separacao clara entre regras de negocio e camada HTTP.
2. Validar entrada de dados em todos os endpoints.
3. Tratar importacao/exportacao de CSV com validacao de colunas obrigatorias.
4. Preservar rastreabilidade entre prova gerada e gabarito por numero da prova.
5. Implementar os dois modos de correcao: RIGOROSO e PROPORCIONAL.

## Qualidade de Codigo
1. Priorizar codigo modular, legivel e testavel.
2. Adicionar testes para regras criticas de correcao.
3. Evitar acoplamento entre frontend e detalhes internos de persistencia.
4. Registrar erros de forma consistente no backend.

## Criterios de Pronto
Uma funcionalidade so deve ser considerada pronta quando:
1. Implementacao concluida e compilando.
2. Testes de aceitacao relevantes passando.
3. Validacoes de erro cobertas.
4. Documentacao minima atualizada.

## Convencoes
- Idioma dos artefatos: portugues (pt-BR) em textos de negocio.
- Commits pequenos e descritivos.
- Evitar refatoracoes amplas sem necessidade do requisito.
