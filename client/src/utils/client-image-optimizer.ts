/**
 * Utility per l'ottimizzazione delle immagini lato client
 * 
 * Funzionalità implementate:
 * - Ridimensionamento immagini prima dell'upload
 * - Compressione e ottimizzazione qualità
 * - Conversione formato (se supportato dal browser)
 */

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png' | 'original';
  maintainAspectRatio?: boolean;
  maxSizeKB?: number; // Dimensione massima in KB
}

interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  sizeKB: number;
  format: string;
}

const defaultOptions: ImageOptimizationOptions = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.85,
  format: 'webp',
  maintainAspectRatio: true,
  maxSizeKB: 500, // 500KB
};

/**
 * Ottimizza un'immagine lato client prima dell'upload
 * 
 * @param file Il file immagine originale
 * @param options Opzioni di ottimizzazione
 * @returns Promise con il risultato dell'ottimizzazione
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  // Unisci le opzioni predefinite con quelle fornite
  const settings = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    // 1. Leggi il file come data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 2. Calcola le dimensioni ottimali
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          settings.maxWidth!,
          settings.maxHeight!,
          settings.maintainAspectRatio!
        );
        
        // 3. Crea un canvas e ridimensiona l'immagine
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossibile creare il contesto 2D del canvas'));
          return;
        }
        
        // Disegna l'immagine sul canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // 4. Converti in formato specifico
        let format = 'image/jpeg'; // Formato predefinito
        
        if (settings.format === 'webp' && supportsWebP()) {
          format = 'image/webp';
        } else if (settings.format === 'png') {
          format = 'image/png';
        }
        
        // 5. Converti il canvas in dataURL con la qualità specificata
        try {
          const dataUrl = canvas.toDataURL(format, settings.quality);
          
          // 6. Converti dataURL in Blob
          const binaryData = atob(dataUrl.split(',')[1]);
          const array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            array[i] = binaryData.charCodeAt(i);
          }
          
          // 7. Crea un nuovo file con il formato corretto
          const blob = new Blob([array], { type: format });
          const filename = getOutputFilename(file.name, settings.format!);
          const optimizedFile = new File([blob], filename, { type: format });
          
          // 8. Verifica se la dimensione è inferiore al limite impostato
          const sizeKB = optimizedFile.size / 1024;
          
          // Se c'è un limite di dimensione e l'immagine è ancora troppo grande,
          // riprova con una qualità inferiore
          if (settings.maxSizeKB && sizeKB > settings.maxSizeKB) {
            if (settings.quality! > 0.5) {
              // Riprova con una qualità inferiore
              optimizeImage(file, {
                ...settings,
                quality: settings.quality! * 0.8,
              }).then(resolve).catch(reject);
              return;
            }
          }
          
          resolve({
            file: optimizedFile,
            dataUrl,
            width,
            height,
            sizeKB,
            format: settings.format || 'jpeg',
          });
        } catch (error) {
          reject(new Error(`Errore nell'ottimizzazione dell'immagine: ${error.message}`));
        }
      };
      
      img.onerror = () => {
        reject(new Error("Errore nel caricamento dell'immagine"));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Errore nella lettura del file"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Verifica se il browser supporta il formato WebP
 */
function supportsWebP(): boolean {
  // Implementazione rilevamento WebP di base
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    return false;
  }
  
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

/**
 * Calcola le dimensioni ottimali mantenendo l'aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } {
  if (maintainAspectRatio) {
    // Se entrambe le dimensioni sono già inferiori ai massimi
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }
    
    // Calcola le proporzioni
    const aspectRatio = originalWidth / originalHeight;
    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;
    
    // Se l'altezza calcolata supera il massimo, ridimensiona in base all'altezza
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }
    
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  } else {
    // Se non è necessario mantenere le proporzioni, usa semplicemente le dimensioni massime
    return {
      width: originalWidth > maxWidth ? maxWidth : originalWidth,
      height: originalHeight > maxHeight ? maxHeight : originalHeight,
    };
  }
}

/**
 * Genera un nome file appropriato per l'output
 */
function getOutputFilename(originalFilename: string, format: string): string {
  // Rimuovi l'estensione originale
  const baseName = originalFilename.replace(/\.[^/.]+$/, "");
  
  // Aggiungi la nuova estensione in base al formato
  switch (format) {
    case 'webp':
      return `${baseName}.webp`;
    case 'png':
      return `${baseName}.png`;
    default:
      return `${baseName}.jpg`;
  }
}

/**
 * Genera un placeholder a bassa risoluzione per l'anteprima
 */
export async function generatePlaceholder(
  file: File,
  size: number = 32
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = (size * img.height) / img.width;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossibile creare il contesto 2D del canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Applica un leggero blur per evitare pixelation
        if (typeof ctx.filter !== 'undefined') {
          ctx.filter = 'blur(1px)';
          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      
      img.onerror = () => {
        reject(new Error("Errore nel caricamento dell'immagine"));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Errore nella lettura del file"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Estrae i metadati EXIF da un'immagine
 */
export async function extractImageMetadata(file: File): Promise<any> {
  // TODO: implementare l'estrazione dei metadati EXIF
  return { width: 0, height: 0 };
}

/**
 * Rimuove i metadati EXIF da un'immagine per privacy
 */
export async function stripMetadata(file: File): Promise<File> {
  // Per ora, stiamo semplicemente ottimizzando l'immagine, il che rimuove i metadati EXIF
  const result = await optimizeImage(file);
  return result.file;
}

/**
 * Ruota un'immagine in base all'orientamento EXIF
 */
export async function autoRotateImage(file: File): Promise<File> {
  // TODO: implementare la rotazione automatica in base ai metadati EXIF
  return file;
}