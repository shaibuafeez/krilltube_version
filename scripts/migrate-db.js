const { PrismaClient } = require('@prisma/client');

// Old database connection
const oldDbUrl = 'postgresql://neondb_owner:npg_GA4ElRjvUen9@ep-damp-moon-adx7miac-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// New database connection (from current .env)
const newDbUrl = 'postgresql://neondb_owner:npg_1TmhNwzfq7nL@ep-damp-mode-a45knnlt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const oldPrisma = new PrismaClient({
  datasources: { db: { url: oldDbUrl } }
});

const newPrisma = new PrismaClient({
  datasources: { db: { url: newDbUrl } }
});

async function migrate() {
  try {
    console.log('Connecting to old database...');
    await oldPrisma.$connect();
    console.log('Connected to old database');

    console.log('Connecting to new database...');
    await newPrisma.$connect();
    console.log('Connected to new database');

    // Migrate creators first (videos depend on them)
    console.log('\n--- Migrating Creators ---');
    const creators = await oldPrisma.creator.findMany();
    console.log(`Found ${creators.length} creators`);

    for (const creator of creators) {
      try {
        await newPrisma.creator.upsert({
          where: { walletAddress: creator.walletAddress },
          update: creator,
          create: creator
        });
        console.log(`  Migrated creator: ${creator.name || creator.walletAddress}`);
      } catch (e) {
        console.log(`  Skipped creator (may already exist): ${creator.walletAddress}`);
      }
    }

    // Migrate videos
    console.log('\n--- Migrating Videos ---');
    const videos = await oldPrisma.video.findMany();
    console.log(`Found ${videos.length} videos`);

    for (const video of videos) {
      try {
        await newPrisma.video.upsert({
          where: { id: video.id },
          update: video,
          create: video
        });
        console.log(`  Migrated video: ${video.title}`);
      } catch (e) {
        console.log(`  Error migrating video ${video.title}: ${e.message}`);
      }
    }

    // Migrate creator configs
    console.log('\n--- Migrating Creator Configs ---');
    const configs = await oldPrisma.creatorConfig.findMany();
    console.log(`Found ${configs.length} creator configs`);

    for (const config of configs) {
      try {
        await newPrisma.creatorConfig.upsert({
          where: { id: config.id },
          update: config,
          create: config
        });
        console.log(`  Migrated config: ${config.id}`);
      } catch (e) {
        console.log(`  Error migrating config: ${e.message}`);
      }
    }

    // Migrate subscriptions
    console.log('\n--- Migrating Subscriptions ---');
    const subscriptions = await oldPrisma.subscription.findMany();
    console.log(`Found ${subscriptions.length} subscriptions`);

    for (const sub of subscriptions) {
      try {
        await newPrisma.subscription.upsert({
          where: { id: sub.id },
          update: sub,
          create: sub
        });
        console.log(`  Migrated subscription: ${sub.id}`);
      } catch (e) {
        console.log(`  Error migrating subscription: ${e.message}`);
      }
    }

    // Migrate assets
    console.log('\n--- Migrating Assets ---');
    const assets = await oldPrisma.asset.findMany();
    console.log(`Found ${assets.length} assets`);

    for (const asset of assets) {
      try {
        await newPrisma.asset.upsert({
          where: { id: asset.id },
          update: asset,
          create: asset
        });
        console.log(`  Migrated asset: ${asset.id}`);
      } catch (e) {
        console.log(`  Error migrating asset: ${e.message}`);
      }
    }

    console.log('\n=== Migration Complete ===');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

migrate();
