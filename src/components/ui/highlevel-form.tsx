import Script from 'next/script';
import { cn } from '@/lib/utils';

interface HighLevelFormProps {
  formId: string;
  title?: string;
  height?: string;
  className?: string;
}

/**
 * Embed do form HighLevel (api.gsh.digital).
 * Iframe + script de auto-resize. Estilo "wrapper transparente".
 */
export function HighLevelForm({
  formId,
  height = '1726px',
  className,
}: HighLevelFormProps) {
  return (
    <>
      <div
        className={cn('relative w-full overflow-visible bg-transparent', className)}
        style={{ minHeight: height }}
      >
        <iframe
          src={`https://api.gsh.digital/widget/form/${formId}`}
          style={{ width: '100%', minHeight: height, border: 'none', display: 'block' }}
          id={`inline-${formId}`}
          data-layout="{'id':'INLINE'}"
          data-trigger-type="alwaysShow"
          data-trigger-value=""
          data-activation-type="alwaysActivated"
          data-activation-value=""
          data-deactivation-type="neverDeactivate"
          data-deactivation-value=""
          data-form-name="Diagnóstico 6Ps - Joel Burigo"
          data-height={height}
          data-layout-iframe-id={`layout-inline-${formId}`}
          data-form-id={formId}
          title="Formulário de Diagnóstico"
        />
      </div>
      <Script src="https://api.gsh.digital/js/form_embed.js" strategy="afterInteractive" />
    </>
  );
}
