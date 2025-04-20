/**
 * Utility di accessibilità per ineoutroom.eu
 * Fornisce funzioni per la verifica del contrasto e altre funzionalità per l'accessibilità
 */

/**
 * Calcola il rapporto di contrasto tra due colori
 * Formula basata su WCAG 2.0: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 * 
 * @param color1 Colore in formato esadecimale (es. #ffffff)
 * @param color2 Colore in formato esadecimale (es. #000000)
 * @returns Rapporto di contrasto (min: 1, max: 21)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateRelativeLuminance(color1);
  const luminance2 = calculateRelativeLuminance(color2);
  
  // Formula WCAG per il calcolo del contrasto
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calcola la luminanza relativa di un colore
 * @param hexColor Colore in formato esadecimale (es. #ffffff)
 * @returns Luminanza relativa del colore (tra 0 e 1)
 */
function calculateRelativeLuminance(hexColor: string): number {
  // Rimuovi il # iniziale se presente
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  
  // Converte i valori esadecimali in decimali
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Applica la correzione gamma
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calcola la luminanza relativa
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Controlla se un rapporto di contrasto soddisfa gli standard WCAG 2.0
 * 
 * @param ratio Rapporto di contrasto
 * @param level Livello WCAG da soddisfare (AA o AAA)
 * @param isLargeText Se il testo è considerato grande (>= 18pt o >= 14pt bold)
 * @returns Se il contrasto è sufficiente
 */
export function isContrastSufficient(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  } else {
    // WCAG AAA
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Converte un colore HSL in formato esadecimale
 * 
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns Colore in formato esadecimale
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  // Converti in esadecimale
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Genera un colore con contrasto sufficiente rispetto a un colore di base
 * 
 * @param baseColor Colore di base
 * @param targetRatio Rapporto di contrasto target
 * @returns Un colore con contrasto sufficiente
 */
export function generateAccessibleColor(
  baseColor: string,
  targetRatio: number = 4.5
): string {
  // Converti il colore base in RGB
  const hex = baseColor.startsWith('#') ? baseColor.slice(1) : baseColor;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcola la luminanza del colore base
  const baseLuminance = calculateRelativeLuminance(baseColor);
  
  // Decidi se generare un colore più chiaro o più scuro
  if (baseLuminance > 0.5) {
    // Il colore base è chiaro, genera un colore scuro
    let newColor = '#000000';
    // Aumenta gradualmente la luminosità fino a raggiungere il target
    for (let i = 0; i < 255; i++) {
      newColor = `#${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}`;
      if (calculateContrastRatio(baseColor, newColor) <= targetRatio) {
        break;
      }
    }
    return newColor;
  } else {
    // Il colore base è scuro, genera un colore chiaro
    let newColor = '#ffffff';
    // Riduci gradualmente la luminosità fino a raggiungere il target
    for (let i = 255; i > 0; i--) {
      newColor = `#${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}${i.toString(16).padStart(2, '0')}`;
      if (calculateContrastRatio(baseColor, newColor) <= targetRatio) {
        break;
      }
    }
    return newColor;
  }
}