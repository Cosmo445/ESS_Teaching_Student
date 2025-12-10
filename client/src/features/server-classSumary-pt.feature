@server-sumary
Feature: Análise Gráfica de Desempenho - Backend API
  As a sistema
  I want to fornecer dados de analytics através da API
  So that a interface possa exibir gráficos de desempenho

  Background:
    Given the server API is available for analytics
    And a disciplina "Engenharia de Software e Sistemas" tem turmas cadastradas

  Scenario: Validar que enrollments contêm dados de média
    Given the server API is available for analytics
    When eu solicito os dados de analytics para a disciplina "Engenharia de Software e Sistemas"
    Then o servidor deve retornar turmas com enrollments
    And cada enrollment deve ter os campos de média:
      | campo             | tipo    |
      | mediaPreFinal     | number  |
      | mediaPosFinal     | number  |
      | reprovadoPorFalta | boolean |
