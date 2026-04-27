import type { Metadata } from 'next';
import { Container } from '@/components/patterns/container';
import { contactInfo } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como a Growth Master LTDA coleta, usa e protege seus dados (LGPD).',
  alternates: { canonical: '/privacidade' },
};

const LAST_UPDATE = '25 de abril de 2026';
const DPO_EMAIL = 'joel@growthmaster.com.br';

export default function PrivacidadePage() {
  return (
    <main className="bg-ink relative overflow-hidden">
      <div className="grid-overlay" />
      <section className="section relative z-10">
        <Container size="md" className="flex flex-col gap-10">
          <header className="flex flex-col gap-4">
            <span className="kicker text-acid">// PRIVACIDADE</span>
            <h1 className="text-display-sm text-cream">Política de Privacidade</h1>
            <p className="text-fg-3 font-mono text-[11px] tracking-[0.22em] uppercase">
              Última atualização: {LAST_UPDATE} · LGPD (Lei 13.709/18)
            </p>
          </header>

          <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-cream prose-p:text-fg-2 prose-p:leading-relaxed prose-strong:text-cream prose-a:text-acid prose-a:no-underline hover:prose-a:underline prose-li:text-fg-2 prose-li:marker:text-fire">
            <h2>1. Quem é o controlador</h2>
            <p>
              <strong>{contactInfo.company.legalName}</strong>, CNPJ {contactInfo.company.cnpj},
              é o controlador dos seus dados pessoais. Joel Burigo atua como{' '}
              <strong>encarregado de proteção de dados (DPO)</strong>: <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
            </p>

            <h2>2. Quais dados coletamos</h2>
            <ul>
              <li>
                <strong>Cadastro:</strong> nome, email, WhatsApp, empresa, segmento, faturamento
                aproximado (informados nos formulários de contato, diagnóstico 6Ps e onboarding
                VSS).
              </li>
              <li>
                <strong>Pagamento:</strong> os dados financeiros (cartão, CPF/CNPJ pra Pix) são
                coletados <em>diretamente</em> pelo Mercado Pago ou Stripe — não passam pelos
                nossos servidores. Recebemos apenas confirmação de status e dados mínimos pra
                emissão de NF.
              </li>
              <li>
                <strong>Comportamento na plataforma:</strong> progresso nos destravamentos VSS,
                conversas com o agente IA (armazenadas pra sua continuidade — não são usadas pra
                treinar modelos externos), tempo gasto, artifacts gerados.
              </li>
              <li>
                <strong>Analytics:</strong> métricas anônimas de navegação via Google Tag Manager,
                Google Analytics 4 e Meta Pixel (cookies opcionais — você pode desabilitar).
              </li>
              <li>
                <strong>Logs técnicos:</strong> IP, user-agent e timestamps em formulários e
                autenticação por magic link, pra detecção de fraude.
              </li>
            </ul>

            <h2>3. Bases legais (LGPD art. 7)</h2>
            <ul>
              <li>
                <strong>Execução de contrato:</strong> dados necessários pra entregar VSS e
                Advisory.
              </li>
              <li>
                <strong>Consentimento:</strong> envio de email marketing e push de novidades. Você
                pode revogar a qualquer momento (link unsubscribe em todo email).
              </li>
              <li>
                <strong>Legítimo interesse:</strong> analytics agregada e prevenção de fraude.
              </li>
              <li>
                <strong>Obrigação legal:</strong> emissão de nota fiscal e retenção fiscal.
              </li>
            </ul>

            <h2>4. Com quem compartilhamos</h2>
            <p>
              Dados são compartilhados <em>apenas</em> com prestadores essenciais à operação:
            </p>
            <ul>
              <li>
                <strong>Mercado Pago / Stripe</strong> — processamento de pagamento.
              </li>
              <li>
                <strong>Brevo</strong> — envio de email transacional e marketing.
              </li>
              <li>
                <strong>Cloudflare</strong> — CDN, proteção DDoS, Stream (mentorias gravadas) e
                Turnstile (anti-bot).
              </li>
              <li>
                <strong>OpenAI / Anthropic</strong> — chat com agente IA. Mensagens são enviadas
                pra inferência. Esses provedores se comprometem a não usar os dados pra treinar
                modelos (data processing agreements vigentes).
              </li>
              <li>
                <strong>Google</strong> — Google Calendar (somente se você autorizar OAuth pra
                sincronizar suas sessões Advisory) e Analytics.
              </li>
              <li>
                <strong>Meta</strong> — Pixel pra remarketing (somente se você consentir).
              </li>
            </ul>
            <p>
              <strong>Nunca vendemos dados.</strong> Não compartilhamos com terceiros pra fins
              comerciais alheios à operação.
            </p>

            <h2>5. Retenção</h2>
            <ul>
              <li>
                <strong>Dados de cadastro:</strong> mantidos enquanto sua conta estiver ativa.
                Após cancelamento, retidos por 5 anos pra cumprir obrigações fiscais.
              </li>
              <li>
                <strong>Conversas com agente IA:</strong> 12 meses, depois anonimizadas pra
                análise de produto.
              </li>
              <li>
                <strong>Logs de acesso:</strong> 6 meses (Lei do Marco Civil — 12 meses mínimo
                pra logs de aplicação; cumprimos esse prazo).
              </li>
              <li>
                <strong>Backups encriptados:</strong> 6 meses de retenção (offsite com encryption
                age + Hetzner snapshots).
              </li>
            </ul>

            <h2>6. Seus direitos (LGPD art. 18)</h2>
            <p>Você pode, a qualquer momento:</p>
            <ul>
              <li>Confirmar que tratamos seus dados.</li>
              <li>Acessar seus dados.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>
                Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou
                tratados em desconformidade.
              </li>
              <li>Solicitar portabilidade pra outro fornecedor.</li>
              <li>Revogar consentimento.</li>
              <li>Opor-se a tratamento por legítimo interesse.</li>
              <li>
                Ser informado sobre os agentes públicos/privados com quem compartilhamos seus
                dados.
              </li>
            </ul>
            <p>
              Pra exercer qualquer direito: <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>.
              Resposta em até 15 dias.
            </p>

            <h2>7. Cookies</h2>
            <p>
              Usamos cookies <strong>estritamente necessários</strong> (sessão JWT pra
              autenticação — você não pode desabilitar sem perder o login) e cookies analíticos{' '}
              <strong>opcionais</strong> (GA4, Meta Pixel — você pode recusar). O banner de
              consentimento granular está em desenvolvimento (Sprint 5).
            </p>

            <h2>8. Segurança</h2>
            <ul>
              <li>TLS 1.3 em toda comunicação.</li>
              <li>
                Autenticação <strong>sem senha</strong> via magic link expirável (sem hash de
                senha estática a vazar).
              </li>
              <li>
                Tokens OAuth (Google Calendar) encriptados com AES-GCM derivado do JWT_SECRET.
              </li>
              <li>Backups offsite criptografados com age + rclone pra Google Drive.</li>
              <li>Controle de acesso baseado em roles (user / admin).</li>
              <li>
                Infraestrutura em servidor dedicado Hetzner, Postgres isolado por projeto.
              </li>
            </ul>

            <h2>9. Crianças e adolescentes</h2>
            <p>
              Os produtos são destinados a maiores de 18 anos. Não coletamos dados conscientemente
              de menores. Se você é responsável e identificou cadastro de menor, contate{' '}
              <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a> pra exclusão imediata.
            </p>

            <h2>10. Transferência internacional</h2>
            <p>
              Alguns provedores (OpenAI, Anthropic, Stripe, Cloudflare) processam dados fora do
              Brasil. Todos têm cláusulas contratuais de proteção (DPA) e adesão a frameworks de
              transferência internacional aceitos pela ANPD.
            </p>

            <h2>11. Atualizações</h2>
            <p>
              Atualizamos esta política sempre que necessário. Mudanças relevantes são
              comunicadas por email com <strong>30 dias de antecedência</strong> pros usuários
              ativos.
            </p>

            <h2>12. Reclamações</h2>
            <p>
              Se você não estiver satisfeito com nossa resposta, pode acionar a{' '}
              <a href="https://www.gov.br/anpd/" target="_blank" rel="noopener noreferrer">
                ANPD — Autoridade Nacional de Proteção de Dados
              </a>
              .
            </p>
          </article>

          <p className="text-fg-muted font-mono text-[11px] tracking-[0.22em] uppercase">
            // {contactInfo.company.legalName} · CNPJ {contactInfo.company.cnpj} · DPO:{' '}
            {DPO_EMAIL}
          </p>
        </Container>
      </section>
    </main>
  );
}
