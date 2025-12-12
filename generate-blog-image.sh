#!/bin/bash

###############################################################################
# GERADOR DE IMAGENS PARA POSTS DO BLOG
###############################################################################
# 
# USO:
#   ./generate-blog-image.sh "prompt da imagem" "nome-arquivo.png" [aspectRatio] [imageSize]
#
# EXEMPLOS:
#   ./generate-blog-image.sh "Diagrama 6 pilares vendas" "6ps-hero.png"
#   ./generate-blog-image.sh "Gráfico CRM vs Excel" "crm-comparison.png" "16:9" "2K"
#
# PARÂMETROS:
#   $1 - prompt       : Descrição detalhada da imagem desejada (OBRIGATÓRIO)
#   $2 - fileName     : Nome do arquivo de saída (OBRIGATÓRIO)
#   $3 - aspectRatio  : Proporção da imagem (opcional, padrão: "16:9")
#                       Opções: "1:1", "16:9", "9:16", "4:3", "3:4"
#   $4 - imageSize    : Tamanho da imagem (opcional, padrão: "2K")
#                       Opções: "1K", "2K", "4K"
#
# DEPENDÊNCIAS:
#   - npx (Node.js)
#   - mcp-image (instalado automaticamente via npx)
#   - GEMINI_API_KEY no arquivo .env na raiz do projeto
#
# SAÍDA:
#   - Imagem salva em: /Users/joel/Documents/Dev/joelburigo/public/images/
#
###############################################################################

# Diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Carregar variáveis de ambiente
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
else
    echo "❌ ERRO: Arquivo .env não encontrado em $PROJECT_ROOT"
    echo "   Crie o arquivo .env com: GEMINI_API_KEY=\"sua-key-aqui\""
    exit 1
fi

# Validar API Key
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ ERRO: GEMINI_API_KEY não encontrada no .env"
    exit 1
fi

# Validar parâmetros obrigatórios
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ ERRO: Parâmetros obrigatórios faltando"
    echo ""
    echo "USO: $0 \"prompt\" \"arquivo.png\" [aspectRatio] [imageSize]"
    echo ""
    echo "EXEMPLO:"
    echo "  $0 \"Diagrama moderno com 6 pilares de vendas\" \"6ps-hero.png\""
    exit 1
fi

# Parâmetros
PROMPT="$1"
FILE_NAME="$2"
ASPECT_RATIO="${3:-16:9}"
IMAGE_SIZE="${4:-2K}"
IMAGE_OUTPUT_DIR="/Users/joel/Documents/Dev/joelburigo/src/assets/images/blog"

# Criar diretório de saída se não existir
mkdir -p "$IMAGE_OUTPUT_DIR"

echo "🎨 Gerando imagem..."
echo "   Prompt: $PROMPT"
echo "   Arquivo: $FILE_NAME"
echo "   Proporção: $ASPECT_RATIO"
echo "   Tamanho: $IMAGE_SIZE"
echo "   Destino: $IMAGE_OUTPUT_DIR"
echo ""

# Gerar imagem via mcp-image com Gemini
export IMAGE_OUTPUT_DIR

echo "{
  \"jsonrpc\": \"2.0\",
  \"method\": \"tools/call\",
  \"params\": {
    \"name\": \"generate_image\",
    \"arguments\": {
      \"prompt\": \"$PROMPT\",
      \"fileName\": \"$FILE_NAME\",
      \"aspectRatio\": \"$ASPECT_RATIO\",
      \"imageSize\": \"$IMAGE_SIZE\"
    }
  },
  \"id\": 1
}" | npx -y mcp-image 2>&1 | grep -A50 '"result"' | tail -20

# Verificar se a imagem foi criada
if [ -f "$IMAGE_OUTPUT_DIR/$FILE_NAME" ]; then
    echo ""
    echo "✅ Imagem gerada com sucesso!"
    echo "   📁 $IMAGE_OUTPUT_DIR/$FILE_NAME"
    
    # Mostrar tamanho do arquivo
    FILE_SIZE=$(ls -lh "$IMAGE_OUTPUT_DIR/$FILE_NAME" | awk '{print $5}')
    echo "   📊 Tamanho: $FILE_SIZE"
else
    echo ""
    echo "⚠️  Imagem não encontrada. Verifique os logs acima."
    exit 1
fi
