---
id: "P3.6"
titulo: "FASE 6: AUTOMAÇÃO"
documento: "Parte 3.6 de 11"
versao: "1.1"
autor: "Joel Burigo"
ultima_atualizacao: "2026-01-23"
arquivo: "conteudo/parte3-aulas-fase6.md"

objetivo: |
  Automatizar processos para escalabilidade (Pós-90 dias):
  - Módulo 12: Automações Avançadas (4 aulas)
  - Módulo 13: Agentes de IA Conversacional (4 aulas)
  - Total: 8 aulas | 1h30min

secoes:
  - id: "P3.6.12"
    titulo: "Módulo 12: Automações Avançadas"
  - id: "P3.6.13"
    titulo: "Módulo 13: Agentes de IA Conversacional"

tags: [fase, automação, módulos, aulas, ia, escalabilidade, pós-90-dias]
dependencias: ["P2", "P3.1", "P3.2", "P3.3", "P3.4", "P3.5"]
prox_fase: "P3.7"
fase_anterior: "P3.5"
modulos: [12, 13]
total_aulas: 8
total_tempo: "1h30min"
periodo: "pós-90 dias"
---

[← P3.5: Sistema](parte3-aulas-fase5.md) | [P3: Índice](parte3-roteiro-aulas.md) | [P3.7: Crescimento →](parte3-aulas-fase7.md)

---

# **FASE 6: AUTOMAÇÃO (Semanas 13-14)**

> **Objetivo:** Automatizar processos e implementar IA para escalar operações.

---

## **[P3.6.12] MÓDULO 12 \- Automações Avançadas**

**4 aulas | 1h35min**

### **[P3.6.12.1] Aula 12.1: Workflows Complexos**

**Duração:** 25 minutos 

**Estrutura:**

* \[0-5 min\] Evolução das automações  
  * Básica: 1 gatilho → 1 ação  
  * Avançada: múltiplos gatilhos, condições, ações  
  * Exemplo: "Se lead não abriu e-mail 1, enviar e-mail 2A, senão enviar e-mail 2B"  
* \[5-15 min\] Workflows essenciais:  
* **WORKFLOW 1: Recuperação de Lead Frio**  
  * GATILHO: Lead sem interação há 30 dias  
  * ↓  
  * CONDIÇÃO: Não comprou  
  * ↓  
  * AÇÃO 1: Enviar e-mail "Sentimos sua falta"  
  * ↓  
  * ESPERA: 3 dias  
  * ↓  
  * CONDIÇÃO: Não abriu e-mail  
  * ↓  
  * AÇÃO 2: Enviar SMS  
  * ↓  
  * ESPERA: 2 dias  
  * ↓  
  * CONDIÇÃO: Não respondeu  
  * ↓  
  * AÇÃO 3: Marcar como "Inativo"  
* **WORKFLOW 2: Upsell Inteligente**  
  * GATILHO: Cliente comprou produto básico  
  * ↓  
  * ESPERA: 30 dias  
  * ↓  
  * CONDIÇÃO: NPS \> 8  
  * ↓  
  * AÇÃO 1: Enviar e-mail oferecendo upgrade  
  * ↓  
  * ESPERA: 7 dias  
  * ↓  
  * CONDIÇÃO: Não comprou  
  * ↓  
  * AÇÃO 2: WhatsApp com desconto temporário  
* **WORKFLOW 3: Prevenção de Churn**  
  * GATILHO: Cliente não usa produto há 14 dias  
  * ↓  
  * AÇÃO 1: Notificar gestor de sucesso  
  * ↓  
  * AÇÃO 2: Enviar e-mail "Precisa de ajuda?"  
  * ↓  
  * ESPERA: 3 dias  
  * ↓  
  * CONDIÇÃO: Não respondeu  
  * ↓  
  * AÇÃO 3: Ligar para cliente  
* \[15-22 min\] Construindo no CRM:  
  * Use builder visual (drag and drop)  
  * Teste com contato de teste  
  * Monitore logs (ver o que aconteceu)  
  * Ajuste baseado em performance  
