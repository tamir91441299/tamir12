import { Router, Request, Response } from 'express';

const router = Router();

export interface MoviePackageInfo {
  id: string;
  category: 'anime' | 'movie' | 'full_vip';
  title: string;
  durationMonths: number;
  durationDays: number;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  description: string;
  badge: string;
  color: string;
}

const PACKAGES: MoviePackageInfo[] = [
  {
    id: 'anime_15d',
    category: 'anime',
    title: 'Анимэ Багц (15 Хоног)',
    durationMonths: 0.5,
    durationDays: 15,
    price: 2500,
    description: '15 хоногийн турш платформ дээрх бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзнэ.',
    badge: '🎌 15 хоног (2.5k)',
    color: 'rose',
  },
  {
    id: 'anime_1m',
    category: 'anime',
    title: 'Анимэ Багц (1 Сар)',
    durationMonths: 1,
    durationDays: 30,
    price: 5000,
    description: '30 хоногийн (1 сар) турш бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзэх багц.',
    badge: '🎌 1 САР (5k)',
    color: 'emerald',
  },
  {
    id: 'anime_2m',
    category: 'anime',
    title: 'Анимэ Багц (2 Сар)',
    durationMonths: 2,
    durationDays: 60,
    price: 8500,
    originalPrice: 10000,
    discountBadge: '1,500₮ Хэмнэлт',
    description: '60 хоногийн (2 сар) турш бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзэх хямдралтай багц.',
    badge: '🔥 2 САР (8.5k)',
    color: 'amber',
  },
  {
    id: 'movie_15d',
    category: 'movie',
    title: 'Кино Багц (15 Хоног)',
    durationMonths: 0.5,
    durationDays: 15,
    price: 2500,
    description: '15 хоногийн турш платформ дээрх бүх Уран сайхны кино болон ТВ цувралуудыг хязгааргүй үзнэ.',
    badge: '🎬 15 хоног (2.5k)',
    color: 'rose',
  },
  {
    id: 'movie_1m',
    category: 'movie',
    title: 'Кино Багц (1 Сар)',
    durationMonths: 1,
    durationDays: 30,
    price: 5000,
    description: '30 хоногийн (1 сар) турш бүх кино болон ТВ цувралуудыг хязгааргүй үзнэ.',
    badge: '🎬 1 САР (5k)',
    color: 'cyan',
  },
  {
    id: 'movie_2m',
    category: 'movie',
    title: 'Кино Багц (2 Сар)',
    durationMonths: 2,
    durationDays: 60,
    price: 8500,
    originalPrice: 10000,
    discountBadge: '1,500₮ Хэмнэлт',
    description: '60 хоногийн (2 сар) турш бүх кино болон ТВ цувралуудыг хязгааргүй үзэх хямдралтай багц.',
    badge: '🔥 2 САР (8.5k)',
    color: 'amber',
  },
  {
    id: 'full_vip_1m',
    category: 'full_vip',
    title: 'VIP Бүтэн Багц (1 Сар)',
    durationMonths: 1,
    durationDays: 30,
    price: 7000,
    description: '30 хоногийн турш Анимэ + Кино + ТВ цуврал БҮГД хязгааргүй багтсан VIP эрх.',
    badge: '👑 VIP 1 сар',
    color: 'amber',
  },
  {
    id: 'full_vip_2m',
    category: 'full_vip',
    title: 'VIP Бүтэн Багц (2 Сар)',
    durationMonths: 2,
    durationDays: 60,
    price: 12000,
    originalPrice: 14000,
    discountBadge: '2,000₮ Хэмнэлт',
    description: '60 хоногийн (2 сар) турш Анимэ + Кино БҮХ контент багтсан супер VIP багц.',
    badge: '👑 VIP 2 сар (12k)',
    color: 'amber',
  },
];

// GET /api/packages - Get available packages
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    packages: PACKAGES,
  });
});

export default router;
