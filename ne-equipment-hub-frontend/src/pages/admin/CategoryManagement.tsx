import { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    FolderTree, 
    Search, 
    Loader2, 
    X, 
    Check,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import api from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
}

const CategoryManagement = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as categorias.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, { name: categoryName });
                toast({
                    title: "Sucesso",
                    description: "Categoria atualizada com sucesso.",
                });
            } else {
                await api.post('/categories', { name: categoryName });
                toast({
                    title: "Sucesso",
                    description: "Categoria criada com sucesso.",
                });
            }
            fetchCategories();
            handleCloseDialog();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Ocorreu um erro ao guardar a categoria.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem a certeza que deseja eliminar esta categoria? Isto poderá afectar os produtos associados.')) return;

        try {
            await api.delete(`/categories/${id}`);
            toast({
                title: "Sucesso",
                description: "Categoria eliminada com sucesso.",
            });
            fetchCategories();
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Não foi possível eliminar a categoria.",
                variant: "destructive"
            });
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">A carregar categorias...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestão de Categorias</h2>
                    <p className="text-muted-foreground text-sm">Organize o seu catálogo de produtos.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-navy-dark text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Nova Categoria
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar categorias..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <div 
                        key={category.id} 
                        className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FolderTree className="w-4 h-4 text-primary" />
                                    <h3 className="font-bold text-lg">{category.name}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono">slug: {category.slug}</p>
                                <div className="pt-2">
                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                                        {category.products_count || 0} Produtos
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => handleOpenDialog(category)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(category.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && !isLoading && (
                    <div className="col-span-full py-12 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                        <FolderTree className="w-12 h-12 mb-4 opacity-20" />
                        <p>Nenhuma categoria encontrada.</p>
                        <Button variant="link" onClick={() => handleOpenDialog()} className="text-primary mt-2">
                            Criar a primeira categoria
                        </Button>
                    </div>
                )}
            </div>

            {/* Dialog de Criação/Edição */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                {editingCategory ? 'Formas de editar os detalhes da categoria selecionada.' : 'Preencha o formulário para criar uma nova categoria.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Nome da Categoria *
                                </label>
                                <Input
                                    id="name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Ex: Geradores Industrias"
                                    required
                                    autoFocus
                                />
                            </div>
                            {!editingCategory && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> O slug será gerado automaticamente.
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !categoryName.trim()} className="bg-primary hover:bg-navy-dark text-white">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        A guardar...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        {editingCategory ? 'Guardar Alterações' : 'Criar Categoria'}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryManagement;
