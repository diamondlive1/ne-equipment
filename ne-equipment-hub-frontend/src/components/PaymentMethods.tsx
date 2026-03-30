import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Smartphone, CreditCard, Globe, Building2, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const PaymentMethods = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t } = useLanguage();

  const paymentMethods = [
    { region: t.payment.regions.mozambique, icon: Smartphone, methods: ['M-Pesa', 'E-Mola', 'POS'], color: 'gold' },
    { region: t.payment.regions.international, icon: Globe, methods: [t.payment.methods.bankTransfer], color: 'gold' },
    { region: t.payment.regions.b2b, icon: Building2, methods: [t.payment.methods.billing, t.payment.methods.commercialTerms], color: 'navy' },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-navy-dark to-navy" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t.payment.title} <span className="text-gold">{t.payment.titleHighlight}</span>
          </h2>
          <p className="text-white/70">{t.payment.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {paymentMethods.map((payment, index) => (
            <motion.div key={payment.region} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.1 }} className={`p-6 rounded-2xl backdrop-blur-xl ${payment.color === 'gold' ? 'bg-gold/10 border border-gold/30' : 'bg-white/5 border border-white/20'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${payment.color === 'gold' ? 'bg-gold/20' : 'bg-white/10'}`}>
                <payment.icon className={`w-6 h-6 ${payment.color === 'gold' ? 'text-gold' : 'text-white'}`} />
              </div>
              <h3 className="font-bold text-white mb-3">{payment.region}</h3>
              <ul className="space-y-2">
                {payment.methods.map((method) => (
                  <li key={method} className="text-sm text-white/70 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${payment.color === 'gold' ? 'bg-gold' : 'bg-white/50'}`} />
                    {method}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.5 }} className="flex items-center justify-center gap-2 mt-10 text-white/60 text-sm">
          <Shield className="w-4 h-4" />
          <span>{t.payment.secure}</span>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentMethods;
