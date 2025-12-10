// TESTES DE SERVIDOR
// Implementa os cenários da feature de importação de planilha de alunos (server-side)

import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import expect from 'expect';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { Student } from '../types/Student';

// Set default timeout for all steps
setDefaultTimeout(30 * 1000); // 30 seconds

const serverUrl = 'http://localhost:3005';

// Armazenar dados de teste para limpeza
let createdStudentCPFs: string[] = [];
let csvStudents: Student[] = [];

Before({ tags: '@server' }, async function () {
  // Limpar arrays
  createdStudentCPFs = [];
  csvStudents = [];
  
  // Verificar se o servidor está disponível
  try {
    const response = await fetch(`${serverUrl}/api/students`);
    if (!response.ok) {
      throw new Error('Server not available');
    }
  } catch (error) {
    throw new Error('Backend server must be running on port 3005 before running server tests');
  }
});

After({ tags: '@server' }, async function () {
  // Limpar estudantes criados durante o teste
  console.log('🧹 Limpando dados de teste do servidor...');
  
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
  
  console.log('✅ Limpeza de servidor concluída');
  
  // Limpar arquivos temporários
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
});

Given('o servidor está disponível', async function () {
  // Verificar que a API do servidor está disponível
  console.log('✅ Verificando disponibilidade do servidor...');
  
  try {
    const response = await fetch(`${serverUrl}/api/students`);
    expect(response.ok).toBe(true);
    console.log('✅ Servidor disponível');
  } catch (error) {
    throw new Error('API do servidor não está disponível');
  }
});

Given('nenhum aluno em {string} está cadastrado no sistema', async function (fileName: string) {
  // Ler o arquivo CSV
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  let csvFilePath = path.resolve(__dirname, '..', '..', '..', 'cypress', 'fixtures', fileName);
  
  // Se o arquivo não existir, criar um temporário
  if (!fs.existsSync(csvFilePath)) {
    const tempDir = path.resolve(__dirname, '..', '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    csvFilePath = path.join(tempDir, fileName);
    
    // Criar conteúdo de exemplo para CSV
    const csvContent = 'nome,cpf,email\nJoão Silva,12345678901,joao@email.com\nMaria Santos,98765432109,maria@email.com\nPedro Costa,11122233344,pedro@email.com';
    fs.writeFileSync(csvFilePath, csvContent, 'utf-8');
    console.log(`📄 Arquivo CSV de teste criado: ${csvFilePath}`);
  }
  
  // Ler e parsear o CSV
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.split('\n');
  
  csvStudents = lines.slice(1) // Pular header
    .filter(line => line.trim().length > 0) // Filtrar linhas vazias
    .map(line => {
      const [nome, cpf, email] = line.split(',').map(s => s.trim());
      return { name: nome, cpf: cpf, email: email };
    });
  
  console.log(`📋 Arquivo ${fileName} contém ${csvStudents.length} aluno(s)`);
  
  // Verificar e remover cada aluno se existir
  for (const student of csvStudents) {
    try {
      const response = await fetch(`${serverUrl}/api/students/${student.cpf}`);
      
      if (response.ok) {
        // Aluno existe, precisa remover
        const deleteResponse = await fetch(`${serverUrl}/api/students/${student.cpf}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`🗑️ Aluno ${student.name} (CPF: ${student.cpf}) removido para garantir estado limpo`);
        }
      } else {
        console.log(`✓ Aluno ${student.name} (CPF: ${student.cpf}) não está cadastrado`);
      }
    } catch (error) {
      console.log(`✓ Aluno ${student.name} (CPF: ${student.cpf}) não está cadastrado`);
    }
  }
  
  // Armazenar CPFs para limpeza posterior
  createdStudentCPFs = csvStudents.map(s => s.cpf);
  
  console.log('✅ Estado inicial verificado: nenhum aluno do CSV está no sistema');
});

When('recebo o arquivo {string}', async function (fileName: string) {
  console.log(`📥 Processando arquivo: ${fileName}`);
  
  // Simular o processamento do arquivo que seria feito pelo ImportService
  // Os alunos já foram parseados no step anterior (csvStudents)
  
  expect(csvStudents.length).toBeGreaterThan(0);
  console.log(`✅ Arquivo recebido com ${csvStudents.length} aluno(s)`);
});

Then('devo cadstrar os alunos de {string}', async function (fileName: string) {
  console.log(`💾 Cadastrando alunos de ${fileName}...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Cadastrar cada aluno via API
  for (const student of csvStudents) {
    try {
      const response = await fetch(`${serverUrl}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(student)
      });
      
      if (response.ok || response.status === 201) {
        successCount++;
        console.log(`✅ Aluno ${student.name} cadastrado com sucesso`);
      } else {
        errorCount++;
        const errorData = await response.text();
        console.error(`❌ Erro ao cadastrar ${student.name}: ${errorData}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao cadastrar ${student.name}:`, error);
    }
  }
  
  console.log(`📊 Resultado: ${successCount} sucesso(s), ${errorCount} erro(s)`);
  
  // Verificar que todos os alunos foram cadastrados
  expect(successCount).toBe(csvStudents.length);
  expect(errorCount).toBe(0);
  
  // Função para normalizar CPF (remover formatação)
  const normalizeCPF = (cpf: string): string => {
    return cpf.replace(/[.\-]/g, '');
  };
  
  // Verificar que cada aluno está realmente no sistema
  for (const student of csvStudents) {
    const response = await fetch(`${serverUrl}/api/students/${student.cpf}`);
    expect(response.ok).toBe(true);
    
    const savedStudent = await response.json();
    expect(savedStudent.name).toBe(student.name);
    // Normalizar CPFs antes de comparar (remover formatação)
    expect(normalizeCPF(savedStudent.cpf)).toBe(normalizeCPF(student.cpf));
    expect(savedStudent.email).toBe(student.email);
  }
  
  console.log(`✅ Todos os ${csvStudents.length} aluno(s) foram cadastrados corretamente`);
});
