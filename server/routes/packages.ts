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
    id: 'anime_1m',
    category: 'anime',
    title: 'Анимэ Багц (1 Сар)',
    durationMonths: 1,
    durationDays: 30,
    price: 4000,
    description: '30 хоногийн турш платформ дээрх бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзнэ.',
    badge: '🎌 Анимэ 1 сар',
    color: 'rose',
  },
  {
    id: 'anime_2m',
    category: 'anime',
    title: 'Анимэ Багц (2 Сар)',
    durationMonths: 2,
    durationDays: 60,
    price: 7000,
    originalPrice: 8000,
    discountBadge: '1,000₮ Хэмнэлт',
    description: '60 хоногийн (2 сар) турш бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзэх хямдралтай багц.',
    badge: '🎌 2 САР (7k)',
    color: 'rose',
  },
  {
    id: 'anime_3m',
    category: 'anime',
    title: 'Анимэ Багц (3 Сар)',
    durationMonths: 3,
    durationDays: 90,
    price: 10000,
    originalPrice: 12000,
    discountBadge: '2,000₮ Супер Хэмнэлт',
    description: '90 хоногийн (3 сар) турш бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзэх супер хэмнэлттэй багц.',
    badge: '🔥 3 САР (10k)',
    color: 'rose',
  },
  {
    id: 'movie_1m',
    category: 'movie',
    title: 'Кино Багц (1 Сар)',
    durationMonths: 1,
    durationDays: 30,
    price: 4000,
    description: '30 хоногийн турш платформ дээрх бүх Уран сайхны кино болон ТВ цувралуудыг хязгааргүй үзнэ.',
    badge: '🎬 Кино 1 сар',
    color: 'cyan',
  },
  {
    id: 'movie_2m',
    category: 'movie',
    title: 'Кино Багц (2 Сар)',
    durationMonths: 2,
    durationDays: 60,
    price: 7000,
    originalPrice: 8000,
    discountBadge: '1,000₮ Хэмнэлт',
    description: '60 хоногийн (2 сар) турш бүх кино болон ТВ цувралуудыг хязгааргүй үзэх хямдралтай багц.',
    badge: '🎬 2 САР (7k)',
    color: 'cyan',
  },
  {
    id: 'movie_3m',
    category: 'movie',
    title: 'Кино Багц (3 Сар)',
    durationMonths: 3,
    durationDays: 90,
    price: 10000,
    originalPrice: 12000,
    discountBadge: '2,000₮ Супер Хэмнэлт',
    description: '90 хоногийн (3 сар) турш бүх кино болон ТВ цувралуудыг хязгааргүй үзэх супер хэмнэлттэй багц.',
    badge: '🔥 3 САР (10k)',
    color: 'cyan',
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
    id: 'full_vip_3m',
    category: 'full_vip',
    title: 'VIP Бүтэн Багц (3 Сар)',
    durationMonths: 3,
    durationDays: 90,
    price: 15000,
    originalPrice: 21000,
    discountBadge: '6,000₮ Хэмнэлт',
    description: '90 хоногийн (3 сар) турш Анимэ + Кино БҮХ контент багтсан супер VIP багц.',
    badge: '👑 VIP 3 сар (15k)',
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