* \[22-25 min\] Erros comuns:  
  * ❌ Workflow muito complexo (confunde)  
  * ❌ Não testar antes de ativar  
  * ❌ Esquecer de adicionar saídas (loop infinito)  
  * ❌ Não monitorar resultados 

**Big Idea:** "Automação avançada \= inteligência operacional." 


**CTA:** Configure workflow de recuperação de lead frio hoje.

---

### **[P3.6.12.2] Aula 12.2: Segmentação Comportamental Automática**

**Duração:** 25 minutos 

**Estrutura:**

* \[0-5 min\] O que é segmentação comportamental  
  * Não segmente só por demografia  
  * Segmente por AÇÕES que lead tomou  
  * Ex: "Abriu 3+ e-mails" \= lead engajado  
  * Mensagens diferentes para comportamentos diferentes  
* \[5-15 min\] Segmentos comportamentais essenciais:  
  * **ENGAJAMENTO:**  
    * 🔥 **Quente:** Abriu 3+ e-mails, visitou site 5+ vezes  
    * 🟡 **Morno:** Abriu 1-2 e-mails, visitou site 1-2 vezes  
    * ❄️ **Frio:** Não abre e-mails, não visita site   
  * **INTENÇÃO DE COMPRA:**  
    * 💰 **Alta:** Visitou página de preços, adicionou ao carrinho  
    * 🤔 **Média:** Visitou página de produto, baixou material  
    * 🔍 **Baixa:** Só visitou homepage   
  * **PRODUTO DE INTERESSE:**  
    * Produto A: Visitou página produto A  
    * Produto B: Visitou página produto B  
    * Indeciso: Visitou ambos   
  * **ESTÁGIO NO FUNIL:**  
    * Topo: Só consumiu conteúdo educacional  
    * Meio: Baixou lead magnet, está em nutrição  
    * Fundo: Agendou reunião, recebeu proposta  
* \[15-22 min\] Aplicando segmentação:  
  * **Segmento "Quente \+ Alta Intenção":**  
    * → Prioridade máxima para vendedor  
    * → Abordagem imediata  
    * → Oferta direta   
  * **Segmento "Morno \+ Média Intenção":**  
    * → Mais nutrição  
    * → Webinar  
    * → Case studies   
  * **Segmento "Frio":**  
    * → Campanha de reativação  
    * → Ou remover da lista (limpar base)  
* \[22-25 min\] Configurando no CRM:  
  * Tags automáticas baseadas em comportamento  
  * Lead scoring (pontuação automática)  
  * Listas dinâmicas (atualizam sozinhas)  
  * Dashboards por segmento 

**Big Idea:** "Trate leads diferentes de forma diferente." 

**CTA:** Configure lead scoring automático no CRM hoje.

---

### **[P3.6.12.3] Aula 12.3: Recuperação de Carrinho e Upsell**

**Duração:** 25 minutos 

**Estrutura:**

* \[0-5 min\] Porque recuperação de carrinho  
  * 70% dos carrinhos são abandonados  
  * Recuperar 10-30% \= receita extra significativa  
  * Cliente já demonstrou interesse  
  * Mais fácil que conquistar novo  
* \[5-15 min\] Sequência de recuperação de carrinho:  
  * **E-mail 1 (1h após abandono):**  
    * Assunto: Esqueceu algo? 🛒  
    * Oi \[Nome\],  
    * Vi que você estava olhando \[Produto\].  
    * Ainda está interessado?  
    * \[Imagem do produto\]  
    * \[Botão: Finalizar Compra\]  
    * Dúvidas? Responda este e-mail.  
  * **E-mail 2 (24h após abandono):**  
    * Assunto: Sobre sua dúvida em \[Produto\]...  
    * \[Nome\],  
    * Muitas pessoas hesitam por \[objeção comum\].  
    * Deixa eu esclarecer:  
    * \[Responder objeção\]  
    * \[Mostrar garantia\]  
    * \[Prova social\]  
    * \[Botão: Finalizar Compra Segura\]  
  * **E-mail 3 (72h após abandono):**  
    * Assunto: Última chance: Bônus exclusivo expira em 24h  
    * \[Nome\],  
    * Não quero que você perca isso.  
    * Se finalizar hoje, você ganha:  
    * \[Bônus especial\]  
    * Expira amanhã às 23:59.  
    * \[Botão: Resgatar Bônus\]  
