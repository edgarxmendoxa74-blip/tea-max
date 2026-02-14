import React, { memo, useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

const DEFAULT_HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1544787210-22dbdc1763f6?q=80&w=2070&auto=format&fit=crop',
    title: 'Pure Milk Tea &',
    subtitle: 'Finest Coffee',
    description: 'Simple ingredients, exceptional taste. Discover our curated selection of handcrafted beverages at Tea Max Milk Tea Hub.'
  },
  {
    url: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?q=80&w=2070&auto=format&fit=crop',
    title: 'Experience The',
    subtitle: 'Perfect Brew',
    description: 'Our coffee is roasted to perfection, bringing out the rich and bold flavors in every cup.'
  }
];

const Hero: React.FC = () => {
  const { siteSettings } = useSiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = siteSettings?.hero_slides && siteSettings.hero_slides.length > 0
    ? siteSettings.hero_slides
    : siteSettings
      ? [
        {
          url: siteSettings.hero_image || DEFAULT_HERO_IMAGES[0].url,
          title: siteSettings.hero_title || DEFAULT_HERO_IMAGES[0].title,
          subtitle: siteSettings.hero_subtitle || DEFAULT_HERO_IMAGES[0].subtitle,
          description: siteSettings.hero_description || DEFAULT_HERO_IMAGES[0].description
        },
        ...DEFAULT_HERO_IMAGES.slice(1)
      ]
      : DEFAULT_HERO_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <>
      <section className="relative min-h-[450px] md:h-[500px] flex flex-col md:flex-row overflow-hidden bg-teamax-dark">
        {/* Left Content (Text) */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-10 md:py-0 z-20 order-2 md:order-1 bg-teamax-dark">
          <div className="max-w-xl text-left">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 animate-fade-in tracking-tight text-teamax-primary leading-tight">
              {heroImages[currentSlide].title}
              <span className="block mt-2">
                {heroImages[currentSlide].subtitle}
              </span>
            </h1>
            <p className="text-base md:text-lg mb-8 text-black/80 animate-slide-up font-sans leading-relaxed tracking-wide">
              {heroImages[currentSlide].description}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              {/* Operating Hours Badge */}
              <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-black/5 backdrop-blur-md rounded-2xl border border-black/10 animate-fade-in shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-black/90">Open Daily</span>
                </div>
                <div className="w-px h-4 bg-black/20"></div>
                <div className="flex items-center gap-2 text-black font-bold text-[10px] uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span>{siteSettings?.store_hours || '06:00 AM - 10:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content (Slideshow Banner) */}
        <div className="w-full md:w-1/2 relative h-[300px] md:h-auto order-1 md:order-2 overflow-hidden shadow-2xl">
          {heroImages.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] ease-linear"
                style={{
                  backgroundImage: `url(${slide.url})`,
                  transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)'
                }}
              />
              {/* Overlay for better transition perception */}
              <div className="absolute inset-0 bg-gradient-to-r from-teamax-dark/30 via-transparent to-transparent md:from-teamax-dark/20" />
            </div>
          ))}

          {/* Navigation Arrows */}
          <div className="absolute inset-0 z-30 flex items-center justify-between px-4 pointer-events-none">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-black/20 hover:bg-teamax-accent backdrop-blur-md transition-all text-black border border-white/10 pointer-events-auto group"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-black/20 hover:bg-teamax-accent backdrop-blur-md transition-all text-black border border-white/10 pointer-events-auto group"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-30 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 transition-all duration-300 rounded-full shadow-lg ${index === currentSlide ? 'bg-teamax-accent w-8' : 'bg-white/40 w-4 hover:bg-white/60'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(Hero);
