import { Question } from './types';

export const normalizeText = (text: string): string =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const validateItem = (item: Question): boolean => {
  const word = normalizeText(item.answer);
  const letter = normalizeText(item.letter);
  const condition = normalizeText(item.condition || "");

  let isValid = true;

  // Validación: Empieza por
  if (condition.includes('empieza')) {
    if (!word.startsWith(letter)) isValid = false;
  }
  // Validación: Contiene
  else if (condition.includes('contiene')) {
    if (!word.includes(letter)) isValid = false;
  }

  return isValid;
};

