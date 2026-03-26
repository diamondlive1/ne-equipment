import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Package, Ruler, Calendar, Truck, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface TransportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const locations = [
  'Maputo, Moçambique',
  'Pemba, Moçambique',
  'Joanesburgo, África do Sul',
];

const TransportForm = ({ isOpen, onClose }: TransportFormProps) => {
  const [formData, setFormData] = useState({
    origem: '', destino: '', tipoMercadoria: '', peso: '', dimensoes: '', data: '', tipoTransporte: '', observacoes: '',
  });
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const { t } = useLanguage();

  const transportTypes = [
    { value: 'expresso', label: t.transportForm.express, time: t.transportForm.expressTime, price: '+50%' },
    { value: 'standard', label: t.transportForm.standardLabel, time: t.transportForm.standardTime, price: 'Base' },
    { value: 'economico', label: t.transportForm.economic, time: t.transportForm.economicTime, price: '-20%' },
  ];

  const calculateEstimate = () => {
    const baseCost = 500;
    const weightFactor = parseFloat(formData.peso) || 10;
    const typeFactor = formData.tipoTransporte === 'expresso' ? 1.5 : formData.tipoTransporte === 'economico' ? 0.8 : 1;
    const cost = baseCost + (weightFactor * 50 * typeFactor);
    setEstimatedCost(Math.round(cost));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t.transportForm.successTitle, description: t.transportForm.successDesc });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-gold to-gold-light p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy-dark/20 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-navy-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy-dark">{t.transportForm.title}</h2>
                    <p className="text-sm text-navy-dark/70">{t.transportForm.subtitle}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-navy-dark/10 text-navy-dark transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{t.transportForm.origin}</Label>
                  <Select value={formData.origem} onValueChange={(value) => setFormData({ ...formData, origem: value })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.transportForm.originPlaceholder} /></SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                      <SelectItem value="other">{t.transportForm.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" />{t.transportForm.destination}</Label>
                  <Select value={formData.destino} onValueChange={(value) => setFormData({ ...formData, destino: value })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder={t.transportForm.destPlaceholder} /></SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                      <SelectItem value="other">{t.transportForm.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />{t.transportForm.goodsType}</Label>
                  <Input placeholder={t.transportForm.goodsPlaceholder} value={formData.tipoMercadoria} onChange={(e) => setFormData({ ...formData, tipoMercadoria: e.target.value })} className="rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" />{t.transportForm.weight}</Label>
                  <Input type="number" placeholder={t.transportForm.weightPlaceholder} value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} className="rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Ruler className="w-4 h-4 text-muted-foreground" />{t.transportForm.dimensions}</Label>
                  <Input placeholder={t.transportForm.dimensionsPlaceholder} value={formData.dimensoes} onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{t.transportForm.preferredDate}</Label>
                  <Input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="rounded-xl" required />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2"><Truck className="w-4 h-4 text-muted-foreground" />{t.transportForm.transportType}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {transportTypes.map((type) => (
                      <button key={type.value} type="button" onClick={() => setFormData({ ...formData, tipoTransporte: type.value })} className={`p-4 rounded-xl border text-center transition-all ${formData.tipoTransporte === type.value ? 'border-gold bg-gold/10' : 'border-border hover:border-gold/50'}`}>
                        <p className="font-bold text-sm text-foreground">{type.label}</p>
                        <p className="text-xs text-muted-foreground">{type.time}</p>
                        <p className="text-xs text-gold font-bold mt-1">{type.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>{t.transportForm.notes}</Label>
                  <Textarea placeholder={t.transportForm.notesPlaceholder} rows={3} value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} className="rounded-xl" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.transportForm.costEstimate}</p>
                    {estimatedCost !== null ? (
                      <p className="text-2xl font-bold text-gold">{estimatedCost.toLocaleString()} MT</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.transportForm.fillAbove}</p>
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={calculateEstimate} className="border-gold text-gold hover:bg-gold hover:text-navy-dark font-bold rounded-xl">
                    <Calculator className="w-4 h-4 mr-2" />
                    {t.transportForm.calculate}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">{t.transportForm.cancel}</Button>
                <Button type="submit" className="flex-1 bg-gold hover:bg-gold-light text-navy-dark font-bold rounded-xl">{t.transportForm.requestTransport}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransportForm;
