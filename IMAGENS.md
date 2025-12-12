# Gerador de Imagens para Posts

Script para gerar imagens dos artigos do blog usando Gemini AI.

## Setup

1. **API Key já está configurada** no `.env`
2. **Script está pronto** em `generate-blog-image.sh`

## Como Usar

```bash
# Básico (usa padrão 16:9 e 2K)
./generate-blog-image.sh "descrição da imagem" "arquivo.png"

# Completo (especificar proporção e tamanho)
./generate-blog-image.sh "descrição" "arquivo.png" "16:9" "2K"
```

## Exemplos Reais

```bash
# Imagem hero do artigo 6Ps
./generate-blog-image.sh \
  "Diagrama moderno framework 6 pilares vendas B2B: Posicionamento Prospecção Proposta Pitch Processo Performance. Design minimalista azul laranja gradiente profissional" \
  "6ps-vendas-hero.png"

# Comparação CRM
./generate-blog-image.sh \
  "Split screen comparação: Esquerda Excel planilha caótica Direita CRM profissional organizado dashboard moderno. Cores navy verde-limão contraste profissional" \
  "crm-comparison.png" \
  "16:9" \
  "2K"

# Gráfico crescimento
./generate-blog-image.sh \
  "Gráfico crescimento R$ 10k para R$ 100k escalada vendas timeline 12 meses setas ascendentes azul laranja moderno" \
  "10k-100k-growth.png"
```

## Opções

- **aspectRatio**: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`
- **imageSize**: `1K`, `2K`, `4K`

## Saída

Imagens são salvas em: `/Users/joel/Documents/Dev/joelburigo/src/assets/images/blog/`

## Dicas de Prompt

Para melhores resultados:
- Seja específico: cores, estilo, elementos visuais
- Mencione "profissional", "moderno", "editorial" para qualidade
- Use cores da marca: navy, verde-limão #A3FF3F, laranja
- Especifique o tipo: diagrama, gráfico, split screen, workspace
