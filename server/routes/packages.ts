import { Router, Request, Response } from 'express';

const router = Router();

export interface MoviePackageInfo {
  id: 'anime' | 'movie' | 'full_vip';
  title: string;
  description: string;
  price: number;
  durationDays: number;
  badge: string;
  color: string;
}

const PACKAGES: MoviePackageInfo[] = [
  {
    id: 'anime',
    title: 'Анимэ Багц',
    description: '30 хоногийн турш платформ дээрх бүх Анимэ цуврал ба кинонуудыг хязгааргүй үзнэ.',
    price: 4000,
    durationDays: 30,
    badge: '🎌 Анимэ',
    color: 'rose',
  },
  {
    id: 'movie',
    title: 'Кино Багц',
    description: '30 хоногийн турш платформ дээрх бүх Уран сайхны кино болон ТВ цувралуудыг хязгааргүй үзнэ.',
    price: 4000,
    durationDays: 30,
    badge: '🎬 Кино',
    color: 'cyan',
  },
  {
    id: 'full_vip',
    title: 'VIP Бүтэн Багц',
    description: '30 хоногийн турш Анимэ + Кино + ТВ цуврал БҮГД хязгааргүй багтсан хямдралтай багц.',
    price: 7000,
    durationDays: 30,
    badge: '👑 VIP Бүтэн',
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
