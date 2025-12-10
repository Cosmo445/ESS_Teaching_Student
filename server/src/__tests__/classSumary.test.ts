// TESTE DE INTEGRAÇÃO DE SERVIÇO (BACKEND)
// Testa os endpoints de analytics da API

import request from 'supertest';
import { app, studentSet, classes } from '../server';
import { Class } from '../models/Class';
import { Student } from '../models/Student';
import { Enrollment } from '../models/Enrollment';

describe("Server API - Analytics Endpoints", () => {
  
  beforeEach(() => {
    // Limpar dados antes de cada teste
    const allStudents = studentSet.getAllStudents();
    allStudents.forEach(student => {
      try {
        studentSet.removeStudent(student.getCPF());
      } catch (error) {
        // Ignorar se não existir
      }
    });

    const allClasses = classes.getAllClasses();
    allClasses.forEach(classObj => {
      try {
        classes.removeClass(classObj.getClassId());
      } catch (error) {
        // Ignorar se não existir
      }
    });
  });

  describe("GET /api/classes - Obter turmas para análise", () => {
    
    it("deve retornar array vazio quando não há turmas cadastradas", async () => {
      const response = await request(app)
        .get('/api/classes')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("deve retornar turmas com dados de analytics quando existem turmas", async () => {
      // Criar estudantes
      const student1 = new Student('Aluno Aprovado', '111.111.111-11', 'aprovado@test.com');
      const student2 = new Student('Aluno Reprovado', '222.222.222-22', 'reprovado@test.com');
      studentSet.addStudent(student1);
      studentSet.addStudent(student2);

      // Criar turma com enrollments
      const classObj = new Class('Engenharia de Software', 1, 2023);
      
      const enrollment1 = classObj.addEnrollment(student1);
      (enrollment1 as any).mediaPreFinal = 8.0;
      (enrollment1 as any).mediaPosFinal = 0;
      (enrollment1 as any).reprovadoPorFalta = false;
      
      const enrollment2 = classObj.addEnrollment(student2);
      (enrollment2 as any).mediaPreFinal = 2.0;
      (enrollment2 as any).mediaPosFinal = 0;
      (enrollment2 as any).reprovadoPorFalta = false;

      classes.addClass(classObj);

      const response = await request(app)
        .get('/api/classes')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].topic).toBe('Engenharia de Software');
      expect(response.body[0].enrollments).toHaveLength(2);
    });

    it("deve filtrar turmas por disciplina usando endpoint específico", async () => {
      // Criar turmas de diferentes disciplinas
      const classESS = new Class('Engenharia de Software', 1, 2023);
      const classMD = new Class('Matemática Discreta', 1, 2023);
      
      classes.addClass(classESS);
      classes.addClass(classMD);

      const response = await request(app)
        .get('/api/classes/Engenharia de Software')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].topic).toBe('Engenharia de Software');
    });

    it("deve retornar array vazio quando disciplina não tem dados cadastrados", async () => {
      // Criar apenas uma turma de ESS
      const classESS = new Class('Engenharia de Software', 1, 2023);
      classes.addClass(classESS);

      const response = await request(app)
        .get('/api/classes/Matemática Discreta')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("Dados de analytics nas turmas", () => {
    
    it("deve incluir mediaPreFinal e mediaPosFinal nos enrollments", async () => {
      const student = new Student('Teste Student', '333.333.333-33', 'test@test.com');
      studentSet.addStudent(student);

      const classObj = new Class('Engenharia de Software', 1, 2024);
      const enrollment = classObj.addEnrollment(student);
      (enrollment as any).mediaPreFinal = 5.5;
      (enrollment as any).mediaPosFinal = 6.0;
      (enrollment as any).reprovadoPorFalta = false;

      classes.addClass(classObj);

      const response = await request(app)
        .get('/api/classes')
        .expect(200);

      const returnedEnrollment = response.body[0].enrollments[0];
      expect(returnedEnrollment.mediaPreFinal).toBe(5.5);
      expect(returnedEnrollment.mediaPosFinal).toBe(6.0);
      expect(returnedEnrollment.reprovadoPorFalta).toBe(false);
    });
  });
});