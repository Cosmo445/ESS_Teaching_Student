import { Student } from './Student';
import { Evaluation } from './Evaluation';

export class Enrollment {
  private student: Student;
  private evaluations: Evaluation[];
  // Média do estudante antes da prova final
  private media: number;
  // Média do estudante depois da final
  private mediaFinal: number;
  private reprovadoPorFalta: Boolean;

  constructor(student: Student, evaluations: Evaluation[] = [], media: number = 0, mediaFinal: number = 0, reprovadoPorFalta: Boolean = false) {
    this.student = student;
    this.evaluations = evaluations;
    this.media = media;
    this.mediaFinal = mediaFinal;
    this.reprovadoPorFalta = reprovadoPorFalta;
  }

  // Get student
  getStudent(): Student {
    return this.student;
  }

  // Get evaluations
  getEvaluations(): Evaluation[] {
    return [...this.evaluations]; // Return copy to prevent external modification
  }

  // Get media 
  getMedia(): number{
    return this.media;
  }

  // Set media 
  setMedia(media: number){
    this.media = media;
  }

  // Get mediaFinal
  getMediaFinal(): number{
    return this.mediaFinal;
  }

  // Set mediaFinal
  setMediaFinal(mediaFinal: number){
    this.mediaFinal = mediaFinal;
  }

  // Get reprovado por falta 
  getReprovadoPorFalta(): Boolean {
    return this.reprovadoPorFalta;
  }
  
  // Set reprovado por falta
  setReprovadoPorFalta(reprovadoPorFalta: Boolean){
    this.reprovadoPorFalta = reprovadoPorFalta;
  }

  // Add or update an evaluation
  addOrUpdateEvaluation(goal: string, grade: 'MANA' | 'MPA' | 'MA'): void {
    const existingIndex = this.evaluations.findIndex(evaluation => evaluation.getGoal() === goal);
    if (existingIndex >= 0) {
      this.evaluations[existingIndex].setGrade(grade);
    } else {
      this.evaluations.push(new Evaluation(goal, grade));
    }
  }

  // Remove an evaluation
  removeEvaluation(goal: string): boolean {
    const existingIndex = this.evaluations.findIndex(evaluation => evaluation.getGoal() === goal);
    if (existingIndex >= 0) {
      this.evaluations.splice(existingIndex, 1);
      return true;
    }
    return false;
  }

  // Get evaluation for a specific goal
  getEvaluationForGoal(goal: string): Evaluation | undefined {
    return this.evaluations.find(evaluation => evaluation.getGoal() === goal);
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      student: this.student.toJSON(),
      evaluations: this.evaluations.map(evaluation => evaluation.toJSON())
    };
  }

  // Create Enrollment from JSON object
  static fromJSON(data: { student: any; evaluations: any[] }, student: Student): Enrollment {
    const evaluations = data.evaluations
      ? data.evaluations.map((evalData: any) => Evaluation.fromJSON(evalData))
      : [];
    
    return new Enrollment(student, evaluations);
  }
}