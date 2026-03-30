import { motion } from 'framer-motion';
import { Globe, Package, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const Services = () => {
  const { t, language } = useLanguage();

  const procurementServices = [
    { icon: Globe, title: t.services.procurement.sourcing, description: t.services.procurement.sourcingDesc },
    { icon: Package, title: t.services.procurement.supplyChain, description: t.services.procurement.supplyChainDesc },
  ];

  const features = [
    t.hero.features.quality,
    t.hero.features.transparency,
    t.about.values.professionalism,
    t.about.values.efficiency,
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background animate-in fade-in duration-700">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gold font-semibold uppercase tracking-wider"
          >
            {t.services.subtitle}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-3xl font-bold text-foreground mt-4 mb-6"
          >
            {t.services.title} <span className="text-gold">{t.services.titleHighlight}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            {t.services.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {procurementServices.map((service, index) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-10 hover:border-gold/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-dark to-navy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-navy-dark text-white rounded-3xl p-10 md:p-16 relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">
                {language === 'PT' ? 'Porquê o nosso Procurement?' : 'Why our Procurement?'}
              </h2>
              <p className="text-white/70 mb-8 italic">
                {t.hero.whyDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0">
               <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                 <p className="text-gold font-bold text-sm uppercase tracking-widest mb-2">
                   {language === 'PT' ? 'Experiência Regional' : 'Regional Experience'}
                 </p>
                 <p className="text-3xl font-black text-white">Mozambique</p>
                 <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-gold" />
                   <p className="text-white/60 text-sm">& South Africa</p>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