* \[15-22 min\] Estratégias de upsell:  
  * **Upsell na compra:**  
    * "Clientes que compraram X também levaram Y"  
    * "Upgrade por apenas \+R$ 100"  
    * One-click upsell   
  * **Upsell pós-compra:**  
    * Dia 30: "Gostando? Que tal \[complemento\]?"  
    * Dia 60: "Pronto para o próximo nível? \[Premium\]"  
    * Baseado em uso (se usa muito, oferece mais)  
* \[22-25 min\] Configurando no CRM:  
  * Gatilho: Carrinho abandonado  
  * Sequência automática  
  * Rastreamento de recuperações  
  * A/B test de mensagens 

**Big Idea:** "Carrinho abandonado não é não. É 'talvez mais tarde'." 

**Entregável:**

Sequência Recuperação Carrinho (3 emails: 1h, 24h, 72h pós-abandono - copys prontos)

**CTA:** Configure recuperação de carrinho hoje. Recupere 20%+ em 30 dias.

---

### **[P3.6.12.4] Aula 12.4: Réguas de Relacionamento Inteligentes**

**Duração:** 20 minutos 

**Estrutura:**

* \[0-5 min\] O que são réguas de relacionamento  
  * Comunicação estruturada ao longo do tempo  
  * Não deixa cliente esquecer de você  
  * Mantém relacionamento sem ser invasivo  
  * Aumenta LTV e indicações  
* \[5-15 min\] Réguas por tipo de cliente:  
  * **RÉGUA: Cliente Ativo**  
    * Semanal: Newsletter com conteúdo útil  
    * Mensal: Dica exclusiva ou atualização de produto  
    * Trimestral: Pesquisa de satisfação (NPS)  
    * Anual: Agradecimento \+ surpresa   
  * **RÉGUA: Cliente Inativo (90+ dias sem comprar)**  
    * Dia 90: "Sentimos sua falta"  
    * Dia 95: Oferta especial de reativação  
    * Dia 100: "Última chance antes de te removermos"  
    * Dia 105: Remover ou mover para lista "inativos"   
  * **RÉGUA: Lead Nutrido Mas Não Comprou**  
    * Mensal: Conteúdo de valor (não venda)  
    * Trimestral: Novidade ou case study  
    * Semestral: "Ainda faz sentido receber meus e-mails?"   
  * **RÉGUA: Ex-Cliente (cancelou)**  
    * Imediato: Pesquisa de saída (por que cancelou?)  
    * Dia 30: Oferta de retorno (desconto)  
    * Dia 90: Novidade (se mudou algo que ele pediu)  
    * Dia 180: Limpar da lista  
* \[15-18 min\] Conteúdo das réguas:  
  * 80% valor, 20% venda  
  * Educação \> Promoção  
  * Personalização (nome, histórico)  
  * Tom conversacional  
* \[18-20 min\] Configurando no CRM:  
  * Automação baseada em status  
  * Mudança de status \= muda régua  
  * Relatório de engajamento  
  * Opt-out fácil (sempre dê opção de sair) 

**Big Idea:** "Relacionamento é maratona, não sprint." 

**Entregável:**

Régua Relacionamento Base (4 réguas: cliente ativo, inativo, lead nutrido, ex-cliente)

**CTA:** Configure régua para clientes ativos hoje.

---

### **[P3.6.13] MÓDULO 13 \- Agentes de IA Conversacional**

4 aulas | 1h30min

---

### **[P3.6.13.1] Aula 13.1: O Que São Agentes de IA e Como Funcionam**

**Duração:** 20 minutos 

**Estrutura:**

* \[0-5 min\] Evolução do atendimento  
  * Manual → Chatbot simples → IA conversacional  
  * IA entende contexto e linguagem natural  
  * Não é só FAQ automatizado  
  * Aprende com interações  
