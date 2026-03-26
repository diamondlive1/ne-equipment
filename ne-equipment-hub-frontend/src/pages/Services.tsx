import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Truck, Package, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const { t } = useLanguage();

  const calculateFreight = () => {
    if (!origin || !destination || !weight) {
      toast.error(t.servicesPage.fillFields);
      return;
    }
    const weightNum = parseFloat(weight);
    const basePrice = 5000;
    const total = basePrice + (weightNum * 50);
    setEstimatedPrice(Math.round(total));
    toast.success(t.servicesPage.estimateCalculated);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }} className="bg-gradient-to-br from-navy-dark to-navy rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t.servicesPage.title} <span className="text-gold">{t.servicesPage.titleHighlight}</span>
            </h2>
            <p className="text-white/70 mb-8">{t.servicesPage.description}</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center"><Package className="w-6 h-6 text-gold" /></div>
                <span className="text-white font-semibold">{t.servicesPage.fractional}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center"><RotateCcw className="w-6 h-6 text-gold" /></div>
                <span className="text-white font-semibold">{t.servicesPage.tracking}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card p-8">
            <h3 className="text-xl font-bold text-foreground mb-6">{t.servicesPage.freightSimulator}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.servicesPage.originLabel}</Label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={t.servicesPage.selectLabel} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maputo">Maputo (MZ)</SelectItem>
                      <SelectItem value="pemba">Pemba (MZ)</SelectItem>
                      <SelectItem value="joburg">Joanesburgo (ZA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.servicesPage.destLabel}</Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={t.servicesPage.selectLabel} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maputo">Maputo (MZ)</SelectItem>
                      <SelectItem value="pemba">Pemba (MZ)</SelectItem>
                      <SelectItem value="joburg">Joanesburgo (ZA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.servicesPage.cargoWeight}</Label>
                <Input type="number" placeholder={t.servicesPage.cargoPlaceholder} value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <Button onClick={calculateFreight} className="w-full bg-gold hover:bg-gold-light text-navy-dark font-bold mt-4 rounded-xl">{t.servicesPage.calculateEstimate}</Button>
              {estimatedPrice !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t.servicesPage.estimate}</p>
                  <p className="text-3xl font-bold text-gold">{new Intl.NumberFormat('pt-MZ', { style: 'decimal', minimumFractionDigits: 2 }).format(estimatedPrice)} MT</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Services;
