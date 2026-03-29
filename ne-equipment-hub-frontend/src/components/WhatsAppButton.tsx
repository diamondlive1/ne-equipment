import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const offices = [
  { name: 'Moçambique', flag: '🇲🇿', numbers: ['+258 84 311 4354', '+258 87 319 71 52', '+258 87 257 4001'] },
  { name: 'South Africa', flag: '🇿🇦', numbers: ['+27 (63) 123 34 07', '+27 (78) 951-5256'] },
];

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();

  const handleWhatsAppClick = (number: string) => {
    const cleanNumber = number.replace(/[^\d+]/g, '');
    const msg = language === 'EN' ? 'Hello! Is this for B2B business?' : 'Olá! É para negócio B2B?';
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-16 right-0 w-72 bg-card rounded-xl shadow-lg border border-border overflow-hidden mb-4">
            <div className="bg-whatsapp p-4">
              <h3 className="text-primary-foreground font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t.whatsapp.title}
              </h3>
              <p className="text-primary-foreground/80 text-sm">{t.whatsapp.subtitle}</p>
            </div>
            <div className="p-2">
              {offices.map((office) => (
                <div key={office.name} className="mb-2 last:mb-0">
                  <p className="text-sm font-medium text-foreground px-3 py-1 flex items-center gap-2">
                    <span>{office.flag}</span>
                    {office.name}
                  </p>
                  {office.numbers.map((number) => (
                    <button key={number} onClick={() => handleWhatsAppClick(number)} className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-whatsapp/10 hover:text-whatsapp rounded-lg transition-colors">
                      {number}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-whatsapp hover:bg-whatsapp/90 rounded-full flex items-center justify-center shadow-lg transition-colors animate-pulse-gold" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        {isOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
