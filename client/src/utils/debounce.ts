/**
 * Debounce function
 * Ritarda l'esecuzione di una funzione fino a quando non sono trascorsi un determinato numero di millisecondi dall'ultima invocazione
 * Utile per migliorare le performance di eventi come resize, scroll, input, etc.
 * 
 * @param func La funzione da ritardare
 * @param wait Millisecondi di attesa
 * @param immediate Se true, esegue la funzione immediatamente piuttosto che alla fine del tempo di attesa
 * @returns Funzione filtrata che evita esecuzioni ripetute
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

export default debounce;