// TESTE DE ACEITAÇÃO DE SERVIÇO (API + BDD)
// Implementa os cenários da feature de análise gráfica via API
// caminho real: client/src/step-definitions/class-analytics-server-steps.ts

import { Given, When, Then, After, setDefaultTimeout } from '@cucumber/cucumber';
import expect from 'expect';

// Set default timeout for all steps
setDefaultTimeout(30 * 1000); // 30 seconds

const serverUrl = 'http://localhost:3005';

let lastResponse: Response;
let disciplineData: any;

After({ tags: '@server-analytics' }, async function () {
  // Cleanup se necessário
  /*é para fazer o cleanup do que foi feito no server*/
  console.log('Server analytics test cleanup completed');
});

//ver se isso eh necessario aqui pois já tem um desse tipo em server-student-steps.ts
Given('the server API is available for analytics', async function () {
  try {
    const response = await fetch(`${serverUrl}/api/classes`);
    expect(response.status).toBe(200);
    console.log('Server API is available for analytics');
  } catch (error) {
    throw new Error('Server is not available. Make sure the backend server is running on port 3005');
  }
});

//ver se eh melhor ter os próximos três Given separados ou teria como ter eles juntos
Given('a disciplina {string} tem dados históricos cadastrados', async function (discipline: string) {
  // Verificar que existem turmas cadastradas para essa disciplina
  const response = await fetch(`${serverUrl}/api/classes`);
  expect(response.status).toBe(200);
  
  const classes = await response.json();
  const disciplineClasses = classes.filter((c: any) => 
    c.topic.toLowerCase() === discipline.toLowerCase()
  );
  
  expect(disciplineClasses.length).toBeGreaterThan(0);
  console.log(`Disciplina "${discipline}" tem ${disciplineClasses.length} turmas cadastradas`);
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

Given('a disciplina {string} tem dados históricos cadastrados com:', async function (discipline: string, dataTable: any) {
  // Este step assume que os dados já foram previamente cadastrados no sistema
  // ou que serão cadastrados via setup de testes
  const students = dataTable.hashes();
  console.log(`Disciplina "${discipline}" deve ter dados cadastrados para ${students.length} alunos`);
  
  // Verificar que os dados existem
  const response = await fetch(`${serverUrl}/api/classes`);
  expect(response.status).toBe(200);
  
  const classes = await response.json();
  const disciplineClasses = classes.filter((c: any) => 
    c.topic.toLowerCase() === discipline.toLowerCase()
  );
  
  expect(disciplineClasses.length).toBeGreaterThan(0);
  console.log(`Encontradas ${disciplineClasses.length} turmas para "${discipline}"`);
});

When('eu solicito os dados de analytics para a disciplina {string}', async function (discipline: string) {
  try {
    lastResponse = await fetch(`${serverUrl}/api/classes?discipline=${encodeURIComponent(discipline)}`);
    disciplineData = await lastResponse.json();
    console.log(`Recebidos ${Array.isArray(disciplineData) ? disciplineData.length : 0} registros para "${discipline}"`);
  } catch (error) {
    throw new Error(`Failed to fetch analytics data: ${error}`);
  }
});

When('eu filtro os dados pelos períodos {string}', async function (periods: string) {
  // Simula filtro client-side (períodos como "2023.1, 2023.2")
  const periodList = periods.split(',').map(p => p.trim());
  
  if (Array.isArray(disciplineData)) {
    disciplineData = disciplineData.filter((classObj: any) => {
      const classPeriod = `${classObj.year}.${classObj.semester}`;
      return periodList.includes(classPeriod);
    });
  }
  
  console.log(`Dados filtrados para períodos ${periodList.join(', ')}: ${disciplineData.length} registros`);
});

// ok
Then('os dados devem conter apenas turmas dos períodos {string}', function (periods: string) {
  const periodList = periods.split(',').map(p => p.trim());
  
  disciplineData.forEach((classObj: any) => {
    const classPeriod = `${classObj.year}.${classObj.semester}`;
    expect(periodList).toContain(classPeriod);
  });
  
  console.log(`Validado: todos os ${disciplineData.length} registros pertencem aos períodos especificados`);
});

// ok preciso disso
Then('cada enrollment deve conter os campos:', function (dataTable: any) {
  expect(Array.isArray(disciplineData)).toBe(true);
  expect(disciplineData.length).toBeGreaterThan(0);
  
  const expectedFields = dataTable.hashes();
  
  disciplineData.forEach((classObj: any) => {
    if (classObj.enrollments && classObj.enrollments.length > 0) {
      classObj.enrollments.forEach((enrollment: any) => {
        expectedFields.forEach((field: any) => {
          const fieldName = field.campo;
          const fieldType = field.tipo;
          
          expect(enrollment[fieldName]).toBeDefined();
          
          if (fieldType === 'number') {
            expect(typeof enrollment[fieldName]).toBe('number');
          } else if (fieldType === 'boolean') {
            expect(typeof enrollment[fieldName]).toBe('boolean');
          } else if (fieldType === 'object') {
            expect(typeof enrollment[fieldName]).toBe('object');
            expect(enrollment[fieldName]).not.toBeNull();
          }
        });
      });
    }
  });
  
  console.log('Validado: todos os enrollments contêm os campos esperados com tipos corretos');
});

// acho que isso não é algo que deveria ter nos cenários
Then('o servidor deve retornar status {int}', async function (expectedStatus: number) {
  expect(lastResponse.status).toBe(expectedStatus);
});

// acho que eu não preciso disso aqui
Then('os dados devem conter informações de {int} período\\(s)', function (expectedCount: number) {
  expect(Array.isArray(disciplineData)).toBe(true);
  expect(disciplineData.length).toBe(expectedCount);
});

// acho que eu não preciso disso aqui
Then('os dados devem estar ordenados cronologicamente', function () {
  expect(Array.isArray(disciplineData)).toBe(true);
  
  for (let i = 1; i < disciplineData.length; i++) {
    const prev = disciplineData[i - 1];
    const curr = disciplineData[i];
    
    // Verificar ordenação por ano, depois por semestre
    if (prev.year === curr.year) {
      expect(prev.semester).toBeLessThanOrEqual(curr.semester);
    } else {
      expect(prev.year).toBeLessThan(curr.year);
    }
  }
  
  console.log('Dados estão ordenados cronologicamente');
});

// parece redundante com o segundo Then
Then('os dados devem incluir informações de enrollments com mediaPreFinal e mediaPosFinal', function () {
  expect(Array.isArray(disciplineData)).toBe(true);
  expect(disciplineData.length).toBeGreaterThan(0);
  
  disciplineData.forEach((classObj: any) => {
    expect(classObj.enrollments).toBeDefined();
    expect(Array.isArray(classObj.enrollments)).toBe(true);
    
    if (classObj.enrollments.length > 0) {
      classObj.enrollments.forEach((enrollment: any) => {
        expect(enrollment.mediaPreFinal).toBeDefined();
        expect(typeof enrollment.mediaPreFinal).toBe('number');
      });
    }
  });
  
  console.log('Validado: enrollments contêm dados de médias');
});

// não sei se preciso disso 
Then('o servidor deve retornar uma lista vazia', function () {
  expect(Array.isArray(disciplineData)).toBe(true);
  expect(disciplineData.length).toBe(0);
  console.log('Servidor retornou lista vazia conforme esperado');
});

// parece desnecessário
Then('os dados devem conter apenas turmas da disciplina {string}', function (discipline: string) {
  expect(Array.isArray(disciplineData)).toBe(true);
  
  disciplineData.forEach((classObj: any) => {
    expect(classObj.topic.toLowerCase()).toBe(discipline.toLowerCase());
  });
  
  console.log(`Validado: todas as ${disciplineData.length} turmas são da disciplina "${discipline}"`);
});
