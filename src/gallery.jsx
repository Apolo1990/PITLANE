import { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spring = { type: 'spring', stiffness: 260, damping: 30 };
const fadeOnly = { duration: 0.3 };

// ===== DashedDivider =====
export function DashedDivider() {
  return <div className="separator" aria-hidden="true" />;
}

// ===== Gallery data =====
const galeria = [
  { slug: 'galeria-alfa-giulia-sign', alt: 'Alfa Romeo Giulia con logo Pitlane' },
  { slug: 'galeria-amg-frenos', alt: 'Frenos AMG detallados' },
  { slug: 'galeria-chevy-serie2-capot', alt: 'Chevy Serie 2 capo restaurado' },
  { slug: 'galeria-corvette-frente', alt: 'Corvette frente detallado' },
  { slug: 'galeria-corvette-interior', alt: 'Corvette interior restaurado' },
  { slug: 'galeria-corvette-sign', alt: 'Corvette con logo Pitlane' },
  { slug: 'galeria-lotus-amarillo', alt: 'Lotus amarillo detallado' },
  { slug: 'galeria-mustang-detalle', alt: 'Mustang detalle de pintura' },
  { slug: 'galeria-mustang-frente', alt: 'Mustang frente detallado' },
  { slug: 'galeria-ranger-frente', alt: 'Ranger frente detallado' },
  { slug: 'galeria-ranger-lateral', alt: 'Ranger lateral detallado' },
  { slug: 'galeria-sw4-llantas-negras', alt: 'SW4 con llantas negras' },
];

// ===== Process data =====
const proceso = [
  { slug: 'proceso-prelavado-foam-porsche', eyebrow: 'Paso 1', t: 'Prelavado con foam' },
  { slug: 'proceso-limpieza-volante', eyebrow: 'Paso 2', t: 'Limpieza de volante' },
  { slug: 'proceso-asiento-cuero-50-50', eyebrow: 'Paso 3', t: 'Nutrido de cuero' },
  { slug: 'proceso-test-correccion-peugeot', eyebrow: 'Paso 4', t: 'Test de corrección' },
];

// ===== Shared Lightbox =====
function SharedLightbox({ images, alts, selected, setSelected, prefix }) {
  const [showControls, setShowControls] = useState(false);
  const touchX = useRef(0);

  const closeLightbox = useCallback(() => {
    setShowControls(false);
    setSelected(null);
  }, [setSelected]);

  const navigate = useCallback((dir) => {
    setSelected(prev => prev === null ? prev : (prev + dir + images.length) % images.length);
  }, [setSelected, images.length]);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected, closeLightbox, navigate]);

  useEffect(() => {
    if (selected !== null) {
      const t = setTimeout(() => setShowControls(true), prefersReducedMotion ? 0 : 350);
      return () => clearTimeout(t);
    }
  }, [selected]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  };

  return (
    <AnimatePresence>
      {selected !== null && (
        <motion.div
          className="lb-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeOnly}
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence>
            <motion.img
              key={selected}
              layoutId={prefersReducedMotion ? undefined : `${prefix}-${selected}`}
              src={images[selected]}
              alt={alts[selected]}
              className="lb-expanded"
              transition={prefersReducedMotion ? fadeOnly : spring}
            />
          </AnimatePresence>
          <AnimatePresence>
            {showControls && (
              <motion.div
                key="controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeOnly}
              >
                <span className="lb-close" onClick={closeLightbox}>&times;</span>
                <span className="lb-prev" onClick={() => navigate(-1)}>&lsaquo;</span>
                <span className="lb-next" onClick={() => navigate(1)}>&rsaquo;</span>
                <span className="lb-count">{selected + 1} / {images.length}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== Gallery =====
function Gallery() {
  const [selected, setSelected] = useState(null);
  const [visibleIdxs, setVisibleIdxs] = useState(new Set());
  const gridRef = useRef(null);

  const images = galeria.map(g => `/${g.slug}.webp`);
  const alts = galeria.map(g => g.alt);

  useEffect(() => {
    if (!gridRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisibleIdxs(prev => new Set(prev).add(Number(e.target.dataset.idx)));
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px' });
    gridRef.current.querySelectorAll('[data-idx]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="gal-grid" ref={gridRef}>
        {galeria.map((g, i) => (
          <div
            key={g.slug}
            className="gal-item hover-img"
            data-idx={i}
            onClick={() => setSelected(i)}
          >
            {visibleIdxs.has(i) && (
              <motion.img
                layoutId={prefersReducedMotion ? undefined : `gal-${i}`}
                src={`/${g.slug}.webp`}
                alt={g.alt}
                className="gal-img"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={fadeOnly}
              />
            )}
          </div>
        ))}
      </div>
      <SharedLightbox images={images} alts={alts} selected={selected} setSelected={setSelected} prefix="gal" />
    </>
  );
}

// ===== Process =====
function Process() {
  const [selected, setSelected] = useState(null);
  const images = proceso.map(p => `/${p.slug}.webp`);
  const alts = proceso.map(p => `${p.t} - proceso de estética vehicular Pitlane`);

  return (
    <>
      <div className="proc-grid" id="procGrid">
        {proceso.map((p, i) => (
          <div
            key={p.slug}
            className="proc-card reveal hover-img"
            onClick={() => setSelected(i)}
          >
            <motion.img
              layoutId={prefersReducedMotion ? undefined : `proc-${i}`}
              loading="lazy"
              src={`/${p.slug}.webp`}
              alt={alts[i]}
            />
            <div className="proc-label">
              <span className="eyebrow">{p.eyebrow}</span>
              <div className="t">{p.t}</div>
            </div>
          </div>
        ))}
      </div>
      <SharedLightbox images={images} alts={alts} selected={selected} setSelected={setSelected} prefix="proc" />
    </>
  );
}

// ===== DashedDivider mount =====
function mountDashedDividers() {
  document.querySelectorAll('.separator').forEach(el => {
    if (el.dataset.react === 'done') return;
    el.dataset.react = 'done';
    createRoot(el).render(<DashedDivider />);
  });
}

// ===== Mount all =====
const galRoot = document.getElementById('galRoot');
if (galRoot) createRoot(galRoot).render(<Gallery />);

const procRoot = document.getElementById('procRoot');
if (procRoot) createRoot(procRoot).render(<Process />);

mountDashedDividers();
