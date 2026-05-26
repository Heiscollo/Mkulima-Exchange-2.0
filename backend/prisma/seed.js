import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Mkulima Exchange...');

  try {
    // Clear existing data in correct order (respecting foreign keys)
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.otpCode.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.buyerProfile.deleteMany();
    await prisma.farmerProfile.deleteMany();
    await prisma.user.deleteMany();

    // ========================================================================
    // CREATE FARMERS
    // ========================================================================

    const farmer1 = await prisma.user.create({
      data: {
        phone: '+254712345678',
        name: 'John Kipchoge',
        role: 'FARMER',
        county: 'NAKURU',
        mpesaNumber: '+254712345678',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 5,
            cropsGrown: ['Maize', 'Wheat', 'Green Grams'],
            county: 'NAKURU',
          },
        },
      },
    });

    const farmer2 = await prisma.user.create({
      data: {
        phone: '+254713456789',
        name: 'Mary Njoroge',
        role: 'FARMER',
        county: 'MERU',
        mpesaNumber: '+254713456789',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 3,
            cropsGrown: ['Tomatoes', 'Carrots', 'Spinach'],
            county: 'MERU',
          },
        },
      },
    });

    const farmer3 = await prisma.user.create({
      data: {
        phone: '+254714567890',
        name: 'Joseph Ochieng',
        role: 'FARMER',
        county: 'KISUMU',
        mpesaNumber: '+254714567890',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 2,
            cropsGrown: ['Tilapia', 'Nile Perch'],
            county: 'KISUMU',
          },
        },
      },
    });

    const farmer4 = await prisma.user.create({
      data: {
        phone: '+254715678901',
        name: 'David Kiplagat',
        role: 'FARMER',
        county: 'UASIN_GISHU',
        mpesaNumber: '+254715678901',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 8,
            cropsGrown: ['Wheat', 'Maize'],
            county: 'UASIN_GISHU',
          },
        },
      },
    });

    const farmer5 = await prisma.user.create({
      data: {
        phone: '+254716789012',
        name: 'Florence Wangui',
        role: 'FARMER',
        county: 'NYERI',
        mpesaNumber: '+254716789012',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 4,
            cropsGrown: ['Irish Potatoes', 'Wheat', 'Beans'],
            county: 'NYERI',
          },
        },
      },
    });

    const farmer6 = await prisma.user.create({
      data: {
        phone: '+254717890123',
        name: 'Samuel Mutua',
        role: 'FARMER',
        county: 'KIAMBU',
        mpesaNumber: '+254717890123',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 2.5,
            cropsGrown: ['Kale', 'Spinach', 'Tomatoes'],
            county: 'KIAMBU',
          },
        },
      },
    });

    const farmer7 = await prisma.user.create({
      data: {
        phone: '+254718901234',
        name: 'Grace Kipchoge',
        role: 'FARMER',
        county: 'KERICHO',
        mpesaNumber: '+254718901234',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 6,
            cropsGrown: ['Tea', 'Coffee'],
            county: 'KERICHO',
          },
        },
      },
    });

    const farmer8 = await prisma.user.create({
      data: {
        phone: '+254719012345',
        name: 'Peter Mwangi',
        role: 'FARMER',
        county: 'MURANG_A',
        mpesaNumber: '+254719012345',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 3.5,
            cropsGrown: ['Avocado', 'Banana', 'Maize'],
            county: 'MURANG_A',
          },
        },
      },
    });

    const farmer9 = await prisma.user.create({
      data: {
        phone: '+254720123456',
        name: 'Ruth Wambui',
        role: 'FARMER',
        county: 'KAKAMEGA',
        mpesaNumber: '+254720123456',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 5,
            cropsGrown: ['Sugarcane', 'Maize'],
            county: 'KAKAMEGA',
          },
        },
      },
    });

    const farmer10 = await prisma.user.create({
      data: {
        phone: '+254721234567',
        name: 'George Musyoka',
        role: 'FARMER',
        county: 'MACHAKOS',
        mpesaNumber: '+254721234567',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 3,
            cropsGrown: ['Green Grams', 'Maize', 'Beans'],
            county: 'MACHAKOS',
          },
        },
      },
    });

    const farmer11 = await prisma.user.create({
      data: {
        phone: '+254722345678',
        name: 'Alice Muiruri',
        role: 'FARMER',
        county: 'NYANDARUA',
        mpesaNumber: '+254722345678',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 2.5,
            cropsGrown: ['Carrots', 'Potatoes', 'Cabbage'],
            county: 'NYANDARUA',
          },
        },
      },
    });

    const farmer12 = await prisma.user.create({
      data: {
        phone: '+254723456789',
        name: 'Moses Kipketer',
        role: 'FARMER',
        county: 'BOMET',
        mpesaNumber: '+254723456789',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 4,
            cropsGrown: ['Milk (Dairy)', 'Tea'],
            county: 'BOMET',
          },
        },
      },
    });

    const farmer13 = await prisma.user.create({
      data: {
        phone: '+254724567890',
        name: 'Amina Ahmed',
        role: 'FARMER',
        county: 'KILIFI',
        mpesaNumber: '+254724567890',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 3,
            cropsGrown: ['Coconut', 'Cashew Nuts'],
            county: 'KILIFI',
          },
        },
      },
    });

    const farmer14 = await prisma.user.create({
      data: {
        phone: '+254725678901',
        name: 'Japheth Omondi',
        role: 'FARMER',
        county: 'HOMA_BAY',
        mpesaNumber: '+254725678901',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 2,
            cropsGrown: ['Fish', 'Omena (Dagaa)'],
            county: 'HOMA_BAY',
          },
        },
      },
    });

    const farmer15 = await prisma.user.create({
      data: {
        phone: '+254726789012',
        name: 'Kariuki Kimani',
        role: 'FARMER',
        county: 'EMBU',
        mpesaNumber: '+254726789012',
        isVerified: true,
        farmerProfile: {
          create: {
            farmSizeAcres: 4,
            cropsGrown: ['Beans', 'Maize', 'Millet'],
            county: 'EMBU',
          },
        },
      },
    });

    // ========================================================================
    // CREATE BUYERS
    // ========================================================================

    const buyer1 = await prisma.user.create({
      data: {
        phone: '+254730000001',
        name: 'Uchumi Supermarket',
        role: 'BUYER',
        county: 'NAIROBI',
        mpesaNumber: '+254730000001',
        isVerified: true,
        buyerProfile: {
          create: {
            businessName: 'Uchumi Supermarkets Ltd',
            businessType: 'Retailer',
          },
        },
      },
    });

    const buyer2 = await prisma.user.create({
      data: {
        phone: '+254730000002',
        name: 'Kamba Wholesalers',
        role: 'BUYER',
        county: 'NAIROBI',
        mpesaNumber: '+254730000002',
        isVerified: true,
        buyerProfile: {
          create: {
            businessName: 'Kamba Wholesalers',
            businessType: 'Wholesaler',
          },
        },
      },
    });

    // ========================================================================
    // CREATE LISTINGS (15 REALISTIC KENYAN PRODUCE)
    // ========================================================================

    const listings = [
      {
        farmerId: farmer1.id,
        cropName: 'Maize',
        cropCategory: 'CEREALS_AND_GRAINS',
        quantity: 500,
        unit: 'KG',
        pricePerUnit: 45,
        county: 'NAKURU',
        description: 'Fresh, quality white maize from Nakuru. Harvested 2 weeks ago. Stored in cool dry place.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer2.id,
        cropName: 'Tomatoes',
        cropCategory: 'VEGETABLES',
        quantity: 200,
        unit: 'KG',
        pricePerUnit: 80,
        county: 'MERU',
        description: 'Juicy, ripe tomatoes from Meru highlands. Perfect for cooking, salads, or juice.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer3.id,
        cropName: 'Tilapia',
        cropCategory: 'FISH_AND_SEAFOOD',
        quantity: 100,
        unit: 'KG',
        pricePerUnit: 350,
        county: 'KISUMU',
        description: 'Fresh farmed tilapia from Lake Victoria. Delivered fresh daily. Best for restaurants and hotels.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 0)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer4.id,
        cropName: 'Wheat',
        cropCategory: 'CEREALS_AND_GRAINS',
        quantity: 1000,
        unit: 'KG',
        pricePerUnit: 55,
        county: 'UASIN_GISHU',
        description: 'High-quality wheat grain, certified and ready for milling. Bulk orders welcome.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer5.id,
        cropName: 'Irish Potatoes',
        cropCategory: 'ROOT_CROPS_AND_TUBERS',
        quantity: 300,
        unit: 'KG',
        pricePerUnit: 60,
        county: 'NYERI',
        description: 'Premium Irish potatoes from Nyeri farms. Sorted, clean, and ready for market.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer6.id,
        cropName: 'Kale (Sukuma Wiki)',
        cropCategory: 'VEGETABLES',
        quantity: 150,
        unit: 'KG',
        pricePerUnit: 30,
        county: 'KIAMBU',
        description: 'Fresh, tender kale leaves. Harvested daily. Nutritious and affordable for families.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 0)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer7.id,
        cropName: 'Tea',
        cropCategory: 'CASH_CROPS',
        quantity: 500,
        unit: 'KG',
        pricePerUnit: 120,
        county: 'KERICHO',
        description: 'Dried tea leaves from Kericho tea gardens. Premium quality, ready for export or local market.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer8.id,
        cropName: 'Avocado',
        cropCategory: 'FRUITS',
        quantity: 400,
        unit: 'KG',
        pricePerUnit: 150,
        county: 'MURANG_A',
        description: 'Creamy, ripe avocados. Perfect for export or domestic sale. Organic farming practices.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer9.id,
        cropName: 'Sugarcane',
        cropCategory: 'CASH_CROPS',
        quantity: 2000,
        unit: 'KG',
        pricePerUnit: 15,
        county: 'KAKAMEGA',
        description: 'Fresh sugarcane stalks. Large quantity available. Ideal for sugar factories or juice production.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 4)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer10.id,
        cropName: 'Green Grams',
        cropCategory: 'LEGUMES_AND_PULSES',
        quantity: 200,
        unit: 'KG',
        pricePerUnit: 180,
        county: 'MACHAKOS',
        description: 'Premium quality green grams. Sorted, clean, no stones. High protein content.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer11.id,
        cropName: 'Carrots',
        cropCategory: 'VEGETABLES',
        quantity: 250,
        unit: 'KG',
        pricePerUnit: 50,
        county: 'NYANDARUA',
        description: 'Fresh, orange carrots from Nyandarua highlands. Suitable for home use or commercial processing.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer12.id,
        cropName: 'Fresh Milk',
        cropCategory: 'DAIRY_AND_LIVESTOCK_PRODUCTS',
        quantity: 100,
        unit: 'LITRE',
        pricePerUnit: 55,
        county: 'BOMET',
        description: 'Fresh, chilled milk from dairy cows. Tested, clean, and ready for distribution.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 0)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer13.id,
        cropName: 'Coconut',
        cropCategory: 'TREE_CROPS_AND_OTHERS',
        quantity: 500,
        unit: 'KG',
        pricePerUnit: 25,
        county: 'KILIFI',
        description: 'Fresh coconuts from Kilifi. High yield. Suitable for oil production, food, or export.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 6)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer14.id,
        cropName: 'Omena (Dagaa)',
        cropCategory: 'FISH_AND_SEAFOOD',
        quantity: 50,
        unit: 'KG',
        pricePerUnit: 280,
        county: 'HOMA_BAY',
        description: 'Dried omena from Lake Victoria. Protein-rich, nutritious. Popular in East Africa.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        status: 'ACTIVE',
        images: [],
      },
      {
        farmerId: farmer15.id,
        cropName: 'Beans',
        cropCategory: 'LEGUMES_AND_PULSES',
        quantity: 300,
        unit: 'KG',
        pricePerUnit: 140,
        county: 'EMBU',
        description: 'Quality dried beans. No stones, no weevils. Ready for cooking. Suitable for bulk orders.',
        availableDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        status: 'ACTIVE',
        images: [],
      },
    ];

    // Create all listings
    for (const listing of listings) {
      await prisma.listing.create({ data: listing });
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================

    console.log('✅ Seed completed successfully!');
    console.log(`
    📊 CREATED:
    - 15 Farmers (across 15 counties)
    - 2 Buyers
    - 15 Product Listings (diverse crops and categories)

    📍 COUNTIES COVERED:
    Nakuru, Meru, Kisumu, Uasin Gishu, Nyeri, Kiambu, Kericho,
    Murang'a, Kakamega, Machakos, Nyandarua, Bomet, Kilifi, 
    Homa Bay, Embu

    🌾 CROP CATEGORIES:
    - CEREALS_AND_GRAINS (2)
    - VEGETABLES (3)
    - FRUITS (1)
    - LEGUMES_AND_PULSES (2)
    - ROOT_CROPS_AND_TUBERS (1)
    - CASH_CROPS (2)
    - FISH_AND_SEAFOOD (2)
    - DAIRY_AND_LIVESTOCK_PRODUCTS (1)
    - TREE_CROPS_AND_OTHERS (1)

    💰 TOTAL VALUE: KES ${listings.reduce((sum, l) => sum + l.quantity * l.pricePerUnit, 0).toLocaleString()}
    `);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
