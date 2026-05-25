import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.user.deleteMany();

  // Create sample farmers
  const farmer1 = await prisma.user.create({
    data: {
      phone: '+254712345678',
      fullName: 'Jane Kiprotich',
      email: 'jane@mkulima.com',
      role: 'FARMER',
      farmName: 'Green Valley Farm',
      farmSize: 2.5,
      verified: true,
      verifiedAt: new Date(),
      location: 'Nairobi',
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      phone: '+254798765432',
      fullName: 'Peter Kipchoge',
      email: 'peter@mkulima.com',
      role: 'FARMER',
      farmName: 'Sunrise Produce',
      farmSize: 1.8,
      verified: true,
      verifiedAt: new Date(),
      location: 'Kiambu',
    },
  });

  // Create sample buyers
  const buyer1 = await prisma.user.create({
    data: {
      phone: '+254701111111',
      fullName: 'Ahmed Hassan',
      email: 'ahmed@buyer.com',
      role: 'BUYER',
      verified: true,
      verifiedAt: new Date(),
      location: 'Nairobi',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      phone: '+254722222222',
      fullName: 'Grace Wanjiru',
      email: 'grace@buyer.com',
      role: 'BUYER',
      verified: true,
      verifiedAt: new Date(),
      location: 'Nairobi',
    },
  });

  // Create sample listings
  const listing1 = await prisma.listing.create({
    data: {
      farmerId: farmer1.id,
      name: 'Fresh Tomatoes',
      description: 'Premium quality farm-fresh tomatoes, pesticide-free',
      cropType: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 40,
      county: 'Nairobi',
      subCounty: 'Langata',
      images: ['https://via.placeholder.com/300x300?text=Tomatoes'],
      available: true,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      farmerId: farmer1.id,
      name: 'Sweet Maize',
      description: 'Fresh sweet corn, ready for market',
      cropType: 'Grains',
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 25,
      county: 'Nairobi',
      subCounty: 'Langata',
      images: ['https://via.placeholder.com/300x300?text=Maize'],
      available: true,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      farmerId: farmer2.id,
      name: 'Kiambu Spinach',
      description: 'Organic fresh spinach from Kiambu highlands',
      cropType: 'Vegetables',
      quantity: 20,
      unit: 'kg',
      pricePerUnit: 60,
      county: 'Kiambu',
      subCounty: 'Limuru',
      images: ['https://via.placeholder.com/300x300?text=Spinach'],
      available: true,
    },
  });

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      farmerId: farmer1.id,
      listingId: listing1.id,
      quantity: 10,
      totalPrice: 400,
      status: 'CONFIRMED',
      paymentStatus: 'IN_ESCROW',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      farmerId: farmer2.id,
      listingId: listing3.id,
      quantity: 5,
      totalPrice: 300,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });

  // Create sample reviews
  await prisma.review.create({
    data: {
      reviewerId: buyer1.id,
      revieweeId: farmer1.id,
      rating: 5,
      comment: 'Excellent quality produce! Will buy again.',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`
    📊 Created:
    - ${2} Farmers
    - ${2} Buyers
    - ${3} Product Listings
    - ${2} Orders
    - ${1} Review
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