* \[5-12 min\] Casos de uso de IA no VSS:  
  * **Qualificação de leads 24/7:**  
    * IA faz perguntas BANT  
    * Qualifica automaticamente  
    * Passa só leads quentes para humano   
  * **Atendimento inicial:**  
    * Responde dúvidas comuns  
    * Agenda reuniões  
    * Envia materiais  
    * Escala para humano quando necessário   
  * **Follow-up persistente:**  
    * IA faz follow-up sem parecer chato  
    * Testa diferentes abordagens  
    * Aprende o que funciona  
  * **Pós-venda:**  
    * Onboarding guiado  
    * Responde dúvidas técnicas  
    * Coleta feedback  
* \[12-17 min\] Como a IA funciona (simplificado):  
  * Treinada com seus dados (FAQs, scripts, conversas)  
  * Entende intenção do cliente  
  * Busca resposta apropriada  
  * Responde de forma natural  
  * Registra tudo no CRM  
* \[17-20 min\] Quando NÃO usar IA:  
  * ❌ Vendas complexas B2B (requer humano)  
  * ❌ Clientes que preferem humano explicitamente  
  * ❌ Situações sensíveis (reclamação séria)  
  * ❌ Quando você não tem dados para treinar

**Big Idea:** "IA não substitui humano. Filtra para o humano focar no que importa." 

**CTA:** Identifique 1 processo repetitivo que IA poderia fazer.

---

### **[P3.6.13.2] Aula 13.2: Configurando Agente de WhatsApp 24/7**

**Duração:** 30 minutos 

**Estrutura:**

* \[0-5 min\] Por que WhatsApp \+ IA  
  * Brasileiro prefere WhatsApp  
  * Cliente quer resposta imediata (não espera dia útil)  
  * IA responde em segundos  
  * Humano assume se IA não souber  
* \[5-18 min\] Configurando agente passo a passo:  
  * **PASSO 1: Conectar WhatsApp ao CRM**  
    * WhatsApp Business API  
    * Número verificado  
    * Integração com CRM   
  * **PASSO 2: Treinar IA com FAQs**  
    * Liste 20-30 perguntas mais comuns  
    * Escreva respostas padrão  
    * IA aprende padrões  
    * Exemplos:  
      * "Quanto custa?" → Resposta sobre preço  
      * "Como funciona?" → Explicação do serviço  
      * "Tem garantia?" → Detalhes da garantia   
  * **PASSO 3: Definir fluxo de conversa**  
    * CLIENTE: Olá  
    * IA: Oi\! Sou assistente virtual da \[Empresa\]. Como posso ajudar?  
    * CLIENTE: Quanto custa?  
    * IA: Nosso investimento começa em R$ \[X\].   
    * Inclui \[benefícios\].  
    * Quer saber mais detalhes?  
    * CLIENTE: Sim  
    * IA: Ótimo\! Para te ajudar melhor:  
    * \- Qual seu nome?  
    * \- Que tipo de empresa você tem?  
    * \- Qual seu maior desafio hoje?  
    * \[IA qualifica\]  
    * IA: Perfeito \[Nome\]\!   
    * Vou te conectar com \[Vendedor\] que é especialista nisso.  
    * Ele te responde em até 5 minutos. Aguarde\!  
    * \[Notifica vendedor humano\]  
  * **PASSO 4: Configurar handoff (IA → Humano)**  
    * IA identifica quando não sabe responder  
    * Passa para humano com contexto completo  
    * Humano vê histórico da conversa  
    * Continua de onde IA parou   
  * **PASSO 5: Testar exaustivamente**  
    * Faça 20 perguntas diferentes  
    * Tente confundir a IA  
    * Veja se handoff funciona  
    * Ajuste respostas confusas  
* \[18-25 min\] Boas práticas:  
  * ✅ IA se apresenta como assistente virtual (transparência)  
  * ✅ Oferece opção de falar com humano sempre  
  * ✅ Tom amigável mas profissional  
  * ✅ Respostas curtas (2-3 frases)  
  * ✅ Usa emojis com moderação  
  * ❌ Não finge ser humano (antiético)  
  * ❌ Não inventa informações  
  * ❌ Não promete o que não pode cumprir  
* \[25-30 min\] Monitoramento:  
  * Taxa de resolução (% que IA resolveu sozinha)  
  * Taxa de handoff (% que passou para humano)  
  * Satisfação do cliente  
  * Perguntas que IA não soube responder (treinar)

