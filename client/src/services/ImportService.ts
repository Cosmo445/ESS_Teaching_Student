
import { Student } from '../types/Student';

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
export const uploadPlanilha = async (file: File) => {
  
  console.log("Enviando arquivo para o servidor: \n");
  console.log(file);
  /*

  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('http://localhost:3005/data/students.json', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar o arquivo');
    }

  } catch (err) {
      throw new Error('Erro ao enviar o arquivo');
  }*/
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

      //console.log(alunos);

      const jsonAlunes = JSON.stringify({"students" : alunos}, null, 2);
      //console.log(jsonAlunes);

      const blob = new Blob([jsonAlunes], { type: "application/json" });
      const alunesJsonFile = new File([blob], "students.json", { type: "application/json" });

      //console.log(alunesJsonFile);

      uploadPlanilha(alunesJsonFile);

      resolve(alunos);
    };

    reader.onerror = reject;
    reader.readAsText(arquivo);
  });
}
