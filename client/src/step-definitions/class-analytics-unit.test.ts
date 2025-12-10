// TESTE DE UNIDADE (LÓGICA)
// Testa a lógica de classificação de estudantes no StudentsAnalyticsCalculator
// depois que eu refatorar minha implementação vou ter que rever isso 
// caminho real: client/src/lib/StudentsAnalyticsCalculator.test.ts
import { 
  ChartDataPoint 
} from '../lib/classSumary_utils';
import { Class } from '../types/Class';
import { Enrollment } from '../types/Enrollment';

/*
describe("StudentsAnalyticsCalculator - Unit Tests", () => {
  
  describe("Classificação de Situação do Aluno", () => {
    
    it("deve classificar como 'APV. M' (Aprovado pela Média) quando média >= 7.0", () => {
      const mockClass: Class = {
        id: '1',
        topic: 'Engenharia de Software',
        year: 2023,
        semester: 1,
        enrollments: [
          {
            student: { name: 'Aluno Teste', cpf: '12345678901', email: 'test@email.com' },
            mediaPreFinal: 8.5,
            mediaPosFinal: 0,
            reprovadoPorFalta: false
          } as Enrollment
        ]
      };

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', [mockClass]);
      
      expect(analytics[0].statistics.approvedByAverage).toBe(1);
      expect(analytics[0].statistics.totalStudents).toBe(1);
    });

    it("deve classificar como 'REP. M' (Reprovado pela Média) quando média < 3.0", () => {
      const mockClass: Class = {
        id: '2',
        topic: 'Engenharia de Software',
        year: 2023,
        semester: 2,
        enrollments: [
          {
            student: { name: 'Aluno Reprovado', cpf: '98765432100', email: 'reprovado@email.com' },
            mediaPreFinal: 2.5,
            mediaPosFinal: 0,
            reprovadoPorFalta: false
          } as Enrollment
        ]
      };

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', [mockClass]);
      
      expect(analytics[0].statistics.failedByAverage).toBe(1);
      expect(analytics[0].statistics.totalStudents).toBe(1);
    });

    it("deve classificar como 'APV. N' (Aprovado pela Nota Final) quando média pré >= 3.0, < 7.0 e final >= 5.0", () => {
      const mockClass: Class = {
        id: '3',
        topic: 'Engenharia de Software',
        year: 2024,
        semester: 1,
        enrollments: [
          {
            student: { name: 'Aluno Final', cpf: '11122233344', email: 'final@email.com' },
            mediaPreFinal: 5.0,
            mediaPosFinal: 6.0,
            reprovadoPorFalta: false
          } as Enrollment
        ]
      };

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', [mockClass]);
      
      expect(analytics[0].statistics.approvedByGrade).toBe(1);
      expect(analytics[0].statistics.totalStudents).toBe(1);
    });

    it("deve classificar como 'REP. N' (Reprovado pela Nota Final) quando média pré >= 3.0, < 7.0 e final < 5.0", () => {
      const mockClass: Class = {
        id: '4',
        topic: 'Engenharia de Software',
        year: 2024,
        semester: 2,
        enrollments: [
          {
            student: { name: 'Aluno Final Rep', cpf: '55566677788', email: 'finalrep@email.com' },
            mediaPreFinal: 4.0,
            mediaPosFinal: 3.5,
            reprovadoPorFalta: false
          } as Enrollment
        ]
      };

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', [mockClass]);
      
      expect(analytics[0].statistics.failedByGrade).toBe(1);
      expect(analytics[0].statistics.totalStudents).toBe(1);
    });

    it("deve classificar como 'REP. F' (Reprovado por Falta) independente da nota", () => {
      const mockClass: Class = {
        id: '5',
        topic: 'Engenharia de Software',
        year: 2025,
        semester: 1,
        enrollments: [
          {
            student: { name: 'Aluno Faltoso', cpf: '99988877766', email: 'faltoso@email.com' },
            mediaPreFinal: 9.0,
            mediaPosFinal: 0,
            reprovadoPorFalta: true
          } as Enrollment
        ]
      };

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', [mockClass]);
      
      expect(analytics[0].statistics.failedByAttendance).toBe(1);
      expect(analytics[0].statistics.totalStudents).toBe(1);
    });
  });

  describe("Transformação de dados para o gráfico", () => {
    
    it("deve transformar analytics em formato de gráfico corretamente", () => {
      const mockClasses: Class[] = [
        {
          id: '1',
          topic: 'Engenharia de Software',
          year: 2023,
          semester: 1,
          enrollments: [
            {
              student: { name: 'Aluno 1', cpf: '11111111111', email: 'a1@email.com' },
              mediaPreFinal: 8.0,
              mediaPosFinal: 0,
              reprovadoPorFalta: false
            } as Enrollment,
            {
              student: { name: 'Aluno 2', cpf: '22222222222', email: 'a2@email.com' },
              mediaPreFinal: 5.0,
              mediaPosFinal: 6.0,
              reprovadoPorFalta: false
            } as Enrollment
          ]
        }
      ];

      const analytics = generateAnalyticsForDiscipline('Engenharia de Software', mockClasses);
      const chartData = transformToChartData(analytics);

      expect(chartData).toHaveLength(1);
      expect(chartData[0].period).toBe('2023.1');
      expect(chartData[0]['APV. M']).toBe(1);
      expect(chartData[0]['APV. N']).toBe(1);
      expect(chartData[0]['REP. N']).toBe(0);
      expect(chartData[0]['REP. M']).toBe(0);
      expect(chartData[0]['REP. F']).toBe(0);
    });
  });
});
*/