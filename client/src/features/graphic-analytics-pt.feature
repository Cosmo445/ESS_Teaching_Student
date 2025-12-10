@gui
Feature: Análise Gráfica de Desempenho
  As a professor
  I want to visualizar o desempenho das turmas em gráfico de linha
  So that possa acompanhar a evolução das médias e aprovações

  Background:
    Given que estou na tela "Turmas"
    And a disciplina "Engenharia de Software (ESS)" tem dados históricos cadastrados
    And a disciplina "Matemática Discreta" não tem dados históricos cadastrados

  Scenario: Acessar o gráfico de linha de uma disciplina (Caminho Feliz)
    When eu clico no botão "Análise"
    And seleciono a disciplina "Engenharia de Software (ESS)"
    And seleciono a opção de análise "Análise de Desempenho"
    Then devo ver o gráfico de linha de desempenho
    And o gráfico deve conter dados dos últimos 5 períodos

  Scenario: Filtrar gráfico por períodos específicos
    Given que estou visualizando o gráfico de desempenho de "Engenharia de Software (ESS)"
    When eu seleciono os filtros de período: "2023.1", "2023.2"
    Then o gráfico deve exibir apenas dados referentes a "2023.1" e "2023.2"

  Scenario: Tentar visualizar análise sem dados (Fluxo de Exceção)
    When eu clico no botão "Análise"
    And seleciono a disciplina "Matemática Discreta"
    And seleciono a opção de análise"Análise de Desempenho"
    Then devo ver a mensagem "Nenhum dado encontrado para esta disciplina"

  Scenario Outline: Verificar representação visual das situações dos alunos
    Given que estou visualizando o gráfico de desempenho de "Engenharia de Software (ESS)"
    When passo o mouse sobre uma linha de turma com média de alunos "<situacao>"
    Then a "linha" correspondente deve ser da cor "<cor>"
    
    Examples:
      | situacao | cor      |
      | APV. N   | VERDE    |
      | APV. M   | AMARELO  |
      | REP. N   | LARANJA  |
      | REP. M   | VERMELHO |
      | REP. F   | ROXO     |

  Scenario: Filtrar dados por múltiplos períodos
    Given a disciplina "Engenharia de Software" tem dados históricos cadastrados
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software"
    And eu filtro os dados pelos períodos "2023.1, 2023.2"
    Then os dados devem conter apenas turmas dos períodos "2023.1, 2023.2"

  Scenario: Verificar ordenação cronológica dos dados
    Given a disciplina "Engenharia de Software" tem dados históricos cadastrados
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software"
    Then o servidor deve retornar status 200
    And os dados devem estar ordenados cronologicamente

//rever esse cenário
  Scenario: Verificar cálculo correto de estatísticas
    Given a disciplina "Engenharia de Software" tem dados históricos cadastrados com:
      | aluno           | mediaPreFinal | mediaPosFinal | reprovadoPorFalta |
      | Aluno Aprovado  | 8.5           | 0             | false             |
      | Aluno Final     | 5.0           | 6.0           | false             |
      | Aluno Reprovado | 2.5           | 0             | false             |
      | Aluno Faltoso   | 7.0           | 0             | true              |
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software"
    Then o servidor deve retornar status 200
    And os dados de enrollment devem refletir corretamente as médias cadastradas
