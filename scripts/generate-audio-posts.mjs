#!/usr/bin/env node
/**
 * Script para gerar áudios dos posts do blog usando OpenAI TTS
 * 
 * Uso:
 * 1. Adicionar OPENAI_API_KEY no .env
 * 2. Rodar: node scripts/generate-audio-posts.mjs
 * 
 * Opções:
 * --all: Gera áudio para todos os posts
 * --post <slug>: Gera áudio para post específico
 * 
 * Requer: ffmpeg instalado para concatenar áudios longos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VOICE = 'onyx'; // Masculina grave - boa para português
const MODEL = 'tts-1-hd'; // Melhor qualidade

// Pricing OpenAI TTS (USD por 1M caracteres)
const PRICE_PER_MILLION_CHARS = MODEL === 'tts-1-hd' ? 30.00 : 15.00;

// Taxa de conversão USD para BRL (atualizar conforme necessário)
const USD_TO_BRL = 5.50;

// Diretórios
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio/blog');

// Criar diretório de áudio se não existir
if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

/**
 * Calcula o custo em USD baseado no número de caracteres
 */
function calculateCost(chars) {
  return (chars / 1000000) * PRICE_PER_MILLION_CHARS;
}

/**
 * Extrai conteúdo limpo do markdown (sem frontmatter e índice)
 */
function extractContentFromMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  
  // Remove índice (## Índice ... até próximo ##)
  const withoutIndex = withoutFrontmatter.replace(/## Índice[\s\S]*?(?=\n##[^#]|\n<a name=|$)/i, '');
  
  // Remove código
  const withoutCode = withoutIndex.replace(/```[\s\S]*?```/g, '');
  
  // Remove links markdown mas mantém texto
  const withoutLinks = withoutCode.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove imagens
  const withoutImages = withoutLinks.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  
  // Remove HTML tags e âncoras
  const withoutHTML = withoutImages.replace(/<[^>]+>/g, '');
  
  // Remove marcadores markdown
  const cleanText = withoutHTML
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Code inline
    .replace(/^[-*]\s/gm, '') // Lista
    .replace(/^\d+\.\s/gm, '') // Lista numerada
    .replace(/^>\s/gm, '') // Blockquote
    .replace(/---+/g, '') // Separadores
    .trim();
  
  return cleanText;
}

/**
 * Divide texto em chunks menores, tentando quebrar em parágrafos/frases
 */
function splitTextIntoChunks(text, maxChars = 4000) {
  const chunks = [];
  let remainingText = text;
  
  while (remainingText.length > maxChars) {
    let chunkEnd = maxChars;
    
    // Tenta quebrar em parágrafo duplo
    const doubleNewline = remainingText.lastIndexOf('\n\n', maxChars);
    if (doubleNewline > maxChars * 0.7) {
      chunkEnd = doubleNewline + 2;
    } else {
      // Tenta quebrar em parágrafo simples
      const singleNewline = remainingText.lastIndexOf('\n', maxChars);
      if (singleNewline > maxChars * 0.7) {
        chunkEnd = singleNewline + 1;
      } else {
        // Tenta quebrar em ponto final
        const period = remainingText.lastIndexOf('. ', maxChars);
        if (period > maxChars * 0.7) {
          chunkEnd = period + 2;
        }
      }
    }
    
    chunks.push(remainingText.substring(0, chunkEnd).trim());
    remainingText = remainingText.substring(chunkEnd).trim();
  }
  
  if (remainingText.length > 0) {
    chunks.push(remainingText);
  }
  
  return chunks;
}

/**
 * Concatena múltiplos arquivos de áudio usando ffmpeg
 */
async function concatenateAudioFiles(inputFiles, outputPath) {
  const tempDir = path.dirname(outputPath);
  const listFile = path.join(tempDir, 'concat-list.txt');
  
  // Cria arquivo de lista para ffmpeg
  const listContent = inputFiles.map(file => `file '${file}'`).join('\n');
  fs.writeFileSync(listFile, listContent);
  
  try {
    // Concatena usando ffmpeg
    await execPromise(`ffmpeg -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}" -y`);
    
    // Remove arquivo de lista e arquivos temporários
    fs.unlinkSync(listFile);
    inputFiles.forEach(file => fs.unlinkSync(file));
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao concatenar áudios: ${error.message}`);
    // Limpa arquivos mesmo em caso de erro
    if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
    inputFiles.forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    return false;
  }
}

/**
 * Gera áudio usando OpenAI TTS API
 */
async function generateAudio(text, outputPath, postSlug) {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não encontrada no .env');
    process.exit(1);
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          voice: VOICE,
          input: text,
          response_format: 'mp3'
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao gerar áudio: ${error.message}`);
    return false;
  }
}

