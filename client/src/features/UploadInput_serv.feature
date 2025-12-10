@server
Feature: Importar de planilha de alunos
  As a sistema
  I want to receber dados de alunos em uma planilha
  So that eu possa cadastrar os dados dos alunos

  Scenario: Recebimento de planilha csv sem conflitos
    Given o servidor está disponível
    And nenhum aluno em "turma.csv" está cadastrado no sistema
    When recebo o arquivo "turma.csv"
    Then devo cadstrar os alunos de "turma.csv"