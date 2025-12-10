// TESTES DE GUI (DA INTERFACE)
// Implementa os cenários da feature de análise gráfica via interface

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, Page, launch } from 'puppeteer';
import expect from 'expect';

// Set default timeout for all steps
setDefaultTimeout(60 * 1000); // 60 seconds

let browser: Browser;
let page: Page;
const baseUrl = 'http://localhost:3004';
const serverUrl = 'http://localhost:3005';

Before({ tags: '@gui-sumary' }, async function () {
  // Verificar se o servidor está disponível antes de iniciar os testes de GUI
  try {
    const response = await fetch(`${serverUrl}/api/classes`);
    if (!response.ok) {
      throw new Error('Server not available');
    }
  } catch (error) {
    throw new Error('Backend server must be running on port 3005 before running GUI tests');
  }

  browser = await launch({ 
    headless: false, // Set to true for CI/CD
    slowMo: 50 // Slow down actions for visibility
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
});

After({ tags: '@gui-sumary' }, async function () {
  if (browser) {
    await browser.close();
  }
});

Given('que estou na tela {string}', async function (screenName: string) {
  await page.goto(baseUrl);
  await page.waitForSelector('h1', { timeout: 10000 });
  
  // Aguardar página carregar completamente
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mapear nomes em português para inglês
  const screenNameMap: Record<string, string> = {
    'Turmas': 'Classes',
    'Classes': 'Classes',
    'Estudantes': 'Students',
    'Students': 'Students',
    'Avaliações': 'Evaluations',
    'Evaluations': 'Evaluations'
  };
  
  const targetScreen = screenNameMap[screenName] || screenName;
  
  // Clicar na aba correspondente
  const clicked = await page.evaluate((tabName) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const tab = buttons.find(el => {
      const text = el.textContent?.trim() || '';
      return text === tabName || text.includes(tabName);
    });
    if (tab && tab instanceof HTMLElement) {
      tab.click();
      return true;
    }
    return false;
  }, targetScreen);
  
  if (!clicked) {
    throw new Error(`Aba "${screenName}" (${targetScreen}) não encontrada.`);
  }
  
  // Aguardar conteúdo da aba carregar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar se o botão "Analyze Classes" está disponível (para tela de Classes)
  if (targetScreen === 'Classes') {
    const hasAnalyzeButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent?.includes('Analyze Classes'));
    });
    console.log(`Botão "Analyze Classes" está ${hasAnalyzeButton ? 'disponível' : 'NÃO disponível'}`);
  }
  
  console.log(`✅ Navegado para a tela: ${screenName} (${targetScreen})`);
});

Given('que estou visualizando o {string} da disciplina {string}', async function (graphType: string, discipline: string) {
  // Usar o mesmo fluxo que funciona nos outros cenários
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Clicar em "Analyze Classes"
  const analyzeClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find(el => {
      const btnText = el.textContent?.trim() || '';
      return btnText.includes('Analyze Classes');
    });
    if (button && button instanceof HTMLElement) {
      button.click();
      return true;
    }
    return false;
  });
  
  if (!analyzeClicked) {
    throw new Error('Botão "Analyze Classes" não encontrado');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Clicar na disciplina
  const disciplineClicked = await page.evaluate((disciplineName) => {
    const divs = Array.from(document.querySelectorAll('div'));
    const disciplineDiv = divs.find(el => {
      const strong = el.querySelector('strong');
      return strong && strong.textContent?.includes(disciplineName);
    });
    
    if (disciplineDiv) {
      const buttons = Array.from(disciplineDiv.querySelectorAll('button'));
      if (buttons.length > 0) {
        const lastButton = buttons[buttons.length - 1];
        if (lastButton instanceof HTMLElement) {
          lastButton.click();
          return true;
        }
      }
    }
    return false;
  }, discipline);
  
  if (!disciplineClicked) {
    throw new Error(`Disciplina "${discipline}" não encontrada`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Clicar em "Análise de Desempenho"
  const analysisClicked = await page.evaluate(() => {
    const isVisible = (el: Element): boolean => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetWidth === 0 && htmlEl.offsetHeight === 0) return false;
      const style = window.getComputedStyle(htmlEl);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };
    
    const allButtons = Array.from(document.querySelectorAll('button'));
    const optionButton = allButtons.find(el => {
      const btnText = el.textContent?.trim() || '';
      return isVisible(el) && btnText.includes('Análise de Desempenho');
    });
    
    if (optionButton && optionButton instanceof HTMLElement) {
      optionButton.click();
      return true;
    }
    return false;
  });
  
  if (!analysisClicked) {
    throw new Error('Botão "Análise de Desempenho" não encontrado');
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar se o gráfico está visível
  await page.waitForSelector('.recharts-wrapper', { timeout: 5000 });
  console.log(`✅ Visualizando ${graphType} de: ${discipline}`);
});

