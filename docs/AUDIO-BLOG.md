# Audio Blog com ElevenLabs

Sistema de narração automática dos posts do blog usando ElevenLabs AI.

## Setup

1. **Criar conta ElevenLabs** (tem trial gratuito)
   - Acesse: https://elevenlabs.io
   - Crie conta e pegue API key em: https://elevenlabs.io/app/settings/api-keys

2. **Configurar .env**
   ```bash
   ELEVENLABS_API_KEY=sk_sua_chave_aqui
   ```

3. **Gerar áudios**
   ```bash
   # Gerar áudios de todos os posts
   npm run audio:generate
   
   # Gerar áudio de post específico
   npm run audio:post 6ps-vendas-escalaveis-guia-completo
   ```

## Características

- ✅ Voz natural em português brasileiro
- ✅ Player customizado com controles
- ✅ Controle de velocidade (0.75x - 2x)
- ✅ Barra de progresso visual
- ✅ Design integrado ao tema do site
- ✅ Responsivo mobile/desktop

## Custos

**ElevenLabs Free Tier:**
- 10,000 caracteres/mês grátis
- ~1-2 posts longos

**Plano Creator ($22/mês):**
- 100,000 caracteres/mês
- ~15-20 posts longos
- Vozes premium

## Vozes Disponíveis

Voz configurada: **Adam** (pNInz6obpgDQGcFmaJgB)
- Voz masculina brasileira
- Tom natural e profissional
- Ideal para conteúdo educacional

Para trocar a voz:
1. Explorar vozes: https://elevenlabs.io/voice-library
2. Alterar `VOICE_ID` em `scripts/generate-audio-posts.mjs`

## Estrutura

```
├── scripts/
│   └── generate-audio-posts.mjs  # Script gerador
├── src/
│   └── components/
│       └── blog/
│           └── AudioPlayer.astro  # Player component
└── public/
    └── audio/
        └── blog/
            ├── post-1.mp3
            ├── post-2.mp3
            └── ...
```

## Limitações

- Máximo 5000 caracteres por request (posts longos são truncados)
- Rate limit: 1 request/segundo no script
- Áudios não são versionados (adicionar ao .gitignore se muito grandes)

## Tips

**Otimizar custos:**
- Gerar áudios só para posts featured
- Usar cache (áudios já gerados não são regerados)
- Configurar CI/CD para gerar automático em novos posts

**Melhorar qualidade:**
- Revisar texto antes de gerar (remover links, códigos)
- Ajustar `stability` e `similarity_boost` no script
- Testar diferentes vozes
