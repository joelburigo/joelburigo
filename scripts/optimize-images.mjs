#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts and optimizes all images to WebP format
 * Generates multiple sizes for responsive images
 */

import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  // Joel's hero image (portrait)
  hero: {
    input: 'joel-burigo-vendas-sem-segredos-2.png',
    sizes: [480, 800, 1200], // Mobile, Tablet, Desktop
    quality: 85,
    format: 'webp',
  },
  // Blog post images (landscape)
  blog: {
    sizes: [1080], // Apenas 1 tamanho - usado no heroImage dos posts
    quality: 80,
    format: 'webp',
  },
  // Small images (testimonials, avatars)
  small: {
    maxSize: 200,
    quality: 85,
    format: 'webp',
  },
  // General images
  general: {
    sizes: [640, 1024, 1920], // Common breakpoints
    quality: 80,
    format: 'webp',
  },
};

// Directories to process
const IMAGE_DIRS = [
  'src/assets/images',
  'src/assets/images/blog',
];

/**
 * Get all image files from directory
 */
function getImages(dir) {
  const fullPath = join(process.cwd(), dir);
  const files = readdirSync(fullPath);
  
  return files
    .filter(file => {
      const ext = extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg'].includes(ext);
    })
    .map(file => ({
      path: join(fullPath, file),
      name: file,
      dir: dir,
    }));
}

/**
 * Determine image category and config
 */
function getImageConfig(filename, originalWidth) {
  // Hero image (Joel's portrait)
  if (filename.includes('joel-burigo-vendas-sem-segredos')) {
    return CONFIG.hero;
  }
  
  // Blog images
  if (filename.includes('blog/')) {
    return CONFIG.blog;
  }
  
  // Small images (testimonials, etc)
  if (originalWidth <= 300) {
    return CONFIG.small;
  }
  
  // General images
  return CONFIG.general;
}

/**
 * Optimize single image
 */
async function optimizeImage(imageInfo) {
  const { path, name, dir } = imageInfo;
  
  console.log(`\n📸 Processing: ${name}`);
  
  try {
    // Get original metadata
    const image = sharp(path);
    const metadata = await image.metadata();
    const originalSize = statSync(path).size;
    
    console.log(`   Original: ${metadata.width}x${metadata.height} (${(originalSize / 1024 / 1024).toFixed(2)}MB)`);
    
    // Get config for this image
    const config = getImageConfig(path, metadata.width);
    
    // Determine sizes to generate
    let sizes = config.sizes || [metadata.width];
    if (config.maxSize) {
      sizes = [Math.min(metadata.width, config.maxSize)];
    }
    
    // Filter out sizes larger than original
    sizes = sizes.filter(size => size <= metadata.width);
    
    // Generate optimized versions
    const outputDir = join(process.cwd(), dir);
    const baseName = basename(name, extname(name));
    
    for (const size of sizes) {
      const outputName = sizes.length > 1 
        ? `${baseName}-${size}w.${config.format}`
        : `${baseName}.${config.format}`;
      
      const outputPath = join(outputDir, outputName);
      
      await sharp(path)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({
          quality: config.quality,
          effort: 6, // 0-6, higher = better compression but slower
        })
        .toFile(outputPath);
      
      const outputSize = statSync(outputPath).size;
      const savings = ((1 - outputSize / originalSize) * 100).toFixed(1);
      
      console.log(`   ✓ ${outputName}: ${(outputSize / 1024).toFixed(1)}KB (-${savings}%)`);
    }
    
    // For hero and blog images, also create AVIF (better compression)
    if (config === CONFIG.hero || config === CONFIG.blog) {
      const avifName = `${baseName}.avif`;
      const avifPath = join(outputDir, avifName);
      
      await sharp(path)
        .resize(Math.max(...sizes), null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .avif({
          quality: config.quality - 5, // AVIF can use slightly lower quality
          effort: 4, // 0-9, higher = better compression but slower
        })
        .toFile(avifPath);
      
      const avifSize = statSync(avifPath).size;
      const avifSavings = ((1 - avifSize / originalSize) * 100).toFixed(1);
      
      console.log(`   ✓ ${avifName}: ${(avifSize / 1024).toFixed(1)}KB (-${avifSavings}%)`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error processing ${name}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log('This will convert all PNG/JPG images to WebP (and AVIF for hero/blog images)');
  console.log('Multiple sizes will be generated for responsive images\n');
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  // Process each directory
  for (const dir of IMAGE_DIRS) {
    const images = getImages(dir);
    
    if (images.length === 0) {
      console.log(`📁 ${dir}: No images found`);
      continue;
    }
    
    console.log(`📁 ${dir}: ${images.length} images found`);
    
    for (const image of images) {
      await optimizeImage(image);
    }
  }
  
  console.log('\n✅ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the optimized images');
  console.log('   2. Update image imports to use .webp files');
  console.log('   3. Consider removing original PNG/JPG files if satisfied');
  console.log('   4. Run npm run build to verify everything works');
}

// Run
main().catch(console.error);
