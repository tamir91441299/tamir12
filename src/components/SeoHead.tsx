import React, { useEffect } from 'react';
import { Movie } from '../types';

interface SeoHeadProps {
  activeTab?: string;
  selectedMovie?: Movie | null;
  searchQuery?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  activeTab = 'home',
  selectedMovie,
  searchQuery,
}) => {
  useEffect(() => {
    let pageTitle = 'IOIO TV - Монгол хадмал, дуу оруулгатай онлайн кино театр';
    let metaDescription =
      'IOIO TV - Монгол хадмал болон орчуулгатай сүүлийн үеийн уран сайхны кино, олон ангит цуврал, анимэ, Солонгос драмуудыг өндөр чанартайгаар шууд үзэх онлайн платформ.';
    let ogImage =
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';
    let jsonLdData: any = null;

    if (selectedMovie) {
      pageTitle = `${selectedMovie.titleMongolian} (${selectedMovie.title}) Үзэх | IOIO TV`;
      metaDescription = `${selectedMovie.titleMongolian} (${selectedMovie.year}) - ${selectedMovie.description.slice(0, 150)}... Монгол хадмал, дуу оруулгатай HD чанараар үзэх.`;
      ogImage = selectedMovie.backdrop || selectedMovie.poster;

      // Schema.org Movie / TVSeries JSON-LD
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': selectedMovie.type === 'series' ? 'TVSeries' : 'Movie',
        name: selectedMovie.titleMongolian,
        alternateName: selectedMovie.title,
        description: selectedMovie.description,
        image: selectedMovie.poster,
        dateCreated: `${selectedMovie.year}-01-01`,
        genre: selectedMovie.genres,
        director: {
          '@type': 'Person',
          name: selectedMovie.director || 'Unknown',
        },
        actor: selectedMovie.cast?.map((actorName) => ({
          '@type': 'Person',
          name: actorName,
        })),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedMovie.rating,
          bestRating: '10',
          worstRating: '1',
          ratingCount: selectedMovie.views || 100,
        },
      };
    } else if (searchQuery && searchQuery.trim()) {
      pageTitle = `"${searchQuery}" Хайлтын үр дүн | IOIO TV`;
      metaDescription = `IOIO TV дээр "${searchQuery}" түлхүүр үгээр кино, цуврал, анимэ хайх.`;
    } else if (activeTab === 'movies') {
      pageTitle = 'Бүх Уран Сайхны Кинонууд | IOIO TV';
      metaDescription = 'Сүүлийн үеийн Холливуд, Солонгос болон Монгол уран сайхны кинонуудыг монгол дуу оруулгатайгаар үзээрэй.';
    } else if (activeTab === 'series') {
      pageTitle = 'Олон Ангит Цуврал Кинонууд | IOIO TV';
      metaDescription = 'Солонгос драм, АНУ болон Дэлхийн шилдэг олон ангит цуврал кинонуудыг шинэ анги бүрээр нь шууд үзэх.';
    } else if (activeTab === 'anime') {
      pageTitle = 'Анимэ Кино & Цувралууд Монгол Орчуулгатай | IOIO TV';
      metaDescription = 'Шилдэг Япон анимэ цуврал ба бүрэн хэмжээний анимэ кинонуудыг монгол хадмал, дуу оруулгатайгаар үзээрэй.';
    } else if (activeTab === 'games') {
      pageTitle = 'Анимэ Нэр Таах Тоглоом | IOIO TV Games';
      metaDescription = 'Анимэ сонирхогчдод зориулсан хөгжилтэй Анимэ Нэр Таах викторина тоглоом.';
    }

    // Update Document Title
    document.title = pageTitle;

    // Update Meta Description
    let metaDescElement = document.querySelector('meta[name="description"]');
    if (metaDescElement) {
      metaDescElement.setAttribute('content', metaDescription);
    }

    // Update OpenGraph Title & Description & Image
    let ogTitleElement = document.querySelector('meta[property="og:title"]');
    if (ogTitleElement) ogTitleElement.setAttribute('content', pageTitle);

    let ogDescElement = document.querySelector('meta[property="og:description"]');
    if (ogDescElement) ogDescElement.setAttribute('content', metaDescription);

    let ogImageElement = document.querySelector('meta[property="og:image"]');
    if (ogImageElement) ogImageElement.setAttribute('content', ogImage);

    // Update Dynamic JSON-LD Script
    let existingJsonLd = document.getElementById('dynamic-json-ld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLdData) {
      const script = document.createElement('script');
      script.id = 'dynamic-json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLdData);
      document.head.appendChild(script);
    }
  }, [activeTab, selectedMovie, searchQuery]);

  return null;
};
