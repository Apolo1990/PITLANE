import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spring = { type: 'spring', stiffness: 260, damping: 30 };
const fadeOnly = { duration: 0.3 };
const WA_BASE = 'https://wa.me/5493515120123';

const ASESORAMIENTO = 'Quiero ser asesorado';

const serviceChips = [
  'Preparado para la venta',
  'Lavado',
  'Limpieza de interior',
  'Estética exterior',
  'Corrección y pulido',
  'Tratamientos de protección',
  'Polarizados',
  ASESORAMIENTO,
];

const svcIdToChip = {
  venta: 'Preparado para la venta',
  lavado: 'Lavado',
  interior: 'Limpieza de interior',
  exterior: 'Estética exterior',
  pulido: 'Corrección y pulido',
  proteccion: 'Tratamientos de protección',
  polarizados: 'Polarizados',
};

const WheelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <circle cx="8" cy="8" r="1.8" />
    <line x1="8" y1="1.5" x2="8" y2="6.2" />
    <line x1="8" y1="9.8" x2="8" y2="14.5" />
    <line x1="1.5" y1="8" x2="6.2" y2="8" />
    <line x1="9.8" y1="8" x2="14.5" y2="8" />
    <line x1="3.4" y1="3.4" x2="6.5" y2="6.5" />
    <line x1="9.5" y1="9.5" x2="12.6" y2="12.6" />
    <line x1="12.6" y1="3.4" x2="9.5" y2="6.5" />
    <line x1="6.5" y1="9.5" x2="3.4" y2="12.6" />
  </svg>
);

let openPanelFn = null;

function WhatsAppLeadPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const [vehicle, setVehicle] = useState('');
  const dragControls = useDragControls();

  useEffect(() => {
    openPanelFn = (preselect) => {
      const initial = new Set();
      if (preselect && svcIdToChip[preselect]) initial.add(svcIdToChip[preselect]);
      setSelectedServices(initial);
      setVehicle('');
      setIsOpen(true);
    };
    return () => { openPanelFn = null; };
  }, []);

  const closePanel = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closePanel]);

  const toggleService = (svc) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (svc === ASESORAMIENTO) {
        if (next.has(svc)) {
          next.delete(svc);
        } else {
          next.clear();
          next.add(svc);
        }
      } else {
        next.delete(ASESORAMIENTO);
        if (next.has(svc)) next.delete(svc);
        else next.add(svc);
      }
      return next;
    });
  };

  const buildMessage = () => {
    const lines = ['¡Hola Pitlane! Quiero consultar por:'];
    [...selectedServices].forEach(s => {
      if (s === ASESORAMIENTO) {
        lines.push('• Quiero asesoramiento');
      } else {
        lines.push(`- ${s}`);
      }
    });
    if (vehicle.trim()) lines.push(`Vehículo: ${vehicle.trim()}`);
    lines.push('¿Qué disponibilidad tienen?');
    return lines.join('\n');
  };

  const canSubmit = selectedServices.size > 0;
  const isMobile = window.matchMedia('(max-width: 639px)').matches;

  const openWhatsApp = (mensaje) => {
    const url = `${WA_BASE}?text=${encodeURIComponent(mensaje)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    openWhatsApp(buildMessage());
    closePanel();
  };

  const handleSkip = (e) => {
    e.preventDefault();
    openWhatsApp('¡Hola Pitlane! Quiero hacer una consulta.');
    closePanel();
  };

  const panelContent = (
    <div className="wa-panel">
      {isMobile && (
        <div className="wa-panel__handle" onPointerDown={(e) => dragControls.start(e)} />
      )}
      <button className="wa-panel__close" onClick={closePanel} aria-label="Cerrar">&times;</button>
      <h3 className="wa-panel__title">Consultá por WhatsApp</h3>

      <div className="wa-panel__field">
        <label className="wa-panel__label">¿Qué servicio te interesa?</label>
        <div className="wa-panel__chips">
          {serviceChips.map(svc => {
            const active = selectedServices.has(svc);
            return (
              <button
                key={svc}
                className={`wa-chip${active ? ' wa-chip--active' : ''}`}
                onClick={() => toggleService(svc)}
                type="button"
              >
                <span className="wa-chip__icon">
                  {active ? (
                    <motion.span
                      key="wheel"
                      className="wa-chip__wheel"
                      initial={prefersReducedMotion ? { opacity: 0 } : { rotate: -180, opacity: 0 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { rotate: 0, opacity: 1 }}
                      transition={prefersReducedMotion ? fadeOnly : { duration: 0.4, ease: 'easeOut' }}
                    >
                      <WheelIcon />
                    </motion.span>
                  ) : (
                    <span className="wa-chip__circle" />
                  )}
                </span>
                {svc}
              </button>
            );
          })}
        </div>
      </div>

      <div className="wa-panel__field">
        <label className="wa-panel__label">¿Qué vehículo tenés?</label>
        <input
          className="wa-panel__input"
          type="text"
          placeholder="Ej: Toyota SW4 2021"
          value={vehicle}
          onChange={e => setVehicle(e.target.value)}
        />
      </div>

      <a
        href="#"
        className={`wa-panel__submit${canSubmit ? '' : ' wa-panel__submit--disabled'}`}
        onClick={handleSubmit}
      >Enviar por WhatsApp</a>
      <a
        href="#"
        className="wa-panel__skip"
        onClick={handleSkip}
      >Escribir sin completar</a>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="wa-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeOnly}
          onClick={(e) => { if (e.target === e.currentTarget) closePanel(); }}
        >
          {isMobile ? (
            <motion.div
              className="wa-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={prefersReducedMotion ? fadeOnly : spring}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100) closePanel(); }}
            >
              {panelContent}
            </motion.div>
          ) : (
            <motion.div
              className="wa-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={prefersReducedMotion ? fadeOnly : spring}
            >
              {panelContent}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const root = document.getElementById('waPanelRoot');
if (root) createRoot(root).render(<WhatsAppLeadPanel />);

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="wa.me/5493515120123"]');
  if (link) {
    e.preventDefault();
    if (openPanelFn) openPanelFn();
  }
});

window.addEventListener('open-wa-panel', (e) => {
  if (openPanelFn) openPanelFn(e.detail?.preselect);
});
