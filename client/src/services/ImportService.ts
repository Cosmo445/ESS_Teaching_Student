
import { Student } from '../types/Student';
import { studentService } from './StudentService';

export async function validarPlanilha(turmaId: string, file: File) {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await fetch(`/api/turmas/${turmaId}/importar-alunos/validar`, {
    method: "POST",
    body: formData
  });

  return response.json();
}

export async function statusImportacao(turmaId: string) {
  return fetch(`/api/turmas/${turmaId}/importar-alunos/status`)
    .then(r => r.json());
}

// Função para enviar a planilha para o servidor usando `fetch`
export const uploadPlanilha = async (newStudents: Student[]) => {
  
  console.log("Enviando arquivo para o servidor: \n");
  console.log(newStudents);

  for (let i = 0; i < newStudents.length; i++) {
    const st = newStudents[i];
    console.log(st);

    try {
      studentService.createStudent(st);
    } catch (error) {
      try {
        studentService.updateStudent(st.cpf, st);
      } catch (error) {
        console.log('Error importing student "' + st.cpf + '":');
      }
    }
  }

};


export function upPlanilha(arquivo: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const linhas = texto.split("\n");

      const alunos = linhas.map(l => {
        const [nome, cpf, email] = l.split(",");
        return { name:nome, cpf:cpf, email:email };
      }).slice(1); // Skip header line

      uploadPlanilha(alunos);

      resolve(alunos);
    };

    reader.onerror = reject;
    reader.readAsText(arquivo);
  });
}
