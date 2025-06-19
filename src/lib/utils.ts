import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return "-";
  }
  
  return dateObj.toLocaleDateString("pt-BR", {timeZone: 'UTC'});
}

export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  // Extrair apenas a parte da data (YYYY-MM-DD) sem conversão de timezone
  return dateString.split('T')[0];
}
