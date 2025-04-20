#!/usr/bin/env node

/**
 * Ottimizzazione delle immagini per ineoutroom.eu
 * 
 * Questo script processa tutte le immagini nella cartella specificata:
 * 1. Converte le immagini in formato WebP e AVIF
 * 2. Ottimizza le immagini originali
 * 3. Ridimensiona le immagini troppo grandi
 * 4. Genera placeholder a bassa risoluzione
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurazione
const config = {
  inputDir: './public/images',
  maxWidth: 1600,             // Larghezza massima per le immagini
  maxHeight: 1200,            // Altezza massima per le immagini
  jpgQuality: 85,             // Qualità JPEG (0-100)
  webpQuality: 80,            // Qualità WebP (0-100)
  avifQuality: 65,            // Qualità AVIF (0-100) 
  maxSizeKB: 500,             // Dimensione massima in KB
  createPlaceholders: true,   // Crea versioni ridotte a bassissima risoluzione
  placeholderSize: 20,        // Larghezza del placeholder
  placeholderSuffix: '-placeholder',
  processExtensions: ['.jpg', '.jpeg', '.png', '.gif']
};

// Verifica se ImageMagick è installato
try {
  execSync('convert -version', { stdio: 'ignore' });
} catch (error) {
  console.error('ImageMagick non trovato! Per installarlo:');
  console.error('- Su Ubuntu/Debian: sudo apt-get install imagemagick');
  console.error('- Su MacOS: brew install imagemagick');
  console.error('- Su Windows: scarica da https://imagemagick.org/script/download.php');
  process.exit(1);
}

// Crea la directory di input se non esiste
if (!fs.existsSync(config.inputDir)) {
  console.log(`Creazione directory ${config.inputDir}`);
  fs.mkdirSync(config.inputDir, { recursive: true });
}

// Ottieni tutte le immagini nella directory
const getImages = (dir) => {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return config.processExtensions.includes(ext);
  }).map(file => path.join(dir, file));
};

// Ottieni le dimensioni dell'immagine
const getImageDimensions = (imagePath) => {
  try {
    const output = execSync(`identify -format "%wx%h" "${imagePath}"`).toString().trim();
    const [width, height] = output.split('x').map(Number);
    return { width, height };
  } catch (error) {
    console.error(`Errore nel leggere le dimensioni di ${imagePath}: ${error.message}`);
    return { width: 0, height: 0 };
  }
};

// Ottieni la dimensione dell'immagine in KB
const getImageSize = (imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    return Math.round(stats.size / 1024);
  } catch (error) {
    console.error(`Errore nel leggere la dimensione di ${imagePath}: ${error.message}`);
    return 0;
  }
};

// Ottimizza e ridimensiona l'immagine originale se necessario
const optimizeOriginal = (imagePath) => {
  const { width, height } = getImageDimensions(imagePath);
  const outputPath = imagePath;
  const ext = path.extname(imagePath).toLowerCase();
  
  // Controlla se l'immagine deve essere ridimensionata
  let resizeOption = '';
  if (width > config.maxWidth || height > config.maxHeight) {
    resizeOption = `-resize ${config.maxWidth}x${config.maxHeight}>`;
  }
  
  // Ottimizza in base al formato
  const sizeBeforeKB = getImageSize(imagePath);
  
  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      execSync(`convert "${imagePath}" ${resizeOption} -sampling-factor 4:2:0 -strip -quality ${config.jpgQuality} -interlace JPEG -colorspace RGB "${outputPath}"`);
    } else if (ext === '.png') {
      execSync(`convert "${imagePath}" ${resizeOption} -strip -quality 90 "${outputPath}"`);
    } else if (ext === '.gif') {
      // GIF non vengono ulteriormente ottimizzati ma solo ridimensionati se necessario
      if (resizeOption) {
        execSync(`convert "${imagePath}" ${resizeOption} "${outputPath}"`);
      }
    }
    
    const sizeAfterKB = getImageSize(outputPath);
    console.log(`Ottimizzato ${path.basename(imagePath)}: ${sizeBeforeKB}KB -> ${sizeAfterKB}KB`);
  } catch (error) {
    console.error(`Errore nell'ottimizzare ${imagePath}: ${error.message}`);
  }
};

// Converti in WebP
const convertToWebP = (imagePath) => {
  const outputPath = imagePath.replace(/\.[^.]+$/, '.webp');
  
  try {
    execSync(`convert "${imagePath}" -quality ${config.webpQuality} "${outputPath}"`);
    const sizeKB = getImageSize(outputPath);
    console.log(`Creato WebP per ${path.basename(imagePath)}: ${sizeKB}KB`);
  } catch (error) {
    console.error(`Errore nella conversione in WebP di ${imagePath}: ${error.message}`);
  }
};

// Converti in AVIF
const convertToAVIF = (imagePath) => {
  const outputPath = imagePath.replace(/\.[^.]+$/, '.avif');
  
  try {
    execSync(`convert "${imagePath}" -quality ${config.avifQuality} "${outputPath}"`);
    const sizeKB = getImageSize(outputPath);
    console.log(`Creato AVIF per ${path.basename(imagePath)}: ${sizeKB}KB`);
  } catch (error) {
    console.error(`Errore nella conversione in AVIF di ${imagePath}: ${error.message}`);
  }
};

// Crea placeholder a bassissima risoluzione
const createPlaceholder = (imagePath) => {
  const ext = path.extname(imagePath);
  const baseName = path.basename(imagePath, ext);
  const dir = path.dirname(imagePath);
  const outputPath = path.join(dir, `${baseName}${config.placeholderSuffix}${ext}`);
  
  try {
    execSync(`convert "${imagePath}" -resize ${config.placeholderSize}x -blur 0x1 -quality 50 "${outputPath}"`);
    console.log(`Creato placeholder per ${path.basename(imagePath)}`);
  } catch (error) {
    console.error(`Errore nella creazione del placeholder per ${imagePath}: ${error.message}`);
  }
};

// Elabora tutte le immagini
const processAllImages = () => {
  console.log("Inizio ottimizzazione immagini...");
  
  const images = getImages(config.inputDir);
  console.log(`Trovate ${images.length} immagini da processare`);
  
  for (const imagePath of images) {
    console.log(`\nProcessing: ${path.basename(imagePath)}`);
    
    // Ottimizza l'originale
    optimizeOriginal(imagePath);
    
    // Converti in WebP
    convertToWebP(imagePath);
    
    // Converti in AVIF
    convertToAVIF(imagePath);
    
    // Crea placeholder
    if (config.createPlaceholders) {
      createPlaceholder(imagePath);
    }
  }
  
  console.log("\nOttimizzazione immagini completata!");
};

// Esegui lo script
processAllImages();