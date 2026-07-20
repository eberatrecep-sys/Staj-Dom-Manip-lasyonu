import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = 5050;
const JWT_SECRET = 'secret_key';

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: { email, password_hash }
        });

        res.status(201).json({ message: 'Kullanıcı oluşturuldu' });
    } catch (error) {
        res.status(400).json({ error: 'Bu e-posta zaten kullanılıyor olabilir.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) return res.status(401).json({ error: 'Yanlış şifre.' });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Giriş başarılı', token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });

        console.log(`\n[GİZLİ KOD] ${email} için şifre sıfırlama linkiniz:`);
        console.log(`http://localhost:5173/reset-password?token=${resetToken}\n`);

        res.json({ message: 'Sıfırlama linki oluşturuldu (Terminali kontrol et)' });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş kod.' });

        const password_hash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash, resetToken: null, resetTokenExpiry: null }
        });

        res.json({ message: 'Şifreniz başarıyla değiştirildi.' });
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const authorizeSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Bu alanı görme yetkiniz (403) bulunmuyor.' });
    }
    next();
};

const authorizeContentAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'CONTENT_ADMIN') {
        return res.status(403).json({ error: 'İçerik düzenleme yetkiniz yok (403 Forbidden).' });
    }
    next();
};

const authorizeCurrencyAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'CURRENCY_ADMIN') {
        return res.status(403).json({ error: 'Döviz paneline yetkiniz yok (403 Forbidden).' });
    }
    next();
};

app.get('/api/admin/db-view', authenticateToken, authorizeSuperAdmin, async (req: any, res: any) => {
    try {
        const allData = await prisma.user.findMany({
            include: { shoppingLists: true }
        });
        res.json(allData);
    } catch (error) {
        res.status(500).json({ error: 'Veritabanı okunamadı.' });
    }
});

app.get('/api/shopping-list', authenticateToken, async (req: any, res: any) => {
    const lists = await prisma.shoppingList.findMany({
        where: { userId: req.user.userId },
        orderBy: { updatedAt: 'desc' }
    });
    res.json(lists);
});

app.put('/api/admin/role', authenticateToken, authorizeSuperAdmin, async (req: any, res: any) => {
    try {
        const { targetUserId, newRole } = req.body;
        await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole }
        });
        res.json({ message: 'Rol başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ error: 'Rol güncellenemedi.' });
    }
});

app.get('/api/settings/title', async (req, res) => {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
        settings = await prisma.siteSettings.create({ data: { homepageTitle: 'Alışveriş Uygulaması' } });
    }
    res.json({ title: settings.homepageTitle });
});

app.put('/api/settings/title', authenticateToken, authorizeContentAdmin, async (req: any, res: any) => {
    try {
        const { newTitle } = req.body;
        const settings = await prisma.siteSettings.findFirst();
        if (settings) {
            await prisma.siteSettings.update({
                where: { id: settings.id },
                data: { homepageTitle: newTitle }
            });
        }
        res.json({ message: 'Başlık güncellendi' });
    } catch (error) {
        res.status(500).json({ error: 'Başlık güncellenemedi.' });
    }
});

app.get('/api/currency', async (req, res) => {
    try {
        const rates = await prisma.currencyRate.findMany();
        if (rates.length === 0) {
            return res.json({ rates: { USD: 0, EUR: 0, GBP: 0 } });
        }

        const ratesObj: any = {};
        rates.forEach(r => ratesObj[r.currency] = r.rate);
        res.json({ rates: ratesObj });
    } catch (error) {
        res.status(500).json({ error: 'Kurlar okunamadı' });
    }
});

app.post('/api/settings/currency', authenticateToken, authorizeCurrencyAdmin, async (req: any, res: any) => {
    try {
        const response = await fetch('https://api.frankfurter.dev/v1/latest?base=TRY');
        const data = await response.json();

        const currencies = Object.keys(data.rates);
        for (const curr of currencies) {
            const rateVal = data.rates[curr];
            if (rateVal) {
                const finalRate = parseFloat((1 / rateVal).toFixed(4));

                await prisma.currencyRate.upsert({
                    where: { currency: curr },
                    update: { rate: finalRate, updatedAt: new Date() },
                    create: { currency: curr, rate: finalRate }
                });
            }
        }
        res.json({ message: 'Döviz kurları başarıyla güncellendi!' });
    } catch (error) {
        res.status(500).json({ error: 'Döviz kurları güncellenemedi.' });
    }
});

app.post('/api/shopping-list', authenticateToken, async (req: any, res: any) => {
    const { itemName, amount } = req.body;
    const newItem = await prisma.shoppingList.create({
        data: {
            itemName,
            amount,
            userId: req.user.userId
        }
    });
    res.json(newItem);
});

app.put('/api/shopping-list/:id', authenticateToken, async (req: any, res: any) => {
    try {
        const id = parseInt(req.params.id);
        const { itemName, amount } = req.body;
        const item = await prisma.shoppingList.findUnique({ where: { id } });
        if (!item || item.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Yetkisiz işlem veya ürün bulunamadı.' });
        }

        const updatedItem = await prisma.shoppingList.update({
            where: { id },
            data: { itemName, amount }
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: 'Ürün güncellenemedi.' });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} portunda çalışıyor.`);
});
