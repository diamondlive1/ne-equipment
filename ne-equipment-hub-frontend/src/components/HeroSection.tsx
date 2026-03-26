import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import api from '@/services/api';

interface HeroSectionProps {
  onQuoteClick: () => void;
}

const FALLBACK_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', alt: 'IT Equipment' },
  { src: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', alt: 'Industrial Equipment' },
  { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop', alt: 'Technology' },
  { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop', alt: 'Office' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', alt: 'Machinery' },
  { src: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=300&fit=crop', alt: 'Hospital Equipment' },
  { src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', alt: 'Agricultural Equipment' },
  { src: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=400&h=300&fit=crop', alt: 'Computers' },
];

const HeroSection = ({ onQuoteClick }: HeroSectionProps) => {
  const { t } = useLanguage();
  const [productImages, setProductImages] = useState<{src: string, alt: string}[]>(FALLBACK_IMAGES);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await api.get('/products');
        const productsWithImages = response.data.filter((p: any) => p.images && p.images.length > 0);
        
        if (productsWithImages.length > 0) {
          const dynamicImages = productsWithImages.map((p: any) => {
            const primaryImg = p.images.find((i: any) => i.is_primary) || p.images[0];
            return {
              src: primaryImg.image_path?.startsWith('data:image') || primaryImg.image_path?.startsWith('http') ? primaryImg.image_path : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${primaryImg.image_path}`,
              alt: p.name
            };
          });
          
          // Ensure we have at least 8 images to keep the marquee looking full by filling with fallbacks if needed
          const finalImages = [...dynamicImages];
          let i = 0;
          while (finalImages.length < 8) {
            finalImages.push(FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]);
            i++;
          }
          
          setProductImages(finalImages);
        }
      } catch (error) {
        console.error('Error fetching products for hero:', error);
      }
    };
    fetchImages();
  }, []);

  const stats = [
    { value: '15+', label: t.hero.stats.experience },
    { value: '3', label: t.hero.stats.offices },
    { value: '500+', label: t.hero.stats.products },
    { value: '100%', label: t.hero.stats.commitment },
  ];

  const features = [
    { icon: Truck, title: t.hero.features.logistics, description: t.hero.features.logisticsDesc },
    { icon: CheckCircle, title: t.hero.features.quality, description: t.hero.features.qualityDesc },
    { icon: Shield, title: t.hero.features.transparency, description: t.hero.features.transparencyDesc },
  ];

  return (
    <section id="home" className="relative pt-32 md:pt-40">
      <div className="relative min-h-[600px] md:min-h-[700px] overflow-hidden bg-gradient-to-br from-navy-dark via-navy to-navy-light">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-gold/20 backdrop-blur-sm rounded-full text-gold text-sm font-semibold mb-6">
                {t.hero.badge}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t.hero.title}{' '}
                <span className="text-gold">{t.hero.titleHighlight}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button onClick={onQuoteClick} size="lg" className="bg-gold hover:bg-gold-light text-navy-dark font-bold px-8 rounded-full shadow-lg shadow-gold/30">
                  {t.hero.requestQuote}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 rounded-full backdrop-blur-sm" asChild>
                  <a href="#catalogo">{t.hero.viewCatalog}</a>
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
              <div className="relative">
                <div className="glass-card p-6 rounded-3xl">
                  <div className="grid grid-cols-2 gap-4">
                    {productImages.slice(0, 4).map((img, index) => (
                      <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }} className="relative overflow-hidden rounded-xl group">
                        <img src={img.src} alt={img.alt} className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-sm font-medium">{img.alt}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 py-8 bg-gradient-to-t from-navy-dark to-transparent">
          <div className="overflow-hidden">
            <motion.div className="flex gap-6" animate={{ x: [0, -1920] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
              {[...productImages, ...productImages, ...productImages].map((img, index) => (
                <div key={index} className="flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden glass-card">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-navy-dark py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * index }} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-gold mb-2">{stat.value}</p>
                <p className="text-xs md:text-sm text-white/60 uppercase tracking-wider font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why NE Equipment */}
      <div className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <span className="text-sm text-gold font-semibold uppercase tracking-wider">{t.hero.whySubtitle}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
              {t.hero.whyTitle} <span className="text-gold">NE Equipment</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t.hero.whyDescription}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * index }} className="glass-card p-8 hover:shadow-2xl transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-navy-dark" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
