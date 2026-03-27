import { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Edit, 
    Package, 
    Info, 
    ImageIcon, 
    Columns, 
    Loader2,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import api from '@/services/api';

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
    stock_quantity: number;
    specifications: any;
    images?: ProductImage[];
    category?: { name: string };
}

interface AdminProductDetailProps {
    productId: number;
    onBack: () => void;
    onEdit: (product: Product) => void;
}

const AdminProductDetail = ({ productId, onBack, onEdit }: AdminProductDetailProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product details for admin:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">A carregar detalhes do produto...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="text-lg font-bold">Produto não encontrado</h3>
                <Button onClick={onBack} variant="link" className="text-primary mt-2">Voltar para a lista</Button>
            </div>
        );
    }

    const images = product.images?.length
        ? product.images.map(img => img.image_path?.startsWith('data:image') || img.image_path?.startsWith('http') ? img.image_path : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${img.image_path}`)
        : ['/placeholder-product.png'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Inventário
                </Button>
                <Button onClick={() => onEdit(product)} className="bg-primary hover:bg-navy-dark text-white font-bold gap-2 shadow-sm">
                    <Edit className="w-4 h-4" /> Editar Produto
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visualização de Imagens */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-2xl border border-border overflow-hidden p-4 aspect-square flex items-center justify-center shadow-sm">
                        <motion.img
                            key={activeImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={images[activeImage]}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-white flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/20'}`}
                            >
                                <img src={img} className="w-full h-full object-contain p-1" alt={`Thumb ${idx}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Painel */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">
                                    {product.category?.name || 'Sem Categoria'}
                                </Badge>
                                <h2 className="text-2xl font-bold text-navy-dark leading-tight">{product.name}</h2>
                                <p className="text-sm text-muted-foreground font-mono mt-1">SKU: {product.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${product.stock_quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <Package className="w-3 h-3" />
                                    {product.stock_quantity > 0 ? `${product.stock_quantity} em Stock` : 'Fora de Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Marca</h4>
                                <p className="text-foreground font-medium">{product.brand || 'Original (NE Equipment)'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Descrição Técnica</h4>
                                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{product.description || 'Nenhuma descrição disponível.'}</p>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <Tabs defaultValue="specs">
                            <TabsList className="w-full flex justify-start bg-muted/30 border-b border-border rounded-none h-auto p-0 px-6">
                                <TabsTrigger value="specs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground rounded-none py-4 text-xs font-bold uppercase tracking-widest">
                                    Especificações
                                </TabsTrigger>
                                <TabsTrigger value="internal" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground rounded-none py-4 text-xs font-bold uppercase tracking-widest">
                                    Dados Internos
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="specs" className="p-6">
                                <div className="border border-border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {product.specifications ? Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                                                <tr key={key} className="border-b border-border last:border-0 hover:bg-muted/10">
                                                    <th className="bg-muted/30 px-4 py-3 text-left font-bold text-navy-dark w-1/3 capitalize">{key.replace('_', ' ')}</th>
                                                    <td className="px-4 py-3 text-muted-foreground">{value}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td className="p-4 text-center text-muted-foreground italic">Nenhuma especificação técnica definida.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                            <TabsContent value="internal" className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">ID do Produto</p>
                                        <p className="font-mono text-sm">#PROD-{product.id}</p>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Visibilidade</p>
                                        <p className="flex items-center gap-2 text-sm text-green-600 font-bold"><CheckCircle2 className="w-3 h-3" /> Público no Catálogo B2B</p>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Garantia Oferecida</p>
                                        <p className="flex items-center gap-2 text-sm"><ShieldCheck className="w-3 h-3 text-primary" /> 12 Meses (Padrão)</p>
                                    </div>
                                    <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Políticas de Entrega</p>
                                        <p className="flex items-center gap-2 text-sm"><Truck className="w-3 h-3 text-primary" /> Maputo (2-5 dias úteis)</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
                                    <Info className="w-5 h-5 text-yellow-600 shrink-0" />
                                    <p className="text-xs text-yellow-700 leading-relaxed italic">
                                        Nota Admin: As alterações feitas neste produto reflectem-se instantaneamente no catálogo público para todos os clientes B2B.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductDetail;
