@gui-sumary
Feature: Análise Gráfica de Desempenho
  As a professor
  I want to visualizar o desempenho das turmas em gráfico de linha
  So that possa acompanhar a evolução das médias e aprovações

  Background:
    Given que estou na tela "Classes"

  Scenario: Acessar o gráfico de linha de uma disciplina (Caminho Feliz)
    Given a disciplina "Engenharia de Software e Sistemas" tem dados históricos cadastrados
    When eu clico no botão "Analyze Classes"
    And seleciono a disciplina "Engenharia de Software e Sistemas"
    And eu seleciono a opção de análise "Análise de Desempenho"
    Then devo ver o gráfico de linha de desempenho com os dados de todas as turmas cadastradas

  Scenario: Tentar visualizar análise sem dados (Fluxo de Exceção)
    Given a disciplina "Matemática Discreta" não tem dados históricos cadastrados
    When eu clico no botão "Analyze Classes"
    Then a disciplina "Matemática Discreta" não deve aparecer na lista de disciplinas disponíveis

  Scenario: Filtrar dados por múltiplos períodos
    Given que estou visualizando o "gráfico de desempenho" da disciplina "Engenharia de Software e Sistemas"
    And a disciplina "Engenharia de Software e Sistemas" tem dados históricos cadastrados
    When eu filtro os dados pelos períodos "2023.1, 2023.2"
    Then os dados devem conter apenas turmas dos períodos "2023.1, 2023.2"

  Scenario Outline: Verificar representação visual das situações dos alunos
    Given que estou visualizando o "gráfico de desempenho" da disciplina "Engenharia de Software e Sistemas"
    And a disciplina "Engenharia de Software e Sistemas" tem dados históricos cadastrados
    When passo o mouse sobre uma linha de turma com média de alunos "<situacao>"
    Then a "linha" correspondente deve ser da cor "<cor>"
    Examples:
      | situacao | cor      |
      | APV. N   | VERDE    |
      | APV. M   | AMARELO  |
      | REP. N   | LARANJA  |
      | REP. M   | VERMELHO |
      | REP. F   | ROXO     |
