# Landing Pages - Estrutura de Testes A/B

## 📁 Organização

```
src/pages/lp/
├── README.md                    # Este arquivo
├── vss/                        # Landing pages do VSS
│   ├── index.astro            # Roteador inteligente (A/B test)
│   ├── a.astro                # Versão A (controle)
│   ├── b.astro                # Versão B (variação 1)
│   ├── c.astro                # Versão C (variação 2)
│   └── CHANGELOG.md           # Histórico de mudanças
├── advisory/                   # Landing pages do Advisory
│   ├── index.astro
│   ├── a.astro
│   └── b.astro
└── diagnostico/               # Landing pages do Diagnóstico
    ├── index.astro
    └── a.astro
```

## 🎯 Como Funciona

### 1. Estrutura por Produto/Campanha
Cada produto/serviço tem sua própria pasta dentro de `/lp/`

### 2. Versionamento
- **Versão A** (`a.astro`) - Versão de controle/baseline
- **Versão B** (`b.astro`) - Primeira variação
- **Versão C** (`c.astro`) - Segunda variação
- E assim por diante...

### 3. Roteador Inteligente
O arquivo `index.astro` em cada pasta pode:
- Distribuir tráfego igualmente entre versões (50/50, 33/33/33)
- Redirecionar baseado em query params (`?v=a`, `?v=b`)
- Integrar com ferramentas de A/B testing (Google Optimize, VWO, etc)

## 🚀 URLs de Acesso

### VSS (Vendas Sem Segredos)
- `/lp/vss` - Roteador automático
- `/lp/vss/a` - Versão A (controle)
- `/lp/vss/b` - Versão B (variação)
- `/lp/vss/c` - Versão C (variação)

### Advisory
- `/lp/advisory` - Roteador automático
- `/lp/advisory/a` - Versão A
- `/lp/advisory/b` - Versão B

### Diagnóstico
- `/lp/diagnostico` - Roteador automático
- `/lp/diagnostico/a` - Versão A

## 📊 Estratégias de Teste

### 1. Teste de Headline
- **Versão A**: Headline focada em problema
- **Versão B**: Headline focada em solução
- **Versão C**: Headline focada em resultado

### 2. Teste de CTA
- **Versão A**: CTA "Comprar Agora"
- **Versão B**: CTA "Garantir Minha Vaga"
- **Versão C**: CTA "Começar Transformação"

### 3. Teste de Preço
- **Versão A**: Preço visível no topo
- **Versão B**: Preço apenas no final
- **Versão C**: Sem preço (apenas CTA para falar)

### 4. Teste de Social Proof
- **Versão A**: Depoimentos em vídeo
- **Versão B**: Depoimentos em texto + foto
- **Versão C**: Números e estatísticas

## 🔧 Boas Práticas

1. **Documente cada versão** no `CHANGELOG.md`
2. **Uma mudança por teste** (não teste múltiplas variáveis ao mesmo tempo)
3. **Mantenha consistência** nas versões antigas para referência
4. **Use UTM parameters** para rastrear origem do tráfego
5. **Defina hipótese clara** antes de criar nova versão

## 📈 Tracking e Analytics

Cada landing page deve ter:
- Google Analytics 4 events
- Facebook Pixel events
- Hotjar/Clarity para heatmaps
- UTM parameters obrigatórios

### Query Parameters Recomendados
```
/lp/vss/a?utm_source=facebook&utm_medium=cpc&utm_campaign=vss_jan2025&utm_content=video1
```

## 🎨 Componentes Reutilizáveis

Os componentes das LPs ficam em:
```
src/components/lp/
├── vss/
│   ├── HeroA.astro
│   ├── HeroB.astro
│   ├── PricingA.astro
│   └── PricingB.astro
└── shared/
    ├── LPLayout.astro
    ├── CTAButton.astro
    └── SocialProof.astro
```

## 🚦 Status das Campanhas

| Campanha | Versão Ativa | Status | Conversão | Última Atualização |
|----------|--------------|--------|-----------|-------------------|
| VSS      | A            | 🟢 Live | -         | 2025-12-17       |
| Advisory | -            | ⚪ Não criado | -    | -                |

## 📝 Template para CHANGELOG

```markdown
# Changelog - VSS Landing Pages

## [Versão B] - 2025-12-17
### Hipótese
Adicionar vídeo de explicação aumentará a conversão em 20%

### Mudanças
- Adicionado vídeo do Joel explicando o programa
- Movido preço para seção final
- Adicionado contador de vagas limitadas

### Resultados
- [ ] Aguardando dados (mínimo 1000 visitantes)
- Conversão: -%
- Vencedor: A ou B

## [Versão A] - 2025-12-17
### Baseline
Versão inicial inspirada na LP antiga do VSS
```
