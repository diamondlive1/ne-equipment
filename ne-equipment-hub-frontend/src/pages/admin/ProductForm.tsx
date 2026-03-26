import { useState, useEffect } from 'react';
import {
    X,
    Upload,
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface Category {
    id: number;
    name: string;
}

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
    old_price: number | string;
    stock_quantity: number;
    category_id: number;
    images?: ProductImage[];
}

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
    const isEditing = !!product;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        brand: product?.brand || '',
        sku: product?.sku || '',
        price: product?.price || '',
        old_price: product?.old_price || '',
        stock_quantity: product?.stock_quantity || 0,
        category_id: product?.category_id?.toString() || '',
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product?.images || []);
    const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const totalImages = existingImages.length - imagesToRemove.length + newImages.length + files.length;

        if (totalImages > 4) {
            toast({
                title: "Limite de imagens excedido",
                description: "Pode carregar no máximo 4 imagens por produto.",
                variant: "destructive"
            });
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        // Generate previews
        const newUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newUrls]);
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (id: number) => {
        setImagesToRemove(prev => [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            // Handle images
            newImages.forEach(image => {
                data.append('images[]', image);
            });

            if (isEditing) {
                imagesToRemove.forEach(id => {
                    data.append('remove_images[]', id.toString());
                });

                // Laravel handling of PUT/PATCH with FormData is tricky, we use POST with _method or just POST to a dedicated update route
                await api.post(`/products/${product.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            toast({
                title: "Sucesso!",
                description: isEditing ? "Produto atualizado com sucesso." : "Produto criado com sucesso.",
            });
            onSuccess();
        } catch (error: any) {
            console.error('Error saving product:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Ocorreu um erro ao guardar o produto.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-2xl border border-border shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
                    <p className="text-sm text-muted-foreground">Preencha todos os detalhes técnicos do seu produto.</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informação Básica */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Gerador Industrial 150kVA"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                            id="brand"
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                            placeholder="Ex: Cummins, NE Safety"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU / Modelo</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="#NE-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria *</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={val => setFormData({ ...formData, category_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição Técnica</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes sobre potência, dimensões, certificações..."
                            className="min-h-[120px]"
                        />
                    </div>
                </div>

                {/* Preços e Inventário */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço Actual (MT) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="old_price">Preço Anterior (MT)</Label>
                            <Input
                                id="old_price"
                                type="number"
                                step="0.01"
                                value={formData.old_price}
                                onChange={e => setFormData({ ...formData, old_price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Quantidade em Stock *</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock_quantity}
                                onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>
                    </div>

                    {/* Imagens */}
                    <div className="space-y-3 pt-2">
                        <Label>Imagens do Produto (Máximo 4)</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {/* Existing Images */}
                            {existingImages.filter(img => !imagesToRemove.includes(img.id)).map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-lg border overflow-hidden group">
                                    <img
                                        src={img.image_path?.startsWith('data:image') || img.image_path?.startsWith('http') ? img.image_path : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${img.image_path}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img.id)}
                                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* New Previews */}
                            {previewUrls.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-lg border overflow-hidden border-primary/30 group">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Placeholder */}
                            {(existingImages.length - imagesToRemove.length + newImages.length) < 4 && (
                                <label className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center transition-all">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-[10px] mt-1 font-medium text-muted-foreground">Upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Imagem principal será a primeira carregada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t font-bold">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-navy-dark text-white px-8" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {isEditing ? 'Guardar Alterações' : 'Publicar Produto'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;
