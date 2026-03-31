import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

const brands = [
  { name: 'Marca 1', logo: '/logos/logo1.jpeg' },
  { name: 'Marca 2', logo: '/logos/logo2.jpeg' },
  { name: 'Marca 3', logo: '/logos/logo3.jpeg' },
  { name: 'Marca 4', logo: '/logos/logo4.jpeg' },
  { name: 'Marca 5', logo: '/logos/logo5.jpeg' },
  { name: 'Marca 6', logo: '/logos/logo6.jpeg' },
  { name: 'Marca 7', logo: '/logos/logo7.jpeg' },
  { name: 'Marca 8', logo: '/logos/logo8.jpeg' },
  { name: 'Marca 9', logo: '/logos/logo9.jpeg' },
  { name: 'Marca 10', logo: '/logos/logo10.jpeg' },
];

const BrandsCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-muted overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.brands.subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
            {t.brands.title} <span className="text-gold">{t.brands.titleHighlight}</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll">
          {[...brands, ...brands].map((brand, index) => (
            <motion.div
              key={`${brand.name}-${index}`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: (index % brands.length) * 0.05 }}
              className="flex-shrink-0 mx-4"
            >
              <div className="w-40 h-28 glass-card flex items-center justify-center px-4 py-3 hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-gold/30">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 35s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

export default BrandsCarousel;
