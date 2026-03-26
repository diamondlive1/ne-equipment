import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Image as ImageIcon,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    category?: {
        name: string;
    };
    images?: {
        image_path: string;
        is_primary: boolean;
    }[];
}

interface ProductListProps {
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
}

const ProductList = ({ onAddProduct, onEditProduct }: ProductListProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os produtos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Tem a certeza que deseja eliminar este produto?')) return;

        try {
            await api.delete(`/products/${id}`);
            toast({
                title: "Sucesso",
                description: "Produto eliminado com sucesso.",
            });
            fetchProducts();
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível eliminar o produto.",
                variant: "destructive"
            });
        }
    };

    const filteredProducts = products.filter(p =>
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">A carregar inventário...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventário de Produtos</h2>
                    <p className="text-muted-foreground text-sm">Gerencie o seu catálogo.</p>
                </div>
                <Button onClick={onAddProduct} className="bg-primary hover:bg-navy-dark text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Adicionar Produto
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por nome ou SKU..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4" /> Filtros
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-bold">Produto</th>
                                <th className="px-6 py-4 font-bold">Categoria</th>
                                <th className="px-6 py-4 font-bold">Preço (MT)</th>
                                <th className="px-6 py-4 font-bold">Stock</th>
                                <th className="px-6 py-4 font-bold text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={(() => { const p = product.images.find(img => img.is_primary)?.image_path || product.images[0].image_path; return p?.startsWith('data:image') || p?.startsWith('http') ? p : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${p}`; })()}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground leading-tight">{product.name}</p>
                                                <p className="text-[11px] text-muted-foreground font-mono">{product.sku || 'SEM SKU'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-medium">
                                            {product.category?.name || 'Geral'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        {Number(product.price).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <span className={product.stock_quantity < 5 ? 'text-destructive flex items-center gap-1 font-bold' : ''}>
                                            {product.stock_quantity}
                                            {product.stock_quantity < 5 && <AlertCircle className="w-3 h-3" />}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => onEditProduct(product)} className="gap-2">
                                                    <Edit className="w-4 h-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(product.id)} className="gap-2 text-destructive focus:text-destructive">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
