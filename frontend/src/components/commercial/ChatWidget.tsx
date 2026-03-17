'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Sparkles, Headset, Send } from 'lucide-react';

const WHATSAPP_BASE = 'https://wa.me/5561996088711';
const AUTO_OPEN_DELAY_MS = 6000;
const STORAGE_KEY_AUTO_OPEN = 'nexora_chat_auto_shown';

type Flow = 'root' | 'commercial' | 'support' | 'qr-mesa';
type SupportStep = 'choose' | 'acesso' | 'cardapio' | 'pedidos';
type LeadStep = 'none' | 'form' | 'summary';

const SUPPORT_MESSAGES: Record<Exclude<SupportStep, 'choose'>, string> = {
  acesso:
    'Para problemas de acesso, verifique seu e-mail e senha no painel. Se não conseguir entrar, nossa equipe pode redefinir sua senha.',
  cardapio:
    'Para ajustes no cardápio, use o painel em Produtos e Categorias. Se algo não salvar ou não aparecer para o cliente, podemos verificar do nosso lado.',
  pedidos:
    'Para dúvidas sobre pedidos, confira a tela de Pedidos no painel. Se um pedido não chegou ou o status está errado, podemos ajudar a rastrear.',
};

const BUSINESS_TYPES = [
  'Restaurante',
  'Lanchonete',
  'Pizzaria',
  'Delivery',
  'Café / Padaria',
  'Outro',
] as const;

