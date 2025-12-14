
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

async function importarOuAtualizarAluno(st: Student): Promise<boolean> {
  try {
    await studentService.createStudent(st);
    return true;
  } catch {
    try {
      await studentService.updateStudent(st.cpf, st);
      return true;
    } catch {
      console.log(`Error importing student "${st.cpf}"`);
      return false;
    }
  }
}

// Função para enviar a planilha para o servidor usando `fetch`
export const uploadPlanilha = async (newStudents: Student[]): Promise<{ success: boolean; count: number; errors: number }> => {
  
  console.log("Enviando arquivo para o servidor: \n");
  console.log(newStudents);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < newStudents.length; i++) {
    const ok = await importarOuAtualizarAluno(newStudents[i]);

    if(ok)  successCount++; 
    else    errorCount++;
  }

  return {
    success: errorCount === 0,
    count: successCount,
    errors: errorCount
  };
};


export function upPlanilha(arquivo: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const texto = e.target?.result as string;
        const linhas = texto.split("\n");

        const alunos = linhas.map(l => {
          const [nome, cpf, email] = l.split(",");
          return { name:nome, cpf:cpf, email:email };
        }).slice(1); // Skip header line

        const result = await uploadPlanilha(alunos);
        
        if (result.success || result.count > 0) {
          console.log(`✅ Importação concluída: ${result.count} aluno(s) importado(s), ${result.errors} erro(s)`);
          resolve(alunos);
        } else {
          reject(new Error(`Falha na importação: ${result.errors} erro(s)`));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsText(arquivo);
  });
}
