#!/usr/bin/env node
/**
 * Script para gerar áudios dos posts do blog usando ElevenLabs
 * 
 * Uso:
 * 1. Adicionar ELEVENLABS_API_KEY no .env
 * 2. Rodar: node scripts/generate-audio-posts.mjs
 * 
 * Opções:
 * --all: Gera áudio para todos os posts
 * --post <slug>: Gera áudio para post específico
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'luS7emxs7T0hCBde2NTQ'; // Premium voice - Creator tier

// Diretórios
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '../public/audio/blog');

// Criar diretório de áudio se não existir
if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
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
 * Gera áudio usando ElevenLabs API
 */
async function generateAudio(text, outputPath, postSlug) {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY não encontrada no .env');
    process.exit(1);
  }

  console.log(`🎙️  Gerando áudio para: ${postSlug}`);
  console.log(`📝 Caracteres: ${text.length}`);
  
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    console.log(`✅ Áudio gerado: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao gerar áudio: ${error.message}`);
    return false;
  }
}

/**
 * Processa post individual
 */
async function processPost(postFile) {
  const postSlug = postFile.replace('.md', '');
  const postPath = path.join(BLOG_DIR, postFile);
  const audioPath = path.join(AUDIO_OUTPUT_DIR, `${postSlug}.mp3`);
  
  // Verifica se áudio já existe
  if (fs.existsSync(audioPath)) {
    console.log(`⏭️  Áudio já existe: ${postSlug}.mp3`);
    return true;
  }
  
  // Extrai conteúdo
  const content = extractContentFromMarkdown(postPath);
  
  if (content.length < 100) {
    console.log(`⚠️  Conteúdo muito curto, pulando: ${postSlug}`);
    return false;
  }
  
  // Limite de caracteres por request (Creator tier aceita até 10.000)
  const maxChars = 10000;
  const textToConvert = content.length > maxChars 
    ? content.substring(0, maxChars) + '...' 
    : content;
  
  // Gera áudio
  return await generateAudio(textToConvert, audioPath, postSlug);
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🎧 ElevenLabs Audio Generator para Blog');
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
  
  for (const postFile of allPosts) {
    const success = await processPost(postFile);
    if (success) processed++;
    else errors++;
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=====================================');
  console.log(`✅ Processados: ${processed}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📁 Áudios salvos em: ${AUDIO_OUTPUT_DIR}`);
}

main().catch(console.error);
