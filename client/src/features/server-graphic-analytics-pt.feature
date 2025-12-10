@server-analytics
Feature: Análise Gráfica de Desempenho - Backend API
  As a sistema
  I want to fornecer dados de analytics através da API
  So that a interface possa exibir gráficos de desempenho

  Background:
    Given the server API is available for analytics

  Scenario: Validar que enrollments contêm dados de média
    Given the server API is available for analytics
    And a disciplina "Engenharia de Software" tem dados históricos cadastrados
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software"
    Then o servidor deve retornar status 200
    And pelo menos uma turma deve ter enrollments
    And cada enrollment deve ter os campos de média:
      | campo             |
      | mediaPreFinal     |
      | mediaPosFinal     |
      | reprovadoPorFalta |

  Scenario: Validar estrutura de dados de enrollments
    Given a disciplina "Engenharia de Software" tem dados históricos cadastrados
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software"
    Then o servidor deve retornar status 200
    And cada enrollment deve conter os campos:
      | campo              | tipo    |
      | student            | object  |
      | mediaPreFinal      | number  |
      | mediaPosFinal      | number  |
      | reprovadoPorFalta  | boolean |