const RESTAURANT_OPTIONS = ['1', '2', '3', 'Mais de 3'] as const;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<Flow>('root');
  const [supportStep, setSupportStep] = useState<SupportStep>('choose');
  const [autoOpened, setAutoOpened] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep>('none');
  const [leadContext, setLeadContext] = useState<'commercial' | 'support' | 'root'>('root');
  const [leadData, setLeadData] = useState({
    name: '',
    businessType: '',
    restaurantCount: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = setTimeout(() => {
      if (sessionStorage.getItem(STORAGE_KEY_AUTO_OPEN)) return;
      setOpen(true);
      setAutoOpened(true);
      sessionStorage.setItem(STORAGE_KEY_AUTO_OPEN, '1');
    }, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setFlow('root');
    setSupportStep('choose');
    setLeadStep('none');
    setLeadData({ name: '', businessType: '', restaurantCount: '' });
  };

  const handleSupportProblem = (step: Exclude<SupportStep, 'choose'>) => {
    setSupportStep(step);
  };

  const openLeadForm = (context: 'commercial' | 'support' | 'root') => {
    setLeadContext(context);
    setLeadStep('form');
  };

  const buildWhatsAppUrl = () => {
    const parts = [
      `Olá, sou ${leadData.name || 'interessado'}.`,
      `Meu negócio: ${leadData.businessType || 'não informado'}.`,
      `Quantidade de restaurantes: ${leadData.restaurantCount || 'não informado'}.`,
    ];
    if (leadContext === 'commercial') parts.push('Quero saber mais sobre o cardápio digital.');
    if (leadContext === 'support') parts.push('Preciso de suporte.');
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(parts.join(' '))}`;
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStep('summary');
  };

  const handleSendToWhatsApp = () => {
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    handleClose();
  };

  const isSupportWithMessage = flow === 'support' && supportStep !== 'choose';

  const renderWaButton = (label: string, context: 'commercial' | 'support' | 'root') => (
    <button
      type="button"
      onClick={() => openLeadForm(context)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#20bd5a]/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#20bd5a]"
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-[0_12px_40px_rgba(0,0,0,0.22)] transition duration-200 hover:scale-[1.06] hover:bg-gray-800 hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] focus:outline-none focus:ring-2 focus:ring-black/40 focus:ring-offset-2"
        aria-label="Abrir chat Nexora"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-end sm:p-6"
          aria-modal="true"
          role="dialog"
          aria-label="Chat Nexora"
        >
          <div
            className="absolute inset-0 bg-black/20 transition-opacity"
            onClick={handleClose}
            aria-hidden
          />
          <div
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out sm:max-h-[85vh]"
            style={{ minHeight: '420px' }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 font-semibold text-black">
                  N
                </div>
                <div>
                  <p className="text-base font-semibold text-black">Nexora</p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    Online · Comercial e suporte
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                aria-label="Fechar chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {/* Lead: form */}
              {leadStep === 'form' && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
                    Antes de te encaminhar para nosso WhatsApp, me conta em uma linha:
                  </div>
                  <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="chat-name" className="mb-1 block text-xs font-medium text-gray-600">
                        Nome
                      </label>
                      <input
                        id="chat-name"
                        type="text"
                        required
                        value={leadData.name}
                        onChange={(e) => setLeadData((d) => ({ ...d, name: e.target.value }))}
                        placeholder="Ex.: Maria"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="chat-business" className="mb-1 block text-xs font-medium text-gray-600">
                        Tipo de negócio
                      </label>
                      <select
                        id="chat-business"
                        required
                        value={leadData.businessType}
                        onChange={(e) => setLeadData((d) => ({ ...d, businessType: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Tipo de negócio</option>
                        {BUSINESS_TYPES.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="chat-restaurants" className="mb-1 block text-xs font-medium text-gray-600">
                        Quantidade de restaurantes
                      </label>
                      <select
                        id="chat-restaurants"
                        required
                        value={leadData.restaurantCount}
                        onChange={(e) => setLeadData((d) => ({ ...d, restaurantCount: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Quantos?</option>
                        {RESTAURANT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setLeadStep('none')}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        Ver resumo
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Lead: summary */}
              {leadStep === 'summary' && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
                    Confira seus dados. Ao clicar em &quot;Enviar no WhatsApp&quot;, você abre a conversa com nossa equipe.
                  </div>
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800">
                    <p><span className="font-medium text-gray-500">Nome:</span> {leadData.name}</p>
                    <p className="mt-2"><span className="font-medium text-gray-500">Negócio:</span> {leadData.businessType}</p>
                    <p className="mt-2"><span className="font-medium text-gray-500">Restaurantes:</span> {leadData.restaurantCount}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLeadStep('form')}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={handleSendToWhatsApp}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]"
                    >
                      <Send className="h-4 w-4" />
                      Enviar no WhatsApp
                    </button>
                  </div>
                </>
              )}

              {/* Root */}
              {leadStep === 'none' && flow === 'root' && (
                <>
                  {autoOpened && (
                    <div className="rounded-2xl border border-gray-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Oi! Posso te ajudar a colocar seu cardápio no ar em minutos. Quer saber como?
                    </div>
                  )}
                  <div className={`rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 ${autoOpened ? 'mt-3' : ''}`}>
                    Olá. Quer criar seu cardápio digital ou precisa de suporte?
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setFlow('commercial')}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                      Quero criar meu cardápio
                    </button>
                    <Link
                      href="/planos"
                      onClick={handleClose}
                      className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      Ver planos
                    </Link>
                    <button
                      type="button"
                      onClick={() => setFlow('qr-mesa')}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                      Quero QR por mesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlow('support')}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      <Headset className="h-4 w-4 shrink-0 text-gray-600" />
                      Preciso de suporte
                    </button>
                    {renderWaButton('Falar no WhatsApp', 'root')}
                  </div>
                </>
              )}

              {leadStep === 'none' && flow === 'qr-mesa' && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
                    Esse é um módulo adicional ideal para restaurantes com atendimento em salão. Ele permite usar 1 QR Code por mesa, identificar automaticamente a mesa no pedido e organizar melhor a operação presencial.
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/comecar"
                      onClick={handleClose}
                      className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Quero contratar esse módulo
                    </Link>
                    <a
                      href="https://wa.me/5561996088711"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#20bd5a]/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#20bd5a]"
                    >
                      Falar com especialista
                    </a>
                  </div>
                </>
              )}

              {leadStep === 'none' && flow === 'commercial' && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                    A Nexora ajuda seu restaurante a vender com cardápio digital, QR Code e pedidos online.
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/comecar"
                      onClick={handleClose}
                      className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Começar teste grátis
                    </Link>
                    <Link
                      href="/planos"
                      onClick={handleClose}
                      className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                    >
                      Ver planos
                    </Link>
                    {renderWaButton('Falar com especialista', 'commercial')}
                  </div>
                </>
              )}

              {leadStep === 'none' && flow === 'support' && supportStep === 'choose' && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                    Me diga qual área você precisa de ajuda.
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleSupportProblem('acesso')}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
                    >
                      Problema no acesso
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSupportProblem('cardapio')}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
                    >
                      Problema no cardápio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSupportProblem('pedidos')}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
                    >
                      Problema em pedidos
                    </button>
                    {renderWaButton('Falar com suporte humano', 'support')}
                  </div>
                </>
              )}

              {leadStep === 'none' && flow === 'support' && isSupportWithMessage && (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                    {SUPPORT_MESSAGES[supportStep]}
                  </div>
                  <div className="mt-4">
                    {renderWaButton('Falar com suporte humano', 'support')}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
