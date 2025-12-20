'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';

interface Program {
  title: string;
  description: string;
  image: string;
}

interface ProgramsSliderProps {
  dictionary: Dictionary;
  locale: Locale;
  programs: Program[];
}

export function ProgramsSlider({ dictionary, locale, programs }: ProgramsSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="relative py-24 px-4 bg-[#0f0f0f] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-linear-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            {dictionary.pages.home.programs.title}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {dictionary.pages.home.programs.subtitle}
          </p>
        </motion.div>

        {/* Slider Container */}
        <div className="relative">
          {/* Add inner horizontal padding so the first/last cards don't stick to the edges */}
          <div className="overflow-hidden px-2 sm:px-3 lg:px-4" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-5 pr-2 sm:pr-3 lg:pr-4">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="flex-[0_0_92%] min-w-0 sm:flex-[0_0_48%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div className="relative group h-full">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 rounded-3xl blur-2xl transition-opacity" />
                      
                      {/* Card */}
                      <Card className="relative h-full flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/25 transition-colors overflow-hidden rounded-3xl">
                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Image */}
                          <div className="h-48 sm:h-52 relative overflow-hidden">
                            <motion.img
                              src={program.image}
                              alt={program.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {/* Content */}
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-extrabold mb-2 text-white">
                              {program.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-5 flex-1 leading-relaxed">
                              {program.description}
                            </p>
                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="ghost"
                                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-colors py-5 rounded-xl font-bold group/btn"
                              >
                                {dictionary.pages.home.programs.learnMore}
                                <ChevronRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 flex items-center justify-center text-white transition-all group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </motion.button>

            {/* Dots */}
            <div className="flex gap-2">
              {scrollSnaps.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? 'w-8 bg-linear-to-r from-blue-500 to-purple-600'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollNext}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 flex items-center justify-center text-white transition-all group"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
