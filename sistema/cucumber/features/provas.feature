# language: pt
Funcionalidade: Cadastro inicial de questoes e provas

  Cenario: Cadastrar questao valida
    Dado que nao existem questoes cadastradas
    Quando eu cadastrar uma questao com enunciado "Capital do Brasil"
    E com as alternativas "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador"
    E marcar a alternativa "Brasilia" como correta
    Entao a lista de questoes deve ter 1 item

  Cenario: Impedir questao sem alternativa correta
    Dado que nao existem questoes cadastradas
    Quando eu tentar cadastrar questao sem alternativa correta
    Entao devo receber erro de validacao de alternativa correta

  Cenario: Editar questao existente
    Dado que nao existem questoes cadastradas
    Quando eu cadastrar uma questao com enunciado "Capital do Brasil"
    E com as alternativas "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador"
    E marcar a alternativa "Brasilia" como correta
    E eu editar a questao com novo enunciado "Qual e a capital do Brasil?"
    Entao a questao deve conter o enunciado "Qual e a capital do Brasil?"

  Cenario: Remover questao existente
    Dado que nao existem questoes cadastradas
    Quando eu cadastrar uma questao com enunciado "Capital do Brasil"
    E com as alternativas "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador"
    E marcar a alternativa "Brasilia" como correta
    E eu remover a questao criada
    Entao a lista de questoes deve ter 0 item

  Cenario: Criar prova com questoes existentes
    Dado que existem 2 questoes validas cadastradas
    Quando eu criar uma prova no formato "LETRAS"
    Entao a lista de provas deve ter 1 item

  Cenario: Remover prova existente
    Dado que existem 2 questoes validas cadastradas
    Quando eu criar uma prova no formato "LETRAS"
    E eu remover a prova criada
    Entao a lista de provas deve ter 0 item

  Cenario: Editar prova existente
    Dado que existem 2 questoes validas cadastradas
    Quando eu criar uma prova no formato "LETRAS"
    E eu editar a prova com titulo "Prova Editada"
    Entao a prova deve conter o novo titulo "Prova Editada"

  Cenario: Gerar lote de provas com gabarito CSV
    Dado que existe uma prova valida com 2 questoes
    Quando eu gerar um lote com 3 provas
    Entao o lote deve conter 3 provas geradas
    E o CSV de gabarito deve conter cabecalho e 3 linhas de dados

  Cenario: Corrigir em modo rigoroso
    Dado que existe um gabarito CSV e respostas CSV validos
    Quando eu executar a correcao no modo "RIGOROSO"
    Entao o aluno "aluno1" deve ter nota 10

  Cenario: Corrigir em modo proporcional
    Dado que existe um gabarito CSV e respostas CSV validos
    Quando eu executar a correcao no modo "PROPORCIONAL"
    Entao o aluno "aluno2" deve ter nota maior que 0 e menor que 10

  Cenario: Gerar relatorio da turma
    Dado que existe um gabarito CSV e respostas CSV validos
    Quando eu executar a correcao no modo "RIGOROSO"
    Entao o relatorio deve conter 2 alunos

  Cenario: Gerar PDF de provas individuais
    Dado que existe uma prova valida com 2 questoes
    Quando eu gerar um lote com 2 provas
    Entao o PDF gerado deve conter cabecalho da prova
    E cada prova deve conter rodape com numero da prova
    E o final da prova deve conter campos de nome e CPF

  Cenario: Rejeitar CSV de respostas sem coluna obrigatoria
    Dado que existe um gabarito CSV valido
    E existe um CSV de respostas sem coluna numeroProva
    Quando eu validar os CSVs de correcao
    Entao devo receber erro de coluna obrigatoria ausente
