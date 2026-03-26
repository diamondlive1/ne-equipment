import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Users, Award, Shield, Target, Eye, Zap } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useLanguage();

  const values = [
    { icon: Users, title: t.about.values.professionalism },
    { icon: Award, title: t.about.values.quality },
    { icon: Shield, title: t.about.values.ethics },
    { icon: Target, title: t.about.values.commitment },
    { icon: Eye, title: t.about.values.transparency },
    { icon: Zap, title: t.about.values.efficiency },
  ];

  return (
    <section id="sobre" className="py-16 md:py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.about.subtitle}</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy-dark mt-2 mb-6">{t.about.title}</h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p dangerouslySetInnerHTML={{ __html: t.about.p1 }} />
              <p>{t.about.p2}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {values.map((value, index) => (
                <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.1 * index }} className="glass-card p-4 text-center hover:shadow-xl transition-all">
                  <value.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-wide">{value.title}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Industrial warehouse" className="w-full h-[400px] object-cover" />
              <div className="absolute bottom-0 left-0 glass-card p-6 rounded-tr-2xl m-4">
                <p className="text-4xl md:text-5xl font-bold text-gold">100%</p>
                <p className="text-sm text-foreground/70">{t.about.commitment}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.3 }} className="glass-card p-8">
            <h3 className="text-xl font-bold text-navy-dark mb-4">{t.about.mission}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{t.about.missionText}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.4 }} className="glass-card p-8">
            <h3 className="text-xl font-bold text-navy-dark mb-4">{t.about.vision}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{t.about.visionText}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.5 }} className="bg-gradient-to-br from-gold to-gold-light rounded-2xl p-8">
            <h3 className="text-xl font-bold text-navy-dark mb-4">{t.about.commitmentTitle}</h3>
            <p className="text-navy-dark/80 text-sm leading-relaxed">{t.about.commitmentText}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
