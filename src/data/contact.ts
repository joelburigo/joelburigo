/**
 * Informações de contato e empresa centralizadas
 * Altere aqui para refletir em todo o site
 */

export const contactInfo = {
  // Informações da empresa
  company: {
    name: 'Joel Burigo',
    legalName: 'Growth Master LTDA',
    cnpj: '11.785.245/0001-98',
    tagline: 'Vendas Escaláveis',
    description: 'Criador dos 6Ps das Vendas Escaláveis',
  },

  // Contatos
  phone: {
    display: '(48) 2398-1939',
    international: '+55 (48) 2398-1939',
    whatsapp: '554823981939', // Formato para wa.me (sem espaços, hífens ou parênteses)
    whatsappLink: 'https://wa.me/554823981939',
  },

  email: {
    main: 'contato@joelburigo.com.br',
    mailto: 'mailto:contato@joelburigo.com.br',
  },

  // Redes sociais
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

  // Endereços
  website: {
    url: 'https://joelburigo.com.br',
    domain: 'joelburigo.com.br',
  },

  // Horário de atendimento
  businessHours: {
    weekdays: 'Segunda a Sexta, 9h às 18h',
    timezone: 'Horário de Brasília',
  },
}

// Helper functions para URLs com UTMs
export function getWhatsAppLink(message?: string, utmParams?: { source?: string; medium?: string; campaign?: string }) {
  let url = contactInfo.phone.whatsappLink
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  
  return url
}

export function getSocialLink(platform: keyof typeof contactInfo.social, utmParams?: { source?: string; medium?: string; campaign?: string }) {
  let url = contactInfo.social[platform].url
  
  if (utmParams) {
    const params = new URLSearchParams()
    if (utmParams.source) params.append('utm_source', utmParams.source)
    if (utmParams.medium) params.append('utm_medium', utmParams.medium)
    if (utmParams.campaign) params.append('utm_campaign', utmParams.campaign)
    
    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  return url
}
