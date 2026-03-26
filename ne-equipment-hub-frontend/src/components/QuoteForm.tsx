import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Check, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import logoNE from '@/assets/logo-ne-equipment.png';
import { useCart } from '@/hooks/useCart';
import api from '@/services/api';
import { useQuote } from '@/contexts/QuoteContext';

const QuoteForm = () => {
  const { isQuoteFormOpen: isOpen, closeQuoteForm: onClose } = useQuote();
  const [formData, setFormData] = useState({ empresa: '', nif: '', email: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();
  const { getB2BItems, clearB2BItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(language === 'PT' ? 'Por favor, inicie sessão para solicitar uma cotação.' : 'Please sign in to request a quote.');
      onClose();
      navigate('/login');
      return;
    }

    const b2bItems = getB2BItems();

    if (b2bItems.length === 0 && !formData.empresa) {
      toast.error(language === 'PT' ? 'Por favor, adicione produtos ou preencha os dados.' : 'Please add products or fill in the details.');
      return;
    }

    // Construct WhatsApp message
    let message = `*${t.quoteForm.title}*\n\n`;
    message += `*${t.quoteForm.company}:* ${formData.empresa}\n`;
    message += `*${t.quoteForm.nif}:* ${formData.nif}\n`;
    message += `*${t.quoteForm.email}:* ${formData.email}\n\n`;

    if (b2bItems.length > 0) {
      message += `*${language === 'PT' ? 'Produtos Solicitados' : 'Requested Products'}:*\n`;
      b2bItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (${item.quantity} ${t.header.units})\n`;
        if (item.specifications) {
          message += `   _Ref: ${item.specifications}_\n`;
        }
      });
    }

    if (selectedFile) {
      message += `\n📎 *${language === 'PT' ? 'Anexo' : 'Attachment'}:* ${selectedFile.name}\n`;
      message += `_${language === 'PT' ? '(Por favor, anexe o ficheiro manualmente no WhatsApp)' : '(Please attach the file manually in WhatsApp)'}_`;
    }

    const whatsappNumber = '258843114354';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // 1. Enviar para o Backend para persistência e notificação do Admin
    const sendToBackend = async () => {
      try {
        await api.post('/quotes', {
          empresa: formData.empresa,
          nif: formData.nif,
          email: formData.email,
          items: b2bItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          }))
        });
        
        // 2. Abrir WhatsApp (Fluxo legado mantido para conveniência do cliente)
        window.open(whatsappUrl, '_blank');

        clearB2BItems();
        setSelectedFile(null);
        toast.success(t.quoteForm.success);
        onClose();
      } catch (error) {
        console.error('Error submitting quote:', error);
        toast.error(language === 'PT' ? 'Erro ao processar cotação. Tente novamente.' : 'Error processing quote. Please try again.');
      }
    };

    sendToBackend();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-navy-dark to-navy p-8 md:w-1/3 flex flex-col justify-between">
                <div>
                  <img src={logoNE} alt="NE Equipment" className="h-16 w-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">{t.quoteForm.title}</h2>
                  <div className="flex items-center gap-2 text-gold text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    {t.quoteForm.corporatePricing}
                  </div>
                </div>
              </div>

              <div className="p-8 md:w-2/3 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">{t.quoteForm.detailsTitle}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.quoteForm.company}</Label>
                    <Input value={formData.empresa} onChange={(e) => setFormData({ ...formData, empresa: e.target.value })} className="mt-1 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.quoteForm.nif}</Label>
                      <Input value={formData.nif} onChange={(e) => setFormData({ ...formData, nif: e.target.value })} className="mt-1 rounded-xl" required />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.quoteForm.email}</Label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 rounded-xl" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t.quoteForm.attachDoc}</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-1 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer bg-gold/5 ${selectedFile ? 'border-gold bg-gold/10' : 'border-gold/30 hover:border-gold/50'}`}
                    >
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <Check className="w-8 h-8 text-gold mx-auto mb-2" />
                          <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="text-xs text-destructive mt-2 hover:underline"
                          >
                            {language === 'PT' ? 'Remover' : 'Remove'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{t.quoteForm.clickToSelect}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-navy-dark font-bold mt-6 rounded-xl">{t.quoteForm.submit}</Button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuoteForm;
