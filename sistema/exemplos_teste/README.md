# Guia rapido para teste do sistema

Use esta pasta para testar o fluxo completo de provas e correcao.

## Arquivos desta pasta

- provas_exemplo.md: contem 2 provas de exemplo (cada prova com 4 questoes)
- gabarito_correcao_exemplo.csv: CSV de gabarito para a etapa de correcao
- respostas_alunos_exemplo.csv: CSV de respostas dos alunos para a etapa de correcao

## Passo a passo sugerido

1. Abra o sistema web.
2. Na aba de Questoes, cadastre as questoes conforme o arquivo provas_exemplo.md.
3. Na aba de Provas, crie:
   - uma prova no formato LETRAS com 4 questoes
   - uma prova no formato POTENCIAS_2 com 4 questoes
4. Na aba de Geracao, gere o lote de provas e baixe o PDF.
5. Na aba de Correcao:
   - importe gabarito_correcao_exemplo.csv
   - importe respostas_alunos_exemplo.csv
   - escolha o modo de correcao (RIGOROSO ou PROPORCIONAL)
   - clique em Corrigir e carregar relatorio
6. Baixe o relatorio CSV para validar as notas geradas.

## Observacoes importantes

- O numero da prova no CSV de respostas precisa existir no CSV de gabarito.
- As colunas de questoes devem ser as mesmas nos dois arquivos (q1, q2, q3, q4).
- Para comparar os modos de correcao, execute uma vez em RIGOROSO e outra em PROPORCIONAL.
