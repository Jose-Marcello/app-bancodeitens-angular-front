export interface Questao {
  
  // 1. ID Único da Questão (Mapeia o Guid do C#)
  id: string; 
  
  // 2. O Enunciado ou Descrição da Questão
  descricao: string;
  
  // 3. 🟢 CHAVE ESTRANGEIRA (Foreign Key)
  // O ID da Disciplina à qual esta questão pertence (Mapeia o Guid do C#)
  disciplinaId: string;

  disciplinaNome: string;
  
}