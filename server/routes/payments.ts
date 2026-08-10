import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/payments/verify - Simulate payment verification (QPay, MonPay, Wallet)
router.post('/verify', (req: Request, res: Response) => {
  try {
    const { packageType, method, userBalance } = req.body;

    const prices: Record<string, number> = {
      anime: 4000,
      movie: 4000,
      full_vip: 7000,
    };

    const requiredPrice = prices[packageType] || 4000;

    if (method === 'wallet') {
      if ((userBalance || 0) < requiredPrice) {
        return res.status(400).json({
          success: false,
          error: `Хэтэвчний үлдэгдэл хүрэлцэхгүй байна. Шаардлагатай: ${requiredPrice.toLocaleString()} ₮`,
        });
      }
    }

    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return res.json({
      success: true,
      transactionId,
      packageType,
      amount: requiredPrice,
      message: 'Төлбөр амжилттай баталгаажлаа!',
      activatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payments/topup - Simulate wallet top-up
router.post('/topup', (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const topupAmount = Number(amount) || 5000;

    return res.json({
      success: true,
      addedAmount: topupAmount,
      message: `${topupAmount.toLocaleString()} ₮ амжилттай цэнэглэгдлээ.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
