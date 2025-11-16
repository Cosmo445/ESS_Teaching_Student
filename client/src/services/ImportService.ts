export async function validarPlanilha(turmaId: string, file: File) {
  const formData = new FormData();
  formData.append("arquivo", file);

  const response = await fetch(`/api/turmas/${turmaId}/importar-alunos/validar`, {
    method: "POST",
    body: formData
  });

  return response.json();
}

export async function confirmarImportacao(turmaId: string) {
  return fetch(`/api/turmas/${turmaId}/importar-alunos/confirmar`, {
    method: "POST"
  }).then(r => r.json());
}

export async function statusImportacao(turmaId: string) {
  return fetch(`/api/turmas/${turmaId}/importar-alunos/status`)
    .then(r => r.json());
}
