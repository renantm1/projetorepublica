import type { PoliticalEvent } from './types';
export const EVENTS: PoliticalEvent[] = [
  {
    id: 'ministry',
    category: 'Articulação política',
    title: 'Uma base, muitas prioridades',
    text: 'A coalizão pede uma definição sobre as prioridades do primeiro orçamento. Governadores defendem obras; líderes partidários querem serviços públicos. Seu primeiro gesto vai sinalizar como pretende governar.',
    choices: [
      {
        label: 'Abrir uma mesa de negociação',
        detail: 'Capital −8 · confiança +3 · relações federativas +4',
        effects: { capital: -8, trust: 3, governors: 4 },
        delayed: { stability: 2 },
        delay: 2,
      },
      {
        label: 'Priorizar a rede de saúde',
        detail: 'Resultado fiscal −0,3 p.p. · saúde +3 em dois meses',
        effects: { balance: -0.3 },
        delayed: { health: 3, approval: 1 },
        delay: 2,
      },
      {
        label: 'Preservar o equilíbrio fiscal',
        detail: 'Resultado fiscal +0,2 p.p. · aprovação −2',
        effects: { balance: 0.2, approval: -2 },
        delayed: { fdi: 1.5 },
        delay: 3,
      },
    ],
  },
  {
    id: 'global',
    category: 'Economia internacional',
    title: 'O mundo desacelera',
    text: 'A redução da demanda internacional atinge exportadores brasileiros. Indústria e agronegócio pedem uma resposta, enquanto o Tesouro alerta para o custo de medidas emergenciais.',
    choices: [
      {
        label: 'Crédito temporário à produção',
        detail: 'Fiscal −0,35 p.p. · crescimento +0,4 p.p. em dois meses',
        effects: { balance: -0.35 },
        delayed: { growth: 0.4, unemployment: -0.2 },
        delay: 2,
      },
      {
        label: 'Buscar novos mercados',
        detail: 'Capital −10 · investimento +3 em três meses',
        effects: { capital: -10, growth: -0.15 },
        delayed: { fdi: 3, growth: 0.25 },
        delay: 3,
      },
      {
        label: 'Absorver o choque sem estímulos',
        detail: 'Crescimento −0,4 p.p. · fiscal +0,1 p.p.',
        effects: { growth: -0.4, balance: 0.1, approval: -1 },
      },
    ],
  },
  {
    id: 'strike',
    category: 'Sociedade',
    title: 'Servidores anunciam paralisação',
    text: 'Entidades do serviço público cobram recomposição salarial. A greve ameaça o atendimento em hospitais e escolas. Um acordo amplo melhora os serviços, mas cria despesas permanentes.',
    choices: [
      {
        label: 'Negociar reajuste escalonado',
        detail: 'Capital −8 · fiscal −0,2 p.p. · saúde +2',
        effects: { capital: -8, balance: -0.2, health: 2, education: 1 },
      },
      {
        label: 'Oferecer acordo de produtividade',
        detail: 'Capital −12 · confiança +2 · educação +2 após três meses',
        effects: { capital: -12, trust: 2 },
        delayed: { education: 2 },
        delay: 3,
      },
      {
        label: 'Manter a proposta orçamentária',
        detail: 'Fiscal +0,1 p.p. · saúde −2 · aprovação −3',
        effects: { balance: 0.1, health: -2, approval: -3 },
      },
    ],
  },
  {
    id: 'ethics',
    category: 'Integridade',
    title: 'Suspeitas no Ministério das Obras',
    text: 'Uma auditoria identifica indícios de favorecimento em contratos. O ministro nega irregularidades e sua bancada ameaça deixar a base caso ele seja afastado. A investigação ainda não tem conclusão.',
    choices: [
      {
        label: 'Afastar o ministro e abrir auditoria',
        detail: 'Capital −12 · confiança +6 · estabilidade −2',
        effects: { capital: -12, trust: 6, stability: -2 },
        delayed: { approval: 2 },
        delay: 2,
      },
      {
        label: 'Manter o ministro durante a apuração',
        detail: 'Capital +5 · confiança −5 · pressão +4',
        effects: { capital: 5, trust: -5, pressure: 4 },
      },
      {
        label: 'Submeter os contratos à fiscalização independente',
        detail: 'Capital −7 · confiança +3 · infraestrutura −1',
        effects: { capital: -7, trust: 3, infrastructure: -1 },
      },
    ],
  },
  {
    id: 'flood',
    category: 'Emergência climática',
    title: 'Chuvas deixam municípios em alerta',
    text: 'Enchentes interrompem estradas e desalojam famílias. Prefeitos pedem assistência imediata. A Defesa Civil propõe reconstruir com prevenção, uma alternativa mais demorada e de maior custo inicial.',
    choices: [
      {
        label: 'Mobilizar auxílio emergencial',
        detail: 'Fiscal −0,3 p.p. · pobreza −0,4 p.p. · aprovação +2',
        effects: { balance: -0.3, poverty: -0.4, approval: 2 },
      },
      {
        label: 'Reconstruir com obras de prevenção',
        detail: 'Fiscal −0,45 p.p. · infraestrutura +4 em quatro meses',
        effects: { balance: -0.45, approval: -1 },
        delayed: { infrastructure: 4, governors: 4 },
        delay: 4,
      },
      {
        label: 'Coordenar recursos estaduais existentes',
        detail: 'Capital −8 · infraestrutura −2 · governadores +2',
        effects: { capital: -8, infrastructure: -2, governors: 2 },
      },
    ],
  },
  {
    id: 'energy',
    category: 'Infraestrutura',
    title: 'Reservatórios abaixo do esperado',
    text: 'A estiagem pressiona a geração elétrica. Especialistas alertam para tarifas maiores e risco à atividade industrial. O país precisa escolher como dividir os custos do ajuste.',
    choices: [
      {
        label: 'Subsidiar temporariamente a tarifa',
        detail: 'Fiscal −0,4 p.p. · inflação −0,3 p.p.',
        effects: { balance: -0.4, inflation: -0.3 },
        delayed: { debt: 0.5 },
        delay: 3,
      },
      {
        label: 'Investir em geração diversificada',
        detail: 'Fiscal −0,3 p.p. · inflação +0,2 p.p. · infraestrutura +3 em quatro meses',
        effects: { balance: -0.3, inflation: 0.2 },
        delayed: { infrastructure: 3, growth: 0.2 },
        delay: 4,
      },
      {
        label: 'Repassar custos e incentivar economia',
        detail: 'Inflação +0,4 p.p. · aprovação −2 · fiscal +0,1 p.p.',
        effects: { inflation: 0.4, approval: -2, balance: 0.1 },
      },
    ],
  },
  {
    id: 'diplomacy',
    category: 'Relações internacionais',
    title: 'Um acordo em disputa',
    text: 'Parceiros comerciais oferecem acesso a novos mercados em troca de compromissos ambientais e maior abertura. Exportadores apoiam; setores menos competitivos pedem proteção.',
    choices: [
      {
        label: 'Assinar com transição gradual',
        detail: 'Capital −8 · investimento +4 em três meses',
        effects: { capital: -8 },
        delayed: { fdi: 4, growth: 0.2 },
        delay: 3,
      },
      {
        label: 'Exigir proteção a setores sensíveis',
        detail: 'Capital −5 · investimento +1,5 em dois meses',
        effects: { capital: -5, governors: 2 },
        delayed: { fdi: 1.5 },
        delay: 2,
      },
      {
        label: 'Recusar as condições',
        detail: 'Capital +4 · investimento −2 · estabilidade +1',
        effects: { capital: 4, fdi: -2, stability: 1 },
      },
    ],
  },
  {
    id: 'protest',
    category: 'Opinião pública',
    title: 'As ruas cobram resultados',
    text: 'Mobilizações em capitais reúnem grupos com demandas distintas: custo de vida, segurança e qualidade dos serviços. Uma resposta precisa equilibrar escuta, orçamento e capacidade de execução.',
    choices: [
      {
        label: 'Convocar uma agenda de escuta',
        detail: 'Capital −10 · confiança +3 · pressão −7',
        effects: { capital: -10, trust: 3, pressure: -7 },
      },
      {
        label: 'Anunciar reforço nos serviços',
        detail: 'Fiscal −0,35 p.p. · saúde +2 · segurança +2 após dois meses',
        effects: { balance: -0.35 },
        delayed: { health: 2, security: 2, pressure: -4 },
        delay: 2,
      },
      {
        label: 'Defender os resultados do governo',
        detail: 'Capital +3 · pressão +3 · aprovação −2',
        effects: { capital: 3, pressure: 3, approval: -2 },
      },
    ],
  },
  {
    id: 'inflation',
    category: 'Custo de vida',
    title: 'Alimentos pesam no orçamento',
    text: 'Uma quebra de safra eleva preços de alimentos. Famílias de menor renda sentem primeiro o impacto, enquanto produtores precisam recuperar a oferta. As medidas têm efeitos e prazos diferentes.',
    choices: [
      {
        label: 'Ampliar auxílio alimentar por um período',
        detail: 'Fiscal −0,25 p.p. · pobreza −0,4 p.p. · inflação +0,1 p.p.',
        effects: { balance: -0.25, poverty: -0.4, inflation: 0.1 },
      },
      {
        label: 'Facilitar importações temporárias',
        detail: 'Fiscal −0,15 p.p. · inflação −0,3 p.p. · governadores −2',
        effects: { balance: -0.15, inflation: -0.3, governors: -2 },
      },
      {
        label: 'Financiar a próxima safra',
        detail: 'Fiscal −0,2 p.p. · inflação +0,2 p.p. agora e −0,4 em quatro meses',
        effects: { balance: -0.2, inflation: 0.2 },
        delayed: { inflation: -0.4, growth: 0.15 },
        delay: 4,
      },
    ],
  },
  {
    id: 'cpi',
    category: 'Congresso Nacional',
    title: 'Oposição articula uma CPI',
    text: 'Uma comissão pretende investigar a execução de emendas. A oposição reúne assinaturas e partidos da base evitam compromissos. A transparência pode custar apoio no curto prazo.',
    choices: [
      {
        label: 'Publicar a execução completa das emendas',
        detail: 'Confiança +5 · capital −10',
        effects: { trust: 5, capital: -10 },
      },
      {
        label: 'Negociar um calendário de fiscalização',
        detail: 'Capital −7 · estabilidade +2 · confiança +1',
        effects: { capital: -7, stability: 2, trust: 1 },
      },
      {
        label: 'Mobilizar a base contra a comissão',
        detail: 'Capital +5 · confiança −4 · pressão +4',
        effects: { capital: 5, trust: -4, pressure: 4 },
      },
    ],
  },
  {
    id: 'innovation',
    category: 'Desenvolvimento',
    title: 'Uma janela para a indústria',
    text: 'Universidades e empresas apresentam um programa de inovação. Há potencial de produtividade, mas o investimento concorre com demandas urgentes do orçamento.',
    choices: [
      {
        label: 'Financiar pesquisa e bolsas',
        detail: 'Fiscal −0,3 p.p. · educação +3 e PIB +0,3 p.p. em seis meses',
        effects: { balance: -0.3 },
        delayed: { education: 3, growth: 0.3 },
        delay: 6,
      },
      {
        label: 'Atrair capital privado',
        detail: 'Capital −8 · investimento +3 em três meses',
        effects: { capital: -8 },
        delayed: { fdi: 3, growth: 0.15 },
        delay: 3,
      },
      {
        label: 'Priorizar o orçamento existente',
        detail: 'Fiscal +0,1 p.p. · educação −1',
        effects: { balance: 0.1, education: -1 },
      },
    ],
  },
];
