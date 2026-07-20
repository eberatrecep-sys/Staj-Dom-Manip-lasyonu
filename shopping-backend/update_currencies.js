const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
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
    console.log("Done inserting " + currencies.length + " currencies.");
}
update();
