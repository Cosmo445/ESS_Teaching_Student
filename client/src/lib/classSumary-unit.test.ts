// TESTE DE UNIDADE (LÓGICA)
// Testa a lógica de classificação de estudantes
// Validação das regras de negócio para classificação de alunos

import { 
  processClassAnalytics,
  ChartDataPoint 
} from './classSumary_utils';
import { Class } from '../types/Class';
import { Enrollment } from '../types/Enrollment';

describe('processClassAnalytics - Lógica de Classificação de Estudantes', () => {
  
  // Testa se o processamento retorna null quando não há disciplina
  test('deve retornar null quando disciplina não é fornecida', () => {
    const mockData: Class[] = [];
    const result = processClassAnalytics(undefined, mockData);
    expect(result).toBeNull();
  });

  // Testa se o processamento retorna null quando não há dados
  test('deve retornar null quando dados não são fornecidos', () => {
    const result = processClassAnalytics('Matemática', null);
    expect(result).toBeNull();
  });

  // Testa se o processamento retorna null quando o array de dados está vazio
  test('deve retornar null quando array de dados está vazio', () => {
    const result = processClassAnalytics('Matemática', []);
    expect(result).toBeNull();
  });

  // Testa classificação de estudante aprovado pela média (>= 7.0)
  test('deve classificar corretamente estudante aprovado pela média', () => {
    const enrollment: Enrollment = {
      student: 'João',
      reprovadoPorFalta: false,
      mediaPreFinal: 8.5,
      mediaPosFinal: 0
    } as any;

    const mockClass: Class = {
      id: '1',
      topic: 'Matemática',
      year: 2024,
      semester: 1,
      enrollments: [enrollment]
    } as any;

    const result = processClassAnalytics('Matemática', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['APV. M']).toBe(1);
    expect(result![0]['APV. N']).toBe(0);
    expect(result![0]['REP. N']).toBe(0);
    expect(result![0]['REP. M']).toBe(0);
    expect(result![0]['REP. F']).toBe(0);
  });

  // Testa classificação de estudante reprovado por falta
  test('deve classificar corretamente estudante reprovado por falta', () => {
    const enrollment: Enrollment = {
      student: 'Maria',
      reprovadoPorFalta: true,
      mediaPreFinal: 9.0,
      mediaPosFinal: 0
    } as any;

    const mockClass: Class = {
      id: '1',
      topic: 'Física',
      year: 2024,
      semester: 1,
      enrollments: [enrollment]
    } as any;

    const result = processClassAnalytics('Física', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['REP. F']).toBe(1);
    expect(result![0]['APV. M']).toBe(0);
  });

  // Testa classificação de estudante aprovado pela nota final
  test('deve classificar corretamente estudante aprovado pela nota final', () => {
    const enrollment: Enrollment = {
      student: 'Pedro',
      reprovadoPorFalta: false,
      mediaPreFinal: 5.5,
      mediaPosFinal: 6.0
    } as any;

    const mockClass: Class = {
      id: '1',
      topic: 'Química',
      year: 2024,
      semester: 1,
      enrollments: [enrollment]
    } as any;

    const result = processClassAnalytics('Química', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['APV. N']).toBe(1);
    expect(result![0]['APV. M']).toBe(0);
    expect(result![0]['REP. N']).toBe(0);
  });

  // Testa classificação de estudante reprovado pela nota final
  test('deve classificar corretamente estudante reprovado pela nota final', () => {
    const enrollment: Enrollment = {
      student: 'Ana',
      reprovadoPorFalta: false,
      mediaPreFinal: 4.5,
      mediaPosFinal: 4.0
    } as any;

    const mockClass: Class = {
      id: '1',
      topic: 'História',
      year: 2024,
      semester: 1,
      enrollments: [enrollment]
    } as any;

    const result = processClassAnalytics('História', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['REP. N']).toBe(1);
    expect(result![0]['APV. N']).toBe(0);
  });

  // Testa classificação de estudante reprovado pela média baixa
  test('deve classificar corretamente estudante reprovado pela média baixa', () => {
    const enrollment: Enrollment = {
      student: 'Carlos',
      reprovadoPorFalta: false,
      mediaPreFinal: 2.5,
      mediaPosFinal: 0
    } as any;

    const mockClass: Class = {
      id: '1',
      topic: 'Geografia',
      year: 2024,
      semester: 1,
      enrollments: [enrollment]
    } as any;

    const result = processClassAnalytics('Geografia', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['REP. M']).toBe(1);
    expect(result![0]['APV. M']).toBe(0);
  });

  // Testa múltiplos estudantes em uma turma
  test('deve classificar corretamente múltiplos estudantes', () => {
    const enrollments: Enrollment[] = [
      { student: 'Aluno1', reprovadoPorFalta: false, mediaPreFinal: 8.0, mediaPosFinal: 0 } as any,
      { student: 'Aluno2', reprovadoPorFalta: true, mediaPreFinal: 6.0, mediaPosFinal: 0 } as any,
      { student: 'Aluno3', reprovadoPorFalta: false, mediaPreFinal: 5.0, mediaPosFinal: 6.5 } as any,
      { student: 'Aluno4', reprovadoPorFalta: false, mediaPreFinal: 2.0, mediaPosFinal: 0 } as any
    ];

    const mockClass: Class = {
      id: '1',
      topic: 'Biologia',
      year: 2024,
      semester: 1,
      enrollments: enrollments
    } as any;

    const result = processClassAnalytics('Biologia', [mockClass]);
    
    expect(result).not.toBeNull();
    expect(result![0]['APV. M']).toBe(1);  // Aluno1
    expect(result![0]['REP. F']).toBe(1);  // Aluno2
    expect(result![0]['APV. N']).toBe(1);  // Aluno3
    expect(result![0]['REP. M']).toBe(1);  // Aluno4
  });

  // Testa ordenação de períodos
  test('deve ordenar períodos corretamente', () => {
    const mockClasses: Class[] = [
      {
        id: '1',
        topic: 'Programação',
        year: 2024,
        semester: 2,
        enrollments: []
      } as any,
      {
        id: '2',
        topic: 'Programação',
        year: 2023,
        semester: 1,
        enrollments: []
      } as any,
      {
        id: '3',
        topic: 'Programação',
        year: 2024,
        semester: 1,
        enrollments: []
      } as any
    ];

    const result = processClassAnalytics('Programação', mockClasses);
    
    expect(result).not.toBeNull();
    expect(result![0].period).toBe('2023.1');
    expect(result![1].period).toBe('2024.1');
    expect(result![2].period).toBe('2024.2');
  });
});
