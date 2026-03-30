import { MapPin, Mail, Phone, Linkedin, Instagram, Facebook, Award } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import logoNE from '@/assets/logo-ne-equipment.png';
import api from '@/services/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const quickLinks = [
    { name: t.footer.quickLinks.home, href: '#' },
    { name: t.footer.quickLinks.about, href: '#' },
    { name: t.footer.quickLinks.b2b, href: '#' },
    { name: t.footer.quickLinks.services, href: '#' },
    { name: t.footer.quickLinks.contact, href: '#' },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email });
      toast.success(t.footer.subscribed);
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      toast.error('Erro ao subscrever. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-navy-dark text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-6">
              <img src={logoNE} alt="NE Equipment" className="h-16 w-auto" />
            </div>
            <p className="text-white/60 text-sm mb-6 italic">
              {t.header.quote}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/neequipment.mz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gold">{t.footer.navigation}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-white/60 hover:text-gold transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gold">{t.footer.certifications}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
                  <Award className="w-5 h-5 text-navy-dark" />
                </div>
                <div>
                  <p className="text-sm font-semibold">ISO 9001:2015</p>
                  <p className="text-xs text-white/50">{t.footer.certifiedQuality}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
                  <Award className="w-5 h-5 text-navy-dark" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.footer.humanRights}</p>
                  <p className="text-xs text-white/50">{t.footer.strictCompliance}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-gold">{t.footer.newsletter}</h3>
            <p className="text-sm text-white/60 mb-4">{t.footer.newsletterDesc}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input type="email" placeholder={t.footer.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl" />
              <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-light text-navy-dark px-4 font-bold rounded-xl">
                {isSubmitting ? '...' : t.footer.send}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© {new Date().getFullYear()} NE EQUIPMENT MOÇAMBIQUE. {t.footer.allRights} Website: www.neequipment.co.mz</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gold transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-gold transition-colors">{t.footer.terms}</a>
              <a href="#" className="hover:text-gold transition-colors">{t.footer.compliance}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
