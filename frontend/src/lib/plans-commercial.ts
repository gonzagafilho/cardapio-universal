/**
 * Planos para exibição na página comercial. Alinhado ao backend (basic, pro, enterprise).
 */
export const COMMERCIAL_PLANS = [
  { key: 'basic', name: 'Basic', price: 'Sob consulta', features: ['1 estabelecimento', 'Até 3 usuários', 'Cardápio online', 'QR Code'], recommended: false },
  { key: 'pro', name: 'Pro', price: 'Sob consulta', features: ['Até 5 estabelecimentos', 'Até 15 usuários', 'Tudo do Basic', 'Relatórios'], recommended: true },
  { key: 'enterprise', name: 'Enterprise', price: 'Sob consulta', features: ['Até 20 estabelecimentos', 'Até 50 usuários', 'Domínio personalizado'], recommended: false },
];