/**
 * Processa post individual
 * @returns {Promise<{success: boolean, cost: number}>}
 */
async function processPost(postFile) {
  const postSlug = postFile.replace('.md', '');
  const postPath = path.join(BLOG_DIR, postFile);
  const audioPath = path.join(AUDIO_OUTPUT_DIR, `${postSlug}.mp3`);
  
  console.log(`\n📄 Processando: ${postSlug}`);
  
  // Verifica se áudio já existe
  if (fs.existsSync(audioPath)) {
    console.log(`⏭️  Áudio já existe, pulando...`);
    return { success: true, cost: 0 };
  }
  
  // Extrai conteúdo
  const content = extractContentFromMarkdown(postPath);
  
  if (content.length < 100) {
    console.log(`⚠️  Conteúdo muito curto, pulando: ${postSlug}`);
    return { success: false, cost: 0 };
  }
  
  // Limite de caracteres por request (OpenAI tem limite de 4096)
  const maxChars = 4000;
  
  // Se texto é curto, gera diretamente
  if (content.length <= maxChars) {
    const cost = calculateCost(content.length);
    console.log(`📝 Conteúdo: ${content.length} chars`);
    const success = await generateAudio(content, audioPath, postSlug);
    if (success) {
      console.log(`💰 Custo: $${cost.toFixed(4)} USD (R$ ${(cost * USD_TO_BRL).toFixed(2)})`);
    }
    return { success, cost: success ? cost : 0 };
  }
  
  // Post longo - divide em chunks e concatena
  console.log(`📚 Post muito longo (${content.length} chars), dividindo em partes...`);
  const chunks = splitTextIntoChunks(content, maxChars);
  console.log(`📦 ${chunks.length} chunks gerados`);
  
  let totalCost = 0;
  
  // Gera áudio para cada chunk
  const tempAudioFiles = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkPath = path.join(AUDIO_OUTPUT_DIR, `${postSlug}-chunk-${i}.mp3`);
    const chunkCost = calculateCost(chunks[i].length);
    totalCost += chunkCost;
    
    console.log(`\n🎙️  Gerando chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars) - $${chunkCost.toFixed(4)}`);
    
    const success = await generateAudio(chunks[i], chunkPath, `${postSlug}-chunk-${i}`);
    if (!success) {
      // Limpa chunks já gerados em caso de erro
      tempAudioFiles.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      return { success: false, cost: 0 };
    }
    
    tempAudioFiles.push(chunkPath);
  }
  
  // Concatena todos os chunks em um único arquivo
  console.log(`\n🔗 Concatenando ${chunks.length} partes...`);
  const success = await concatenateAudioFiles(tempAudioFiles, audioPath);
  
  if (success) {
    console.log(`✅ Áudio completo gerado: ${audioPath}`);
    console.log(`💰 Custo total: $${totalCost.toFixed(4)} USD (R$ ${(totalCost * USD_TO_BRL).toFixed(2)}) - ${content.length} chars`);
  }
  
  return { success, cost: success ? totalCost : 0 };
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🎧 OpenAI TTS Audio Generator para Blog');
  console.log('=====================================\n');
  
  // Opção: post específico
  if (args.includes('--post')) {
    const postIndex = args.indexOf('--post');
    const postSlug = args[postIndex + 1];
    
    if (!postSlug) {
      console.error('❌ Especifique o slug do post: --post <slug>');
      process.exit(1);
    }
    
    const postFile = `${postSlug}.md`;
    if (!fs.existsSync(path.join(BLOG_DIR, postFile))) {
      console.error(`❌ Post não encontrado: ${postFile}`);
      process.exit(1);
    }
    
    await processPost(postFile);
    return;
  }
  
  // Opção: todos os posts
  const allPosts = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  
  console.log(`📚 Encontrados ${allPosts.length} posts\n`);
  
  let processed = 0;
  let errors = 0;
  let totalCost = 0;
  
  for (const postFile of allPosts) {
    const result = await processPost(postFile);
    if (result.success) {
      processed++;
      totalCost += result.cost;
    } else {
      errors++;
    }
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log(`✅ Processados: ${processed}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`💰 Custo total da sessão: $${totalCost.toFixed(4)} USD (R$ ${(totalCost * USD_TO_BRL).toFixed(2)})`);
  console.log(`📁 Áudios salvos em: ${AUDIO_OUTPUT_DIR}`);
}

main().catch(console.error);
