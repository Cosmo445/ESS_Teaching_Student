@gui-sumary
Feature: Importar de planilha de alunos
  As a professor
  I want to importar dados dos alunos de um arquivo para o sistema
  So that eu possa inserir dados no sistema de forma mais prática

  Scenario: Selecionar um arquivo para importação
    Given que estou na tela "Students"
    When eu clico no botão "Select File"
    And seleciono o arquivo "turma.csv"
    Then devo ver uma confirmação de que a importação ocorreu corretamente