# Backlog Inicial (Epicos e Historias)

## Epico 1 - Banco de Questoes
### HU01 - Cadastrar questao
Como professor,
quero cadastrar uma questao com alternativas,
para reutilizar em provas.

Criterios de aceitacao:
- Permite informar enunciado.
- Permite adicionar/remover alternativas.
- Permite marcar alternativa correta/incorreta.
- Bloqueia salvamento sem alternativa correta.

### HU02 - Editar questao
Como professor,
quero alterar uma questao existente,
para corrigir enunciado e alternativas.

Criterios de aceitacao:
- Altera enunciado e alternativas.
- Mantem validacoes de consistencia.

### HU03 - Excluir questao
Como professor,
quero remover uma questao,
para manter o banco atualizado.

Criterios de aceitacao:
- Solicita confirmacao de exclusao.
- Impede exclusao se houver regra de integridade ativa.

## Epico 2 - Montagem de Provas
### HU04 - Criar prova
Como professor,
quero criar prova selecionando questoes,
para preparar avaliacoes da turma.

Criterios de aceitacao:
- Permite informar dados de cabecalho.
- Permite selecionar questoes cadastradas.
- Permite escolher formato letras ou potencias de 2.

### HU05 - Editar prova
Como professor,
quero alterar composicao da prova,
para ajustar antes da geracao.

Criterios de aceitacao:
- Permite incluir/remover questoes.
- Permite alterar metadados e formato de resposta.

## Epico 3 - Geracao de Provas e Gabarito
### HU06 - Gerar lote de provas
Como professor,
quero gerar varias provas individuais,
para distribuir versoes diferentes aos alunos.

Criterios de aceitacao:
- Recebe quantidade de provas.
- Embaralha questoes e alternativas por versao.
- Inclui cabecalho e rodape com numero da prova.
- Inclui area final para nome e CPF.

### HU07 - Gerar gabarito CSV
Como professor,
quero obter gabarito por prova em CSV,
para corrigir respostas automaticamente.

Criterios de aceitacao:
- Uma linha por prova gerada.
- Coluna inicial com numero da prova.
- Demais colunas com resposta esperada por questao.

## Epico 4 - Correcao e Relatorio
### HU08 - Corrigir em modo rigoroso
Como professor,
quero corrigir provas em modo rigoroso,
para avaliar com criterio total de acerto.

Criterios de aceitacao:
- Qualquer erro na questao resulta em nota zero na questao.
- Calcula nota final por aluno.

### HU09 - Corrigir em modo proporcional
Como professor,
quero corrigir provas em modo proporcional,
para atribuir nota parcial por questao.

Criterios de aceitacao:
- Pontuacao proporcional ao percentual de acertos de marcacao/desmarcacao.
- Calcula nota final por aluno.

### HU10 - Gerar relatorio da turma
Como professor,
quero visualizar e exportar as notas,
para consolidar o resultado da avaliacao.

Criterios de aceitacao:
- Exibe resultado por aluno.
- Permite exportar CSV final.

## Epico 5 - Qualidade e Aceitacao
### HU11 - Cobrir fluxos com Cucumber
Como equipe,
quero cenarios de aceitacao em Gherkin,
para validar comportamentos esperados ponta a ponta.

Criterios de aceitacao:
- Cenarios cobrindo CRUD de questoes.
- Cenarios cobrindo criacao de provas.
- Cenarios cobrindo geracao PDF/CSV.
- Cenarios cobrindo correcao rigorosa e proporcional.