**Big Idea:** "IA bem treinada \= 70% dos atendimentos resolvidos automaticamente." 


**CTA:** Configure agente básico esta semana. Teste por 7 dias.

---

### **[P3.6.13.3] Aula 13.3: Handoff Inteligente (IA → Humano)**

**Duração:** 20 minutos **Estrutura:**

* \[0-5 min\] Por que handoff é crítico  
  * IA não resolve tudo  
  * Transição ruim \= cliente irritado  
  * Transição boa \= cliente nem percebe  
  * Humano precisa de contexto completo  
* \[5-12 min\] Gatilhos de handoff:  
  * **Handoff obrigatório:**  
    * Cliente pede falar com humano  
    * Cliente está irritado (detecção de sentimento)  
    * Pergunta muito específica/técnica  
    * Negociação de preço  
    * Reclamação séria   
  * **Handoff opcional:**  
    * Lead muito qualificado (alto score)  
    * Cliente VIP  
    * Oportunidade de alto valor  
* \[12-17 min\] Fluxo de handoff ideal:  
  * IA: Vou te conectar com \[Nome Vendedor\], especialista nisso.  
  * \[IA passa para humano com resumo\]  
  * RESUMO PARA VENDEDOR (backend):  
  * \---  
  * Nome: João Silva  
  * Empresa: ABC Ltda  
  * Dor: \[descrição\]  
  * Perguntas feitas: \[lista\]  
  * Score: 8/10 (Quente)  
  * \---  
  * VENDEDOR: Oi João\! Vi que você perguntou sobre \[X\].  
  * \[Vendedor já sabe tudo, continua conversa\]  
* \[17-20 min\] Configurando no CRM:  
  * Regras de handoff claras  
  * Notificação instantânea ao vendedor  
  * Histórico completo visível  
  * Vendedor vê score e contexto  
  * Cliente não precisa repetir nada

**Big Idea:** "Handoff perfeito \= cliente nem percebe que trocou de IA para humano."


**CTA:** Teste handoff hoje. IA → Você. Experiência suave?

---

### **[P3.6.13.4] Aula 13.4: Treinando e Otimizando Seu Agente**

**Duração:** 20 minutos 

**Estrutura:**

* \[0-5 min\] IA não é "configure e esqueça"  
  * Precisa de treinamento contínuo  
  * Aprende com novos dados  
  * Melhora com feedback  
  * Evolução constante  
* \[5-12 min\] Como treinar melhor:  
  * **Revisar conversas semanalmente:**  
    * Ler 20 conversas aleatórias  
    * Identificar erros da IA  
    * Identificar perguntas não respondidas  
    * Adicionar novos FAQs   
  * **Análise de sentimento:**  
    * Cliente saiu satisfeito?  
    * Cliente ficou frustrado?  
    * O que causou frustração?  
    * Como melhorar?   
  * **Testes A/B:**  
    * Versão A: Tom formal  
    * Versão B: Tom casual  
    * Qual converte mais?  
    * Implementar vencedor  
* \[12-17 min\] Métricas de sucesso:  
  * **Taxa de resolução:** 70%+ (IA resolveu sozinha)  
  * **Satisfação:** NPS \> 8  
  * **Tempo médio:** \< 3 minutos  
  * **Taxa de abandono:** \< 10%  
  * **Conversões:** Leads qualificados gerados  
* \[17-20 min\] Evolução gradual:  
  * Mês 1: IA responde básico  
  * Mês 2: IA qualifica leads  
  * Mês 3: IA agenda reuniões  
  * Mês 6: IA faz upsell simples  
  * Não tente tudo de uma vez 

**Big Idea:** "IA evolui como humano: com prática e feedback." 

**CTA:** Agende revisão semanal de conversas da IA. 30 min toda sexta.

---

**📊 RESUMO DA FASE 6:**

| Módulo | Aulas | Tempo | Entregáveis MVP |
|--------|-------|-------|------------------------|
| M12 - Automações Avançadas | 4 | 1h35 | #26 Sequência Recuperação Carrinho, #27 Régua Relacionamento |
| **TOTAL FASE 6** | **4** | **1h35** | **2 ferramentas essenciais** |

---