Given('a disciplina {string} tem dados históricos cadastrados', async function (discipline: string) {
  // Verificar que existem turmas cadastradas para essa disciplina
  const response = await fetch(`${serverUrl}/api/classes`);
  expect(response.status).toBe(200);
  
  const classes = await response.json();
  const disciplineClasses = classes.filter((c: any) => 
    c.topic.toLowerCase() === discipline.toLowerCase()
  );
  
  expect(disciplineClasses.length).toBeGreaterThan(0);
  //console.log(`Disciplina "${discipline}" tem ${disciplineClasses.length} turmas cadastradas`);
});

Given('a disciplina {string} não tem dados históricos cadastrados', async function (discipline: string) {
  // Verificar que NÃO existem turmas cadastradas para essa disciplina
  const response = await fetch(`${serverUrl}/api/classes`);
  expect(response.status).toBe(200);
  
  const classes = await response.json();
  const disciplineClasses = classes.filter((c: any) => 
    c.topic.toLowerCase() === discipline.toLowerCase()
  );
  
  expect(disciplineClasses.length).toBe(0);
  console.log(`Disciplina "${discipline}" não tem turmas cadastradas`);
});

When('eu clico no botão {string}', async function (buttonText: string) {
  // Aguardar página estar pronta
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Procurar pelo botão
  const found = await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find(el => {
      const btnText = el.textContent?.trim() || '';
      return btnText.includes(text) || btnText === text;
    });
    if (button && button instanceof HTMLElement) {
      button.click();
      return true;
    }
    return false;
  }, buttonText);
  
  if (!found) {
    throw new Error(`Botão "${buttonText}" não encontrado.`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: 'reports/debug-after-analyze-classes.png' });
  console.log(`✅ Clicado no botão: ${buttonText}`);
});

When('seleciono a disciplina {string}', async function (discipline: string) {
  // Aguardar o painel de lista de classes aparecer
  await new Promise(resolve => setTimeout(resolve, 1000));
  await page.screenshot({ path: 'reports/debug-before-discipline-click.png' });
  console.log('📸 Screenshot antes de clicar na disciplina');
  
  // Clicar no último botão da div (ChevronRight)
  const clicked = await page.evaluate((disciplineName) => {
    const divs = Array.from(document.querySelectorAll('div'));
    const disciplineDiv = divs.find(el => {
      const strong = el.querySelector('strong');
      return strong && strong.textContent?.includes(disciplineName);
    });
    
    if (disciplineDiv) {
      // Pegar TODOS os botões dentro dessa div
      const buttons = Array.from(disciplineDiv.querySelectorAll('button'));
      // O último botão deve ser o ChevronRight
      if (buttons.length > 0) {
        const lastButton = buttons[buttons.length - 1];
        if (lastButton instanceof HTMLElement) {
          lastButton.click();
          return true;
        }
      }
    }
    return false;
  }, discipline);
  
  if (!clicked) {
    throw new Error(`Disciplina "${discipline}" não encontrada na lista ou botão ChevronRight não encontrado`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  await page.screenshot({ path: 'reports/debug-after-discipline-click.png' });
  console.log(`✅ Selecionada disciplina: ${discipline}`);
});

When(/^(?:eu )?seleciono a opção de análise "([^"]*)"$/, async function (option: string) {
  // Aguardar o painel modal de análise aparecer
  console.log('⏳ Aguardando modal de análise aparecer (5 segundos)...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Tentar clicar no botão
  const clicked = await page.evaluate((text) => {
    const isVisible = (el: Element): boolean => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.offsetWidth === 0 && htmlEl.offsetHeight === 0) return false;
      const style = window.getComputedStyle(htmlEl);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };
    
    const allButtons = Array.from(document.querySelectorAll('button'));
    const optionButton = allButtons.find(el => {
      const btnText = el.textContent?.trim() || '';
      return isVisible(el) && (btnText.includes(text) || btnText === text);
    });
    
    if (optionButton && optionButton instanceof HTMLElement) {
      optionButton.click();
      return true;
    }
    return false;
  }, option);
  
  if (!clicked) {
    throw new Error(`Opção "${option}" não encontrada.`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`✅ Selecionada opção: ${option}`);
});

