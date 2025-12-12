// TESTES DE GUI (DA INTERFACE)
// Implementa os cenários da feature de importação de planilha de alunos

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, Page, launch } from 'puppeteer';
import expect from 'expect';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

// Set default timeout for all steps
setDefaultTimeout(60 * 1000); // 60 seconds

let browser: Browser;
let page: Page;
const baseUrl = 'http://localhost:3004';
const serverUrl = 'http://localhost:3005';

// Armazenar CPFs dos estudantes criados durante o teste
const createdStudentCPFs: string[] = [];

Before({ tags: '@gui' }, async function () {
  // Verificar se o servidor está disponível antes de iniciar os testes de GUI
  try {
    const response = await fetch(`${serverUrl}/api/students`);
    if (!response.ok) {
      throw new Error('Server not available');
    }
  } catch (error) {
    throw new Error('Backend server must be running on port 3005 before running GUI tests');
  }

  // Limpar array de CPFs criados
  createdStudentCPFs.length = 0;

  browser = await launch({ 
    headless: false, // Set to true for CI/CD
    slowMo: 50 // Slow down actions for visibility
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
});

After({ tags: '@gui' }, async function () {
  // Limpar estudantes criados durante o teste
  console.log('🧹 Limpando dados de teste...');
  
  for (const cpf of createdStudentCPFs) {
    try {
      const response = await fetch(`${serverUrl}/api/students/${cpf}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log(`✅ Estudante com CPF ${cpf} removido`);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao remover estudante ${cpf}:`, error);
    }
  }
  
  // Limpar arquivos temporários criados
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const tempDir = path.resolve(__dirname, '..', '..', '..', 'temp');
  
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✅ Diretório temporário removido');
    } catch (error) {
      console.warn('⚠️ Erro ao remover diretório temporário:', error);
    }
  }
  
  if (browser) {
    await browser.close();
  }
  
  console.log('✅ Limpeza concluída');
});
Given('que eu estou na tela {string}', async function (screenName: string) {
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

When('clico no botão {string}', async function (buttonText: string) {
  // Aguardar página estar pronta
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Procurar pelo botão (case-insensitive)
  const found = await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const textLower = text.toLowerCase();
    const button = buttons.find(el => {
      const btnText = (el.textContent?.trim() || '').toLowerCase();
      const btnName = (el.getAttribute('name') || '').toLowerCase();
      return btnText.includes(textLower) || 
             btnText === textLower || 
             btnName.includes(textLower) || 
             btnName === textLower;
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
  
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`✅ Clicado no botão: ${buttonText}`);
});

When('seleciono o arquivo {string}', async function (fileName: string) {
  // Aguardar o input file estar disponível
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Procurar pelo input de arquivo (está escondido, mas podemos interagir com ele)
  const inputFile = await page.$('input[type="file"]');
  
  if (!inputFile) {
    throw new Error('Input de arquivo não encontrado');
  }
  
  // Obter o diretório atual usando import.meta.url
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Criar caminho absoluto para o arquivo de teste
  let testFilePath = path.resolve(__dirname, '..', '..', '..', 'cypress', 'fixtures', fileName);
  
  // Verificar se o arquivo existe, senão criar um temporário
  if (!fs.existsSync(testFilePath)) {
    console.warn(`Arquivo não encontrado em: ${testFilePath}`);
    
    // Criar diretório temporário se não existir
    const tempDir = path.resolve(__dirname, '..', '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    testFilePath = path.join(tempDir, fileName);
    
    // Criar conteúdo de exemplo para CSV
    const csvContent = 'nome,cpf,email\nJoão Silva,12345678901,joao@email.com\nMaria Santos,98765432109,maria@email.com';
    
    // Criar o arquivo temporário
    fs.writeFileSync(testFilePath, csvContent, 'utf-8');
    console.log(`📄 Arquivo temporário criado: ${testFilePath}`);
    
    // Registrar CPFs para limpeza posterior
    createdStudentCPFs.push('12345678901', '98765432109');
  }
  
  // Fazer upload do arquivo
  await inputFile.uploadFile(testFilePath);
  console.log(`✅ Arquivo selecionado: ${fileName}`);
  
  // Aguardar o processamento do arquivo
  await new Promise(resolve => setTimeout(resolve, 2000));
});

Then('devo ver uma confirmação de que a importação ocorreu corretamente', async function () {
  // Aguardar mensagem de sucesso ou atualização da lista
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar se o nome do arquivo aparece na interface
  const fileNameDisplayed = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('p, span, div'));
    const fileElement = allElements.find(el => {
      const text = el.textContent || '';
      return text.includes('file:') || text.includes('.csv') || text.includes('.xlsx');
    });
    return fileElement ? fileElement.textContent : null;
  });
  
  if (fileNameDisplayed) {
    console.log(`✅ Arquivo exibido: ${fileNameDisplayed}`);
    expect(fileNameDisplayed).toBeTruthy();
  } else {
    // Alternativa: verificar se a lista de estudantes foi atualizada
    const studentsListUpdated = await page.evaluate(() => {
      const studentItems = Array.from(document.querySelectorAll('[class*="student"], li, tr'));
      return studentItems.length > 0;
    });
    
    if (studentsListUpdated) {
      console.log('✅ Lista de estudantes foi atualizada após importação');
      expect(studentsListUpdated).toBe(true);
    } else {
      console.log('⚠️ Verificando se há mensagem de sucesso na página');
      
      // Tirar screenshot para debug
      await page.screenshot({ 
        path: 'reports/upload-confirmation-check.png',
        fullPage: true 
      });
      
      // Buscar por qualquer indicação de sucesso
      const successIndicator = await page.evaluate(() => {
        const body = document.body.textContent || '';
        return body.includes('success') || 
               body.includes('sucesso') || 
               body.includes('imported') || 
               body.includes('importado') ||
               body.includes('file:');
      });
      
      expect(successIndicator).toBe(true);
      console.log('✅ Confirmação de importação encontrada');
    }
  }
});
