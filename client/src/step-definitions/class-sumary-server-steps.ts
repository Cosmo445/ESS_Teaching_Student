// TESTE DE ACEITAÇÃO DE SERVIÇO (API + BDD)
// Implementa os cenários da feature de análise gráfica via API
// caminho real: client/src/step-definitions/class-analytics-server-steps.ts

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import expect from 'expect';

// Set default timeout for all steps
setDefaultTimeout(30 * 1000); // 30 seconds

const serverUrl = 'http://localhost:3005';

let lastResponse: Response;
let disciplineData: any;
let backupData: any = null;

//TODO rever esse before para que ele coloque o que for necessário no servidor para que o cenário possa avaliar a funcionalidade normalmente
Before({ tags: '@server-sumary' }, async function () {
  // Garantir que o servidor está disponível e fazer backup dos dados
  try {
    const response = await fetch(`${serverUrl}/api/classes`);
    
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    
    // Fazer backup dos dados atuais para restaurar depois
    backupData = await response.json();
    
    // Verificar se a disciplina necessária existe
    const disciplineName = 'Engenharia de Software e Sistemas';
    const disciplineClasses = backupData.filter((c: any) => 
      c.topic.toLowerCase() === disciplineName.toLowerCase()
    );
    
    if (disciplineClasses.length === 0) {
      //console.warn(`⚠️  Disciplina "${disciplineName}" não encontrada. Os testes podem falhar.`);
    } else {
      // Verificar se as turmas têm os campos necessários
      const hasRequiredFields = disciplineClasses.every((classObj: any) => {
        return classObj.enrollments && classObj.enrollments.every((enrollment: any) => 
          enrollment.hasOwnProperty('mediaPreFinal') &&
          enrollment.hasOwnProperty('mediaPosFinal') &&
          enrollment.hasOwnProperty('reprovadoPorFalta')
        );
      });
      
      if (!hasRequiredFields) {
        console.warn('⚠️  Alguns enrollments não têm todos os campos necessários');
      } else {
        console.log(`✅ Setup completo: ${disciplineClasses.length} turmas encontradas com dados válidos`);
      }
    }
    
  } catch (error) {
    throw new Error(`Failed to setup test environment: ${error}. Make sure the backend server is running on port 3005`);
  }
});

After({ tags: '@server-sumary' }, async function () {
  // Cleanup: recarregar dados originais do servidor
  try {
    // Buscar todas as classes atuais
    const response = await fetch(`${serverUrl}/api/classes`);
    if (response.ok) {
      const currentClasses = await response.json();
      
      // Se houver classes que foram adicionadas durante o teste, removê-las
      // ou recarregar o arquivo de dados original
      // Como não temos endpoint de reset, apenas logamos a conclusão
      console.log(`Server analytics test cleanup: ${currentClasses.length} classes no sistema`);
    }
    
    disciplineData = undefined;
    lastResponse = undefined as any;
    
    console.log('Server analytics test cleanup completed');
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
});

Given('the server API is available for analytics', async function () {
  try {
    const response = await fetch(`${serverUrl}/api/classes`);
    expect(response.status).toBe(200);
    console.log('Server API is available for analytics');
  } catch (error) {
    throw new Error('Server is not available. Make sure the backend server is running on port 3005');
  }
});

Given('a disciplina {string} tem turmas cadastradas', async function (discipline: string) {
  // Verificar que existem turmas cadastradas com enrollments
  const response = await fetch(`${serverUrl}/api/classes`);
  expect(response.status).toBe(200);
  
  const classes = await response.json();
  const disciplineClasses = classes.filter((c: any) => 
    c.topic.toLowerCase() === discipline.toLowerCase()
  );
  
  expect(disciplineClasses.length).toBeGreaterThan(0);
  
  // Verificar que pelo menos uma turma tem enrollments
  const hasEnrollments = disciplineClasses.some((c: any) => 
    c.enrollments && c.enrollments.length > 0
  );
  expect(hasEnrollments).toBe(true);
  
  console.log(`Disciplina "${discipline}" tem ${disciplineClasses.length} turmas cadastradas com enrollments`);
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

Then('o servidor deve retornar turmas com enrollments', function () {
  expect(Array.isArray(disciplineData)).toBe(true);
  expect(disciplineData.length).toBeGreaterThan(0);
  
  // Verificar que pelo menos uma turma tem enrollments
  const turmasComEnrollments = disciplineData.filter((c: any) => 
    c.enrollments && c.enrollments.length > 0
  );
  
  expect(turmasComEnrollments.length).toBeGreaterThan(0);
  console.log(`Servidor retornou ${disciplineData.length} turmas, ${turmasComEnrollments.length} com enrollments`);
});

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

Then('cada enrollment deve ter os campos de média:', function (dataTable: any) {
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
  
  console.log('Validado: todos os enrollments contêm os campos de média esperados com tipos corretos');
});