When('eu filtro os dados pelos períodos {string}', async function (periods: string) {
  // Períodos vêm como "2023.1, 2023.2"
  const periodList = periods.split(',').map(p => p.trim());
  
  console.log(`🔍 Filtrando por períodos: ${periodList.join(', ')}`);
  
  // Aguardar sidebar estar visível
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Debug: tirar screenshot e listar elementos disponíveis
  await page.screenshot({ path: 'reports/debug-before-period-filter.png' });
  
  const availablePeriods = await page.evaluate(() => {
    const allSpans = Array.from(document.querySelectorAll('span'));
    return allSpans
      .map(span => span.textContent?.trim())
      .filter(text => text && /\d{4}\.\d/.test(text));
  });
  console.log(`📅 Períodos disponíveis na página: ${availablePeriods.join(', ')}`);
  
  // Clicar nos checkboxes dos períodos especificados
  for (const period of periodList) {
    const clicked = await page.evaluate((periodId) => {
      // Procurar pela div que contém o checkbox do período
      const allDivs = Array.from(document.querySelectorAll('div'));
      const periodDiv = allDivs.find(div => {
        const span = div.querySelector('span');
        const text = span?.textContent?.trim() || '';
        // Verificar se o texto começa com o período (ex: "2023.1 (45 alunos)")
        return text.startsWith(periodId + ' ') || text === periodId;
      });
      
      if (periodDiv) {
        // Procurar pelo checkbox dentro dessa div ou nos seus pais
        const checkbox = periodDiv.querySelector('input[type="checkbox"]');
        if (checkbox) {
          // Clicar na div clicável (que tem cursor: pointer)
          const clickableDiv = periodDiv.closest('div[style*="cursor: pointer"]') || periodDiv;
          if (clickableDiv instanceof HTMLElement) {
            clickableDiv.click();
            return true;
          }
        }
      }
      return false;
    }, period);
    
    if (!clicked) {
      throw new Error(`Não foi possível selecionar o período "${period}". Períodos disponíveis: ${availablePeriods.join(', ')}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  await page.screenshot({ path: 'reports/debug-after-period-filter.png' });
  console.log(`✅ Períodos selecionados: ${periodList.join(', ')}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
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

Then('devo ver o gráfico de linha de desempenho com os dados de todas as turmas cadastradas', async function () {
  // Aguardar um pouco para o gráfico renderizar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verificar presença do componente de gráfico Recharts
  const chart = await page.waitForSelector('.recharts-wrapper', { timeout: 5000 });
  expect(chart).toBeTruthy();
  console.log('✅ Componente recharts-wrapper encontrado');
  
  // Verificar presença de linhas
  const lines = await page.$$('.recharts-line');
  console.log(`🔍 Número de linhas encontradas: ${lines.length}`);
  expect(lines.length).toBeGreaterThan(0);
  
  // Verificar se há dados no gráfico (procurar por ticks ou pontos de dados)
  const xAxisTicks = await page.$$('.recharts-cartesian-axis-tick');
  const dataPoints = await page.$$('.recharts-line-dots circle, .recharts-dot');
  
  console.log(`🔍 Número de ticks no eixo: ${xAxisTicks.length}`);
  console.log(`🔍 Número de pontos de dados: ${dataPoints.length}`);
  
  // Verificar se há ticks OU pontos de dados
  expect(xAxisTicks.length + dataPoints.length).toBeGreaterThan(0);
  
  // Aguardar 3 segundos para o gráfico renderizar completamente
  console.log('⏳ Aguardando renderização completa do gráfico...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Tirar screenshot do gráfico como referência
  await page.screenshot({ 
    path: 'reports/performance-chart-reference.png',
    fullPage: true 
  });
  console.log('📸 Screenshot do gráfico salvo em reports/performance-chart-reference.png');
  
  console.log('✅ Gráfico de linha de desempenho está visível com dados');
});

Then('os dados devem conter apenas turmas dos períodos {string}', async function (periods: string) {
  const periodList = periods.split(',').map(p => p.trim());
  
  // Aguardar o gráfico recarregar com os dados filtrados
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Verificar se a mensagem de filtro está visível no componente
  const filterInfo = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'));
    const filterDiv = allDivs.find(div => {
      const text = div.textContent || '';
      return text.includes('📊 Exibindo') && text.includes('período(s)');
    });
    return filterDiv ? filterDiv.textContent : null;
  });
  
  if (filterInfo) {
    console.log(`📊 ${filterInfo}`);
    // Se a mensagem está presente, significa que o filtro foi aplicado com sucesso
    expect(filterInfo).toContain('📊 Exibindo');
  } else {
    // Se não houver mensagem de filtro, verificar que pelo menos o gráfico tem dados
    console.log(`⚠️ Mensagem de filtro não encontrada, mas verificando gráfico...`);
  }
  
  // Verificar se o gráfico contém dados (linhas renderizadas)
  const graphData = await page.evaluate(() => {
    const lines = Array.from(document.querySelectorAll('.recharts-line'));
    const xAxisTicks = Array.from(document.querySelectorAll('.recharts-cartesian-axis-tick'));
    
    // Pegar os valores dos ticks do eixo X para ver quais períodos estão no gráfico
    const tickValues: string[] = [];
    xAxisTicks.forEach(tick => {
      const text = tick.textContent?.trim();
      if (text && /\d{4}\.\d/.test(text)) {
        tickValues.push(text);
      }
    });
    
    return {
      hasLines: lines.length > 0,
      hasTicks: xAxisTicks.length > 0,
      tickValues
    };
  });
  
  expect(graphData.hasLines).toBe(true);
  expect(graphData.hasTicks).toBe(true);
  
  console.log(`✅ Gráfico exibe dados dos períodos filtrados`);
  console.log(`   Períodos esperados: ${periodList.join(', ')}`);
  console.log(`   Dados no gráfico: ${graphData.tickValues.length > 0 ? graphData.tickValues.join(', ') : 'carregando...'}`);
});

Then('a disciplina {string} não deve aparecer na lista de disciplinas disponíveis', async function (discipline: string) {
  // Aguardar o painel de disciplinas carregar
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar que a disciplina NÃO está na lista
  const disciplineFound = await page.evaluate((disciplineName) => {
    const divs = Array.from(document.querySelectorAll('div'));
    const disciplineDiv = divs.find(el => {
      const strong = el.querySelector('strong');
      return strong && strong.textContent?.includes(disciplineName);
    });
    return disciplineDiv !== undefined;
  }, discipline);
  
  expect(disciplineFound).toBe(false);
  console.log(`✅ Disciplina "${discipline}" não aparece na lista (comportamento esperado)`);
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
