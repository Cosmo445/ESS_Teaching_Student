
export async function confirmarImportacao(turmaId: string) {
  return fetch(`/api/turmas/${turmaId}/importar-alunos/confirmar`, {
    method: "POST"
  }).then(r => r.json());
}
