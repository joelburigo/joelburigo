// Depoimentos centralizados (exibidos na home)

export interface Testimonial {
  quote: string
  author: string
  role: string
  image: string
  rating: number
  highlight: string
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Antes eu atendia só quem me procurava. Hoje eu prospecta ativamente no LinkedIn e fecho 3-4 consultorias por mês. O diagnóstico mudou meu jogo.',
    author: 'Ricardo Mendes',
    role: 'Correspondente Bancário',
    image: '/images/testimonial-1.jpg',
    rating: 5,
    highlight: 'Prospecção ativa funcionando',
  },
  {
    quote: 'Meu salão sempre teve movimento, mas eu não sabia crescer. Com os pacotes de recorrência e follow-up automatizado, dobrei o faturamento em 5 meses.',
    author: 'Fernanda Oliveira',
    role: 'Dona de Salão de Beleza',
    image: '/images/testimonial-2.jpg',
    rating: 5,
    highlight: 'Faturamento dobrou',
  },
  {
    quote: 'Eu cobrava por hora e vivia no corre. Agora tenho 12 clientes em planos mensais fixos. Previsibilidade total e mais tempo livre.',
    author: 'Thiago Almeida',
    role: 'Prestador de Serviços TI',
    image: '/images/testimonial-3.jpg',
    rating: 5,
    highlight: 'Recorrência e previsibilidade',
  },
]
