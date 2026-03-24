# language: pt
Funcionalidade: Sistema de criacao, geracao e correcao de provas

  Contexto:
    Dado que o professor acessa o sistema

  Cenario: Cadastrar questao valida
    Quando cadastrar uma questao com enunciado "Qual a capital do Brasil?"
    E informar as alternativas:
      | descricao       | correta |
      | Sao Paulo       | nao     |
      | Brasilia        | sim     |
      | Rio de Janeiro  | nao     |
    Entao a questao deve ser salva com sucesso

  Cenario: Impedir cadastro de questao sem alternativa correta
    Quando cadastrar uma questao com enunciado "2 + 2 = ?"
    E informar as alternativas:
      | descricao | correta |
      | 3         | nao     |
      | 5         | nao     |
    Entao o sistema deve exibir erro de validacao

  Cenario: Criar prova com formato em letras
    Dado que existem questoes cadastradas
    Quando criar uma prova com disciplina "Matematica" e professor "Ana"
    E selecionar 5 questoes
    E definir formato de resposta "LETRAS"
    Entao a prova deve ser salva com sucesso

  Cenario: Criar prova com formato em potencias de 2
    Dado que existem questoes cadastradas
    Quando criar uma prova com disciplina "Fisica" e professor "Carlos"
    E selecionar 4 questoes
    E definir formato de resposta "POTENCIAS_2"
    Entao a prova deve ser salva com sucesso

  Cenario: Gerar lote de provas com ordem variada
    Dado uma prova modelo cadastrada com 6 questoes
    Quando solicitar a geracao de 10 provas individuais
    Entao o sistema deve gerar 10 provas em PDF
    E cada pagina deve conter rodape com numero da prova
    E deve existir variacao na ordem das questoes e alternativas entre provas

  Cenario: Gerar CSV de gabaritos
    Dado que um lote de provas foi gerado
    Quando solicitar o CSV de gabaritos
    Entao o arquivo deve conter uma linha por numero de prova
    E cada linha deve conter o gabarito de todas as questoes

  Cenario: Corrigir em modo rigoroso
    Dado que existe um CSV de gabarito valido
    E existe um CSV de respostas de alunos valido
    Quando executar a correcao no modo "RIGOROSO"
    Entao respostas com qualquer erro na questao devem receber nota zero na questao
    E o sistema deve calcular a nota final por aluno

  Cenario: Corrigir em modo proporcional
    Dado que existe um CSV de gabarito valido
    E existe um CSV de respostas de alunos valido
    Quando executar a correcao no modo "PROPORCIONAL"
    Entao a nota da questao deve ser proporcional aos acertos de marcacao/desmarcacao
    E o sistema deve calcular a nota final por aluno

  Cenario: Rejeitar CSV de respostas invalido
    Dado que existe um CSV de gabarito valido
    Quando importar um CSV de respostas sem coluna numeroProva
    Entao o sistema deve rejeitar o arquivo com mensagem de erro

  Cenario: Exportar relatorio final da turma
    Dado que uma correcao foi executada
    Quando solicitar o relatorio final
    Entao o sistema deve exibir notas por aluno
    E deve permitir exportacao em CSV
