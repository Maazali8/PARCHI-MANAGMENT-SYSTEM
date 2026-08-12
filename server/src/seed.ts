import 'dotenv/config';
import prisma from './lib/prisma.js';
import { hashPassword } from './middleware/auth.js';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await prisma.khataEntry.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.parchi.deleteMany();
  await prisma.shopkeeper.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      username: 'admin',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
      phone: '0300-1234567',
    },
  });
  console.log('✓ Admin created (admin / admin123)');

  // Create Employees
  const emp1 = await prisma.user.create({
    data: {
      name: 'Saleem Ahmed',
      username: 'saleem',
      password: await hashPassword('saleem123'),
      role: 'EMPLOYEE',
      phone: '0321-1234567',
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      name: 'Razzaq Khan',
      username: 'razzaq',
      password: await hashPassword('razzaq123'),
      role: 'EMPLOYEE',
      phone: '0333-7654321',
    },
  });
  console.log('✓ Employees created (saleem / saleem123, razzaq / razzaq123)');

  // Create Shopkeepers
  const sk1 = await prisma.shopkeeper.create({
    data: { shopName: 'Ahmad Hardware', ownerName: 'Ahmad Ali', phone: '0300-5551234', address: 'Main Market, Shop #12', hasKhata: false },
  });
  const sk2 = await prisma.shopkeeper.create({
    data: { shopName: 'Bilal Store', ownerName: 'Bilal Ahmed', phone: '0312-5559876', address: 'Gol Bazaar, Shop #5', hasKhata: true },
  });
  const sk3 = await prisma.shopkeeper.create({
    data: { shopName: 'Madina Hardware', ownerName: 'Usman Khan', phone: '0345-5557890', address: 'Industrial Area, Block B', hasKhata: true },
  });
  const sk4 = await prisma.shopkeeper.create({
    data: { shopName: 'Pakistan Traders', ownerName: 'Farhan Shah', phone: '0301-5554567', address: 'Old City, Moti Bazaar', hasKhata: false },
  });
  const sk5 = await prisma.shopkeeper.create({
    data: { shopName: 'Al-Noor Hardware', ownerName: 'Noor Muhammad', phone: '0333-5552345', address: 'New Market, Near Masjid', hasKhata: true },
  });
  const sk6 = await prisma.shopkeeper.create({
    data: { shopName: 'Taj Building Materials', ownerName: 'Taj Din', phone: '0321-5558901', address: 'Railway Road, Shop #23', hasKhata: false },
  });
  const sk7 = await prisma.shopkeeper.create({
    data: { shopName: 'Gulshan Hardware', ownerName: 'Gulshan Iqbal', phone: '0345-5556789', address: 'Gulshan Colony, Main Road', hasKhata: true },
  });
  console.log('✓ 7 Shopkeepers created');

  // Create initial Khata balances for khata customers
  const khataCustomers = [
    { shopkeeper: sk2, balance: 30000, desc: 'Opening balance' },
    { shopkeeper: sk3, balance: 45000, desc: 'Opening balance' },
    { shopkeeper: sk5, balance: 15000, desc: 'Opening balance' },
    { shopkeeper: sk7, balance: 22000, desc: 'Opening balance' },
  ];

  for (const { shopkeeper, balance, desc } of khataCustomers) {
    await prisma.khataEntry.create({
      data: {
        date: new Date(),
        amount: balance,
        type: 'PARCHI_ADDED',
        description: desc,
        balanceAfter: balance,
        shopkeeperId: shopkeeper.id,
      },
    });
  }
  console.log('✓ Initial Khata balances set');

  // Create today's parchis
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  const parchis = [
    { shopkeeper: sk1, amount: 8000, employee: emp1 },
    { shopkeeper: sk2, amount: 12000, employee: emp1 },
    { shopkeeper: sk3, amount: 15000, employee: emp1 },
    { shopkeeper: sk4, amount: 5500, employee: emp2 },
    { shopkeeper: sk5, amount: 9000, employee: emp2 },
    { shopkeeper: sk6, amount: 7000, employee: emp2 },
    { shopkeeper: sk7, amount: 11000, employee: emp2 },
  ];

  for (const p of parchis) {
    await prisma.parchi.create({
      data: {
        date: today,
        amount: p.amount,
        shopkeeperId: p.shopkeeper.id,
        employeeId: p.employee.id,
      },
    });
  }
  console.log(`✓ ${parchis.length} Parchis created for today`);

  console.log('\n✅ Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:    admin / admin123');
  console.log('  Employee: saleem / saleem123');
  console.log('  Employee: razzaq / razzaq123');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
