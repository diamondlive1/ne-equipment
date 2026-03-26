import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

const brands = [
  { name: 'Dell', category: 'TI' },
  { name: 'HP', category: 'TI' },
  { name: 'Lenovo', category: 'TI' },
  { name: 'Apple', category: 'TI' },
  { name: 'Canon', category: 'TI' },
  { name: 'Lexmark', category: 'TI' },
  { name: 'APC', category: 'TI' },
  { name: 'Phillips', category: 'TI' },
  { name: 'WD', category: 'TI' },
  { name: 'Verbatim', category: 'TI' },
  { name: 'Targus', category: 'TI' },
  { name: 'CMJ', category: 'TI' },
];

const BrandsCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-muted overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.brands.subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
            {t.brands.title} <span className="text-gold">{t.brands.titleHighlight}</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll">
          {[...brands, ...brands].map((brand, index) => (
            <motion.div key={`${brand.name}-${index}`} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.4, delay: (index % brands.length) * 0.05 }} className="flex-shrink-0 mx-4">
              <div className="w-36 h-24 glass-card flex items-center justify-center px-4 hover:shadow-xl transition-all duration-300 group">
                <span className="text-lg font-bold text-muted-foreground group-hover:text-gold transition-colors">{brand.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 30s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

export default BrandsCarousel;
