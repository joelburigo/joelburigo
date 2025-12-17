# 🚀 Guia Rápido - Testes A/B de Landing Pages

## 📍 Acesso Rápido

### URLs Principais
- **VSS Versão A (Controle)**: `/lp/vss/a`
- **VSS Roteador A/B**: `/lp/vss` (distribui tráfego automaticamente)
- **VSS com query param**: `/lp/vss?v=a` (força versão específica)

## 🎯 Como Criar um Novo Teste A/B

### Passo 1: Copiar o Template
```bash
cp src/pages/lp/vss/_template.astro src/pages/lp/vss/b.astro
```

### Passo 2: Atualizar o Arquivo
```javascript
// Em b.astro, mude:
const VERSION = 'b'  // Era 'TEMPLATE'

// E importe o componente com suas mudanças:
import VSSLandingPageB from '../../../components/lp/vss/LandingPageB.astro'
```

### Passo 3: Criar Componente da Variação
```bash
# Copie o componente original
cp src/components/pages/VSSLandingPage.astro src/components/lp/vss/LandingPageB.astro
```

Faça suas mudanças no `LandingPageB.astro` (apenas UMA mudança principal por teste!)

### Passo 4: Documentar no CHANGELOG
```markdown
## [Versão B] - 2025-12-17
### Hipótese
Adicionar vídeo VSL no hero aumentará a conversão em 20%

### Mudanças
- Adicionado vídeo de 5min do Joel explicando o VSS
- Removido imagem estática do hero
```

### Passo 5: Ativar o Teste A/B
Em `src/pages/lp/vss/index.astro`:
```javascript
const AB_TEST_CONFIG = {
  enabled: true,           // ✅ Ativar
  versions: ['a', 'b'],   // Versões no teste
  distribution: [50, 50], // 50% cada
};
```

## 🧪 Testar Localmente

```bash
# Ver versão A
http://localhost:4321/lp/vss/a

# Ver versão B
http://localhost:4321/lp/vss/b

# Testar roteador (vai alternar aleatoriamente)
http://localhost:4321/lp/vss

# Forçar versão com query param
http://localhost:4321/lp/vss?v=b
```

## 📊 Monitorar Resultados

### Google Analytics 4
Os eventos automáticos rastreados:
- `cta_click` - Cliques em botões de conversão
- `scroll_depth` - 25%, 50%, 75%, 100%
- `time_on_page` - Tempo total na página

### Data Layer
Cada página envia:
```javascript
{
  pageType: 'landing-page',
  product: 'vss',
  version: 'a' ou 'b',
  testGroup: 'control' ou 'variation'
}
```

## 🎨 Estrutura de Componentes

```
src/components/lp/
├── LPLayout.astro          # Layout base (sem header/footer)
├── vss/
│   ├── LandingPageA.astro  # ← Original (controle)
│   ├── LandingPageB.astro  # ← Variação 1
│   ├── HeroA.astro         # Seção específica
│   └── HeroB.astro         # Variação da seção
└── shared/
    ├── CTAButton.astro     # Componentes compartilhados
    └── SocialProof.astro
```

## ✅ Checklist para Novo Teste

- [ ] Definir hipótese clara
- [ ] Copiar template e renomear
- [ ] Criar componente da variação
- [ ] Atualizar VERSION no arquivo
- [ ] Documentar no CHANGELOG.md
- [ ] Testar localmente ambas versões
- [ ] Ativar teste no index.astro
- [ ] Configurar distribuição de tráfego
- [ ] Verificar analytics funcionando
- [ ] Esperar mínimo 500-1000 visitas
- [ ] Analisar significância estatística
- [ ] Declarar vencedor no CHANGELOG

## 🏆 Critérios de Sucesso

### Mínimos para Teste Válido
- **Visitantes**: Mínimo 500 por versão (1000 total)
- **Conversões**: Mínimo 30 por versão
- **Duração**: Mínimo 7 dias (1 ciclo semanal completo)
- **Significância**: p-value < 0.05 (95% confiança)

### Calculadora de Significância
Use: [https://abtestguide.com/calc/](https://abtestguide.com/calc/)

## 💡 Boas Práticas

### ✅ FAÇA
- Teste UMA mudança por vez
- Documente TUDO no CHANGELOG
- Espere tempo suficiente para dados válidos
- Use query params para QA (`?v=a` ou `?v=b`)
- Mantenha versões antigas para referência

### ❌ NÃO FAÇA
- Múltiplas mudanças ao mesmo tempo
- Parar teste antes de ter dados suficientes
- Confiar em "palpites" sem dados
- Deletar versões antigas
- Ignorar sazonalidade (Black Friday, etc)

## 🔧 Comandos Úteis

```bash
# Criar nova versão rapidamente
npm run lp:create vss c

# Listar todas as LPs
ls -la src/pages/lp/

# Ver diff entre versões
diff src/components/lp/vss/LandingPageA.astro src/components/lp/vss/LandingPageB.astro

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📱 UTM Tracking

### Estrutura recomendada
```
/lp/vss/a?utm_source=facebook&utm_medium=cpc&utm_campaign=vss_jan2025&utm_content=video1&utm_term=vendas-b2b
```

### Parâmetros obrigatórios
- `utm_source` - facebook, google, instagram, etc
- `utm_medium` - cpc, email, organic, social
- `utm_campaign` - nome da campanha

### Exemplo completo
```
https://joelburigo.com/lp/vss/a?utm_source=facebook&utm_medium=cpc&utm_campaign=vss_fundo_funil_jan2025&utm_content=headline_problema&utm_term=vendas-escaláveis&v=a
```

## 🆘 Troubleshooting

### Teste não distribui tráfego
- Verifique se `enabled: true` no index.astro
- Confirme que soma de distribution = 100
- Limpe cache do navegador

### Analytics não rastreia
- Verifique console do navegador
- Confirme que GA4/Pixel estão configurados
- Teste em modo anônimo

### Versão não carrega
- Confirme que arquivo existe (a.astro, b.astro)
- Verifique erros no terminal
- Faça rebuild: `npm run build`

## 📚 Recursos Úteis

- [Google Optimize](https://optimize.google.com/)
- [AB Test Guide](https://abtestguide.com/)
- [CXL A/B Testing Guide](https://cxl.com/blog/ab-testing-guide/)
- [Hotjar Heatmaps](https://www.hotjar.com/)
