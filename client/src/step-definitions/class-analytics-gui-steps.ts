// TESTES DE GUI (DA INTERFACE)
// Implementa os cenários da feature de análise gráfica via interface
// caminho real: client/src/step-definitions/class-analytics-gui-steps.ts

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, Page, launch } from 'puppeteer';
import expect from 'expect';

// Set default timeout for all steps
setDefaultTimeout(30 * 1000); // 30 seconds

let browser: Browser;
let page: Page;
const baseUrl = 'http://localhost:3004';
const serverUrl = 'http://localhost:3005';

Before({ tags: '@gui-analytics' }, async function () {
  browser = await launch({ 
    headless: false, // Set to true for CI/CD
    slowMo: 50 // Slow down actions for visibility
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
});

After({ tags: '@gui-analytics' }, async function () {
  if (browser) {
    await browser.close();
  }
});

Given('que estou na tela {string}', async function (screenName: string) {
  await page.goto(baseUrl);
  await page.waitForSelector('h1', { timeout: 10000 });
  
  if (screenName === 'Turmas') {
    // Navegar para a aba de turmas se necessário
    const classesTab = await page.$('button:has-text("Turmas"), a:has-text("Turmas"), [data-testid="classes-tab"]');
    if (classesTab) {
      await classesTab.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`Navegado para a tela: ${screenName}`);
});

Given('que estou visualizando o gráfico de desempenho de {string}', async function (discipline: string) {
  // Navegar para a visualização do gráfico
  await page.goto(baseUrl);
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Sequência de cliques para chegar ao gráfico (ajustar conforme UI real)
  const analysisButton = await page.$('button:has-text("Análise"), [data-testid="analysis-button"]');
  if (analysisButton) {
    await analysisButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const disciplineSelect = await page.$('select[name="discipline"], [data-testid="discipline-select"]');
  if (disciplineSelect) {
    await page.select('select[name="discipline"]', discipline);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Verificar se o gráfico está visível
  await page.waitForSelector('.recharts-wrapper, svg.recharts-surface', { timeout: 5000 });
  console.log(`Visualizando gráfico de desempenho de: ${discipline}`);
});

When('eu clico no botão {string}', async function (buttonText: string) {
  // Procurar pelo botão de Análise
  const button = await page.waitForSelector(
    `button:has-text("${buttonText}"), [data-testid="${buttonText.toLowerCase()}-button"]`,
    { timeout: 5000 }
  );
  
  if (!button) {
    throw new Error(`Botão "${buttonText}" não encontrado`);
  }
  
  await button.click();
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Clicado no botão: ${buttonText}`);
});

When('seleciono a disciplina {string}', async function (discipline: string) {
  // Procurar por select ou dropdown de disciplina
  const selector = await page.waitForSelector(
    'select[name="discipline"], select[id="discipline-select"], [data-testid="discipline-select"]',
    { timeout: 5000 }
  );
  
  if (selector) {
    await selector.select(discipline);
  } else {
    // Alternativa: clicar em opção de lista
    const option = await page.waitForSelector(`[data-discipline="${discipline}"]`);
    if (option) {
      await option.click();
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Selecionada disciplina: ${discipline}`);
});

//nao entendi esse aqui ainda
When('seleciono a opção de análise {string}', async function (option: string) {
  const optionElement = await page.waitForSelector(
    `button:has-text("${option}"), [data-testid="${option.toLowerCase().replace(/\s+/g, '-')}"]`,
    { timeout: 5000 }
  );
  
  if (optionElement) {
    await optionElement.click();
  }
  await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar carregamento do gráfico
  console.log(`Selecionada opção: ${option}`);
});

When('eu seleciono os filtros de período: {string}', async function (periods: string) {
  // Períodos vêm como "2023.1", "2023.2"
  const periodList = periods.split(',').map(p => p.trim().replace(/"/g, ''));
  
  for (const period of periodList) {
    const checkbox = await page.$(`input[type="checkbox"][value="${period}"], [data-testid="period-${period}"]`);
    if (checkbox) {
      await checkbox.click();
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`Filtros de período selecionados: ${periodList.join(', ')}`);
});

When('passo o mouse sobre uma linha de turma com média de alunos {string}', async function (situation: string) {
  // Mapear situação para o data-key da linha no gráfico
  const situationMap: Record<string, string> = {
    'APV. N': 'APV. N',
    'APV. M': 'APV. M',
    'REP. N': 'REP. N',
    'REP. M': 'REP. M',
    'REP. F': 'REP. F'
  };
  
  const lineKey = situationMap[situation];
  
  // Procurar pela linha no gráfico Recharts
  const line = await page.$(`.recharts-line[name="${lineKey}"] path, .recharts-line path[name="${lineKey}"]`);
  
  if (line) {
    await line.hover();
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mouse sobre linha: ${situation}`);
  }
});

Then('devo ver o gráfico de linha de desempenho', async function () {
  // Verificar presença do componente de gráfico Recharts
  const chart = await page.waitForSelector('.recharts-wrapper', { timeout: 5000 });
  expect(chart).toBeTruthy();
  
  // Verificar presença de linhas
  const lines = await page.$$('.recharts-line');
  expect(lines.length).toBeGreaterThan(0);
  
  console.log('Gráfico de linha de desempenho está visível');
});

Then('o gráfico deve conter dados dos últimos períodos', async function () {
  // Verificar se há pontos de dados no gráfico
  const dataPoints = await page.$$('.recharts-line-dot, .recharts-area-dot');
  expect(dataPoints.length).toBeGreaterThan(0);
  
  // Verificar eixo X com períodos
  const xAxisLabels = await page.$$('.recharts-xAxis .recharts-cartesian-axis-tick-value');
  expect(xAxisLabels.length).toBeGreaterThan(0);
  
  console.log('Gráfico contém dados dos últimos períodos');
});

Then('o gráfico deve exibir apenas dados referentes a {string} e {string}', async function (period1: string, period2: string) {
  // Verificar labels no eixo X
  const xAxisLabels = await page.$$eval('.recharts-xAxis .recharts-cartesian-axis-tick-value', 
    elements => elements.map(el => el.textContent)
  );
  
  const periodList = [period1, period2];
  
  xAxisLabels.forEach((label: string | null) => {
    if (label) {
      expect(periodList).toContain(label.trim());
    }
  });
  
  console.log(`Gráfico exibe apenas períodos: ${period1} e ${period2}`);
});

Then('devo ver a mensagem {string}', async function (expectedMessage: string) {
  const messageElement = await page.waitForSelector(
    `text="${expectedMessage}", *:has-text("${expectedMessage}")`,
    { timeout: 5000 }
  );
  
  const text = await page.evaluate(el => el?.textContent || '', messageElement);
  expect(text).toContain(expectedMessage);
  
  console.log(`Mensagem exibida: ${expectedMessage}`);
});

Then('a {string} correspondente deve ser da cor {string}', async function (element: string, colorName: string) {
  // Mapeia o nome da cor para os códigos usados no componente ClassSumary
  const colorMap: Record<string, string[]> = {
    'VERDE': ['#22c55e', 'rgb(34, 197, 94)'],      // APV. M
    'AMARELO': ['#eab308', 'rgb(234, 179, 8)'],    // APV. N
    'LARANJA': ['#f97316', 'rgb(249, 115, 22)'],   // REP. N
    'VERMELHO': ['#ef4444', 'rgb(239, 68, 68)'],   // REP. M
    'ROXO': ['#a855f7', 'rgb(168, 85, 247)']       // REP. F
  };
  
  const expectedColors = colorMap[colorName];
  
  if (!expectedColors) {
    throw new Error(`Cor "${colorName}" não mapeada`);
  }
  
  // Procurar pela linha ativa (hovering)
  const activeLine = await page.$('.recharts-line.recharts-line-active path, .recharts-active-dot');
  
  if (activeLine) {
    const strokeColor = await page.evaluate(el => {
      return window.getComputedStyle(el).stroke || window.getComputedStyle(el).fill;
    }, activeLine);
    
    // Verificar se a cor está na lista de cores esperadas
    const colorMatches = expectedColors.some(expectedColor => {
      const normalizedStroke = strokeColor.replace(/\s+/g, '').toLowerCase();
      const normalizedExpected = expectedColor.replace(/\s+/g, '').toLowerCase();
      return normalizedStroke.includes(normalizedExpected.replace('#', ''));
    });
    
    expect(colorMatches).toBeTruthy();
    console.log(`${element} está na cor ${colorName} (${strokeColor})`);
  }
});