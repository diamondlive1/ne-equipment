import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Globe, Package, FileCheck, Warehouse, Truck, MapPin, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface ServicesSectionProps {
  // onTransportClick removed as per freight removal task
}

const ServicesSection = ({ }: ServicesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useLanguage();

  const procurementServices = [
    { icon: Globe, title: t.services.procurement.sourcing, description: t.services.procurement.sourcingDesc },
    { icon: Package, title: t.services.procurement.supplyChain, description: t.services.procurement.supplyChainDesc },
  ];

  return (
    <section id="servicos" className="py-20 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.services.subtitle}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
            {t.services.title} <span className="text-gold">{t.services.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.services.description}</p>
        </motion.div>

        <div className="flex justify-center max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="glass-card p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-dark to-navy flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              {t.services.procurementTitle}
            </h3>
            <div className="space-y-4">
              {procurementServices.map((service) => (
                <div key={service.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-dark/10 flex items-center justify-center flex-shrink-0">
                    <service.icon className="w-5 h-5 text-navy-dark" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{service.title}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
