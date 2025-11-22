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

import { Student } from '../types/Student';

export function lerPlanilha(arquivo: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const linhas = texto.split("\n");

      const alunos = linhas.map(l => {
        const [nome, cpf, email] = l.split(",");
        return { name:nome, cpf:cpf, email:email };
      });

      resolve(alunos);
    };

    reader.onerror = reject;
    reader.readAsText(arquivo);
  });
}
