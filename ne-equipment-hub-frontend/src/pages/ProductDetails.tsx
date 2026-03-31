import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Truck, Clock, Heart, Share2, Plus, Minus, Check, AlertCircle, Loader2, MapPin, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import api from '@/services/api';
import { useQuote } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';



interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    brand: string;
    sku: string;
    price: number | string;
    old_price?: number | string;
    stock_quantity: number;
    specifications: any;
    images?: ProductImage[];
}

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { openQuoteForm } = useQuote();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const { language } = useLanguage(); // Need this if not already imported

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFreightModalOpen, setIsFreightModalOpen] = useState(false);
    const [freightDestination, setFreightDestination] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
                <Header currentPage="home" onNavigate={() => navigate('/')} onQuoteClick={() => navigate('/')} onTransportClick={() => navigate('/')} />
                <main className="flex-1 flex flex-col items-center justify-center pt-32 p-4 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-3xl font-bold text-navy-dark mb-2">Produto não encontrado</h1>
                    <p className="text-gray-500 mb-6">O produto que procura não existe ou foi removido.</p>
                    <Button onClick={() => navigate('/')} className="bg-navy hover:bg-navy-dark">Voltar à Página Inicial</Button>
                </main>
                <Footer />
            </div>
        );
    }

    const images = product.images?.length
        ? product.images.map(img => img.image_path?.startsWith('data:image') || img.image_path?.startsWith('http') ? img.image_path : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${img.image_path}`)
        : ['/placeholder-product.png'];

    const handleAddToCart = (openForm = false) => {
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: Number(product.price),
            category: 'general',
            quantity: quantity
        });
        toast.success(openForm ? 'Adicionado à cotação' : 'Produto adicionado ao carrinho', { description: product.name });
        
        if (openForm) {
            openQuoteForm();
        }
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleFreightRequest = () => {
        const number = '+258843114354';
        const msg = `Olá! Gostaria de solicitar informações de frete para:\n\n🛒 *Produto:* ${product?.name}\n📦 *Quantidade:* ${quantity} unidade(s)\n📍 *Destino:* ${freightDestination || 'A indicar'}\n\nPor favor, podem enviar uma cotação de frete?`;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
        setIsFreightModalOpen(false);
        setFreightDestination('');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
            <Header
                currentPage="b2b"
                onNavigate={(page) => {
                    if (page === 'dashboard') navigate('/dashboard');
                    else navigate('/');
                }}
                onQuoteClick={openQuoteForm}
                onTransportClick={() => navigate('/servicos')}
            />

            <main className="flex-1 container mx-auto px-4 py-8 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Galeria de Imagens */}
                    <div className="lg:col-span-5 h-auto">
                        <div className="flex gap-4 h-full flex-col md:flex-row-reverse lg:flex-row-reverse">
                            <div className="flex-1 rounded-2xl overflow-hidden bg-white border border-gray-100 p-4 aspect-square relative group">

                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={images[activeImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-500 origin-center cursor-zoom-in"
                                />
                            </div>

                            <div className="flex md:flex-col lg:flex-col gap-3 overflow-x-auto md:w-20 lg:w-20 md:overflow-visible no-scrollbar pb-2 md:pb-0">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onMouseEnter={() => setActiveImage(idx)}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${activeImage === idx ? 'border-navy-dark shadow-md' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Informações do Produto */}
                    <div className="lg:col-span-4 flex flex-col">
                        <div className="mb-2">
                            <span className="text-sm text-gold-dark font-semibold uppercase tracking-wider">{product.brand || 'NE Equipment'}</span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-navy-dark leading-tight mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6 flex-wrap">
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500 mr-1" />
                                <span className="font-bold text-sm text-yellow-700">4.8</span>
                                <span className="text-xs text-yellow-600/70 ml-1">(12 avaliações)</span>
                            </div>
                            <span className="text-sm font-medium text-gray-500">24 vendidos</span>
                        </div>



                        <p className="text-sm text-muted-foreground mb-8">
                            {product.description}
                        </p>

                        <div className="hidden lg:grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600"><ShieldCheck className="w-4 h-4 text-green-500" /> Garantia Oficial</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500" /> Produto Certificado</div>
                        </div>
                    </div>

                    {/* Barra Lateral de Compra */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sticky top-32">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-navy font-bold text-xl uppercase">
                                    N
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Vendido por</p>
                                    <p className="text-sm font-bold text-navy-dark">NE Equipment Hub</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6 text-sm">
                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-gold-dark mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-bold text-navy-dark">Entrega em Moçambique</p>
                                        <p className="text-gray-500 mb-2">2 a 5 dias úteis</p>
                                        <button
                                            onClick={() => setIsFreightModalOpen(true)}
                                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-dark border border-gold/40 bg-gold/5 hover:bg-gold/15 px-3 py-1.5 rounded-lg transition-all duration-200"
                                        >
                                            <Send className="w-3 h-3" />
                                            Solicitar Frete
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-green-600">Disponibilidade</p>
                                        <p className="text-gray-500">{product.stock_quantity > 0 ? `Em estoque (${product.stock_quantity})` : 'Sob Encomenda'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-semibold text-navy-dark mb-2 block uppercase tracking-wider">Quantidade</label>
                                <div className="flex items-center w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-12">
                                    <button onClick={handleDecreaseQuantity} className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-navy transition-colors font-bold text-lg"><Minus className="w-4 h-4" /></button>
                                    <div className="flex-1 h-full flex items-center justify-center font-bold text-navy-dark bg-white border-x border-gray-100">
                                        {quantity}
                                    </div>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-navy transition-colors font-bold text-lg"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {!isAdmin ? (
                                    <>
                                        <Button className="w-full bg-navy-dark hover:bg-navy text-white font-bold h-12 rounded-xl text-base" onClick={() => handleAddToCart(true)}>
                                            Solicitar Cotação
                                        </Button>
                                        <Button variant="outline" onClick={() => handleAddToCart(false)} className="w-full border-gold text-navy-dark hover:bg-gold/10 font-bold h-12 rounded-xl">
                                            Adicionar ao Carrinho
                                        </Button>
                                    </>
                                ) : (
                                    <div className="p-4 bg-muted/30 border border-dashed border-border rounded-xl text-center">
                                        <p className="text-sm text-muted-foreground italic">
                                            {language === 'PT' ? 'Administradores não podem solicitar cotações.' : 'Administrators cannot request quotes.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center gap-6 mt-6 border-t border-gray-100 pt-6">
                                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold">Desejos</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-navy-dark transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold">Partilhar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 mt-8 mb-16">
                    <Tabs defaultValue="specs">
                        <TabsList className="w-full flex justify-start bg-transparent border-b border-gray-100 rounded-none h-auto p-0 space-x-8">
                            <TabsTrigger value="specs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gold data-[state=active]:text-navy-dark text-gray-500 rounded-none pb-4 text-base font-semibold">
                                Especificações
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gold data-[state=active]:text-navy-dark text-gray-500 rounded-none pb-4 text-base font-semibold">
                                Avaliações
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="specs" className="mt-8">
                            <div className="max-w-3xl border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <th className="bg-gray-50 px-6 py-4 text-navy-dark font-medium w-1/3">Marca</th>
                                            <td className="px-6 py-4 text-gray-600">{product.brand || 'Original'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <th className="bg-gray-50 px-6 py-4 text-navy-dark font-medium">SKU / Modelo</th>
                                            <td className="px-6 py-4 text-gray-600 font-mono">{product.sku}</td>
                                        </tr>
                                        {product.specifications && Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                                            <tr key={key} className="border-b border-gray-200">
                                                <th className="bg-gray-50 px-6 py-4 text-navy-dark font-medium capitalize">{key.replace('_', ' ')}</th>
                                                <td className="px-6 py-4 text-gray-600">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-8">
                            <div className="text-center py-12">
                                <div className="text-5xl font-black text-navy-dark mb-2">4.8</div>
                                <div className="flex justify-center mb-2">
                                    <Star className="w-6 h-6 fill-gold text-gold" />
                                    <Star className="w-6 h-6 fill-gold text-gold" />
                                    <Star className="w-6 h-6 fill-gold text-gold" />
                                    <Star className="w-6 h-6 fill-gold text-gold" />
                                    <Star className="w-6 h-6 fill-gold text-gold" />
                                </div>
                                <p className="text-gray-500">Baseado em avaliações de clientes reais</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />

            {/* Modal Solicitar Frete */}
            {isFreightModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsFreightModalOpen(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 16 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-br from-navy-dark to-navy p-6 text-white relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-28 h-28 bg-gold/10 rounded-full" />
                            <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white/5 rounded-full" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gold/20 rounded-xl">
                                        <Truck className="w-5 h-5 text-gold" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Solicitar Frete</h3>
                                        <p className="text-white/60 text-xs">Receba uma cotação via WhatsApp</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsFreightModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Produto Info */}
                            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                                <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-navy" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Produto</p>
                                    <p className="text-sm font-bold text-navy-dark line-clamp-1">{product?.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {quantity} unidade(s)</p>
                                </div>
                            </div>

                            {/* Destino */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" /> Destino / Localização
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Maputo, Beira, Nampula..."
                                    value={freightDestination}
                                    onChange={(e) => setFreightDestination(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFreightRequest()}
                                    className="w-full h-12 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 bg-gray-50"
                                    autoFocus
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => setIsFreightModalOpen(false)}
                                    className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleFreightRequest}
                                    className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Enviar via WhatsApp
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
