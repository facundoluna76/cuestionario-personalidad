export interface Question {
  id: number;
  text: string;
  options: { label: string; text: string }[];
  subscale: string;
  scores: { A: number; B: number; C: number };
}

export interface Subscale {
  code: string;
  name: string;
  descriptionLow: string;
  descriptionHigh: string;
  maxScore: number;
}

export const subscales: Subscale[] = [
  { code: "A", name: "Abierto", descriptionLow: "Reservado, alejado, crítico", descriptionHigh: "Abierto, afectuoso, participativo", maxScore: 20 },
  { code: "C", name: "Emocionalidad", descriptionLow: "Afectado por sentimientos, menos estable", descriptionHigh: "Emocionalmente estable, tranquilo", maxScore: 20 },
  { code: "D", name: "Calmo", descriptionLow: "Calmoso, poco expresivo", descriptionHigh: "Excitable, impaciente, exigente", maxScore: 20 },
  { code: "E", name: "Dominante", descriptionLow: "Sumiso, obediente, dócil", descriptionHigh: "Dominante, asertivo, agresivo", maxScore: 20 },
  { code: "F", name: "Entusiasta", descriptionLow: "Sobrio, prudente, serio", descriptionHigh: "Entusiasta, confiado, despreocupado", maxScore: 20 },
  { code: "G", name: "Despreocupado", descriptionLow: "Despreocupado, inconstante", descriptionHigh: "Consciente, perseverante, moralista", maxScore: 20 },
  { code: "H", name: "Tímido", descriptionLow: "Cohibido, tímido, sensible a la amenaza", descriptionHigh: "Emprendedor, socialmente atrevido", maxScore: 20 },
  { code: "I", name: "Sensible", descriptionLow: "Realista, confiado en sí mismo", descriptionHigh: "Sensible, dependiente, sobreprotegido", maxScore: 20 },
  { code: "J", name: "Seguro", descriptionLow: "Seguro, le gusta la actividad en grupo", descriptionHigh: "Dubitativo, individualista", maxScore: 20 },
  { code: "Q", name: "Sereno", descriptionLow: "Sereno, apacible, seguro de sí", descriptionHigh: "Aprensivo, con autorreproches, inseguro", maxScore: 20 },
  { code: "Q2", name: "Independencia", descriptionLow: "Dependiente del grupo", descriptionHigh: "Autosuficiente, prefiere sus propias decisiones", maxScore: 20 },
  { code: "Q3", name: "Integrado", descriptionLow: "Incontrolado, sigue sus propias necesidades", descriptionHigh: "Controlado, socialmente adaptado", maxScore: 20 },
  { code: "Q4", name: "Tensión", descriptionLow: "Relajado, tranquilo, no frustrado", descriptionHigh: "Tenso, frustrado, presionado", maxScore: 20 },
];
