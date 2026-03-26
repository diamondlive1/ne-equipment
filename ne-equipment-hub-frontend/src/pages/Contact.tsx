import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const offices = [
  { city: 'MAPUTO', address: 'Av. Vladimir Lenine Nr. 1447, 1º Andar Esquerdo', phone: '+258 84 311 4354', email: 'sales@neequipment.co.mz' },
  { city: 'PEMBA', address: 'Av. 25 de Setembro, Bairro Cimento', phone: '+258 87 319 71 52', email: 'geral@neequipment.co.mz' },
  { city: 'JOANESBURGO', address: 'Stanford Gardens 2, Bedfordview', phone: '+27 (63) 123 34 07', email: 'sales@neequipment.co.za' },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t.contactPage.success);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-dark mb-2">
              {t.contactPage.title} <span className="text-gold">{t.contactPage.titleHighlight}</span>
            </h2>
            <p className="text-muted-foreground mb-8">{t.contactPage.subtitle}</p>
            <div className="space-y-8">
              {offices.map((office) => (
                <div key={office.city} className="glass-card p-6">
                  <h3 className="font-bold text-gold text-lg mb-3">{office.city}</h3>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />{office.address}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0 text-muted-foreground" /><a href={`tel:${office.phone}`} className="font-semibold text-foreground hover:text-gold transition-colors">{office.phone}</a></p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0 text-muted-foreground" /><a href={`mailto:${office.email}`} className="text-gold hover:underline">{office.email}</a></p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">{t.contactPage.sendMessage}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.contactPage.fullName}</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.contactPage.corporateEmail}</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 rounded-xl" required />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.contactPage.subject}</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={t.contactPage.subjectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procurement">{t.contactPage.subjects.procurement}</SelectItem>
                    <SelectItem value="cotacao">{t.contactPage.subjects.quote}</SelectItem>
                    <SelectItem value="transporte">{t.contactPage.subjects.transport}</SelectItem>
                    <SelectItem value="parceria">{t.contactPage.subjects.partnership}</SelectItem>
                    <SelectItem value="outro">{t.contactPage.subjects.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.contactPage.message}</Label>
                <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder={t.contactPage.messagePlaceholder} rows={5} className="mt-1 rounded-xl" required />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-navy-dark font-bold rounded-xl">{t.contactPage.submit}</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
