/**
 * Informações de contato e empresa centralizadas.
 * Fonte canônica — qualquer copy pública consulta daqui.
 */

export const contactInfo = {
  company: {
    name: 'Joel Burigo',
    legalName: 'Growth Master LTDA',
    cnpj: '11.785.245/0001-98',
    tagline: 'Vendas Escaláveis',
    description: 'Criador dos 6Ps das Vendas Escaláveis',
  },
  phone: {
    display: '(48) 2398-1939',
    international: '+55 (48) 2398-1939',
    whatsapp: '554823981939',
    whatsappLink: 'https://wa.me/554823981939',
  },
  email: {
    main: 'contato@joelburigo.com.br',
    mailto: 'mailto:contato@joelburigo.com.br',
  },
  social: {
    youtube: {
      name: 'YouTube',
      handle: '@joelburigo',
      url: 'https://youtube.com/@joelburigo',
    },
    linkedin: {
      name: 'LinkedIn',
      handle: 'joelburigo',
      url: 'https://linkedin.com/in/joelburigo',
    },
    instagram: {
      name: 'Instagram',
      handle: '@joelburigo',
      url: 'https://instagram.com/joelburigo',
    },
    facebook: {
      name: 'Facebook',
      handle: 'joelburigo',
      url: 'https://facebook.com/joelburigo',
    },
  },
  website: {
    url: 'https://joelburigo.com.br',
    domain: 'joelburigo.com.br',
  },
  businessHours: {
    weekdays: 'Segunda a Sexta, 9h às 18h',
    timezone: 'Horário de Brasília',
  },
} as const;

export function getWhatsAppLink(message?: string) {
  let url = contactInfo.phone.whatsappLink as string;
  if (message) url += `?text=${encodeURIComponent(message)}`;
  return url;
}
