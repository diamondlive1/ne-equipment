import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, ArrowRight, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface CatalogSectionProps {
  onNavigateB2B?: () => void;
}

const CatalogSection = ({ onNavigateB2B }: CatalogSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);

        const products = prodsRes.data;
        const dynamicCategories = catsRes.data.map((cat: any) => {
          // Find products for this category to get count and a cover image
          const catProducts = products.filter((p: any) => p.category?.id === cat.id);
          const firstProductWithImage = catProducts.find((p: any) => p.images && p.images.length > 0);
          
          let coverImage = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'; // fallback
          if (firstProductWithImage) {
            const imgPath = firstProductWithImage.images.find((i: any) => i.is_primary)?.image_path || firstProductWithImage.images[0].image_path;
            coverImage = `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${imgPath}`;
          }

          return {
            name: cat.name,
            description: `Explore nossa linha de ${cat.name.toLowerCase()}`,
            image: coverImage,
            count: catProducts.length
          };
        }).filter((c: any) => c.count > 0); // Only show categories with products

        setCategories(dynamicCategories);
      } catch (error) {
        console.error('Error fetching catalog section data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCatalogData();
  }, []);

  return (
    <section id="catalogo" className="py-20 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.catalog.subtitle}</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">
            {t.catalog.title} <span className="text-gold">{t.catalog.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.catalog.description}</p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {!user && (
            <div className="mb-8 p-4 glass-card bg-navy-dark/5 flex flex-col sm:flex-row items-center justify-center gap-4">
              <p className="text-center text-sm text-muted-foreground">
                <Lock className="w-4 h-4 inline mr-2" />
                {t.catalog.b2bNotice}
              </p>
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="outline" 
                size="sm" 
                className="gap-2 border-gold text-navy-dark hover:bg-gold hover:text-navy-dark font-bold rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                {language === 'PT' ? 'Entrar' : 'Login'}
              </Button>
            </div>
          )}
          {user && (
            <div className="mb-8 p-4 glass-card bg-navy-dark/5">
              <p className="text-center text-sm text-muted-foreground">
                <Lock className="w-4 h-4 inline mr-2" />
                {t.catalog.b2bNotice}
              </p>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhuma categoria com produtos disponível de momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {categories.map((category, index) => (
                <motion.div key={category.name} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }} className="group cursor-pointer" onClick={onNavigateB2B}>
                  <div className="glass-card overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-[4/3] relative overflow-hidden shrink-0">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-navy-dark/20 to-transparent" />
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white/80 bg-navy-dark/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {category.count} produtos
                      </span>
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-foreground mb-1 text-sm leading-tight">{category.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.8 }} className="mt-12 text-center">
            <Button size="lg" className="bg-navy-dark hover:bg-navy text-white font-bold rounded-xl" onClick={onNavigateB2B}>
              {t.catalog.accessB2B}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
