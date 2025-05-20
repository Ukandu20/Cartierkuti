// src/seeder.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { projectData } from "../assets/data/data.js";      // adjust if needed
import Project from "../models/project.model.js";

dotenv.config();        // loads MONGODB_URI

/* ─────────────── add missing / new props */
const enrich = (item, idx) => {
  // build fake ratings to compute avgStars
  const ratings = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }).map(
    () => ({
      stars: faker.number.int({ min: 2, max: 5 }),
      comment: faker.hacker.phrase(),
      date: faker.date.recent(120),
    })
  );
  const avgStars =
    ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

  const featuredBool = item.featured ?? faker.datatype.boolean();

  return {
    /* keep original fields */
    ...item,

    /* ensure required schema props exist */
    id: item.id ?? idx + 1,
    featured: item.featured ?? featuredBool,
    metadata: item.metadata ?? item.githubLink ?? faker.internet.url(),
    status: item.status ?? "Completed",

    /* new popularity & review fields */
    isFeatured: item.isFeatured ?? featuredBool,
    views: item.views ?? faker.number.int({ min: 15, max: 300 }),
    ratings: item.ratings ?? ratings,
    avgStars: item.avgStars ?? avgStars,
  };
};

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    });

    await Project.deleteMany();                // wipe existing
    const docs = projectData.map(enrich);
    await Project.insertMany(docs);

    console.log("✅ Project data imported successfully!");
    console.table(
      docs.map((p) => ({
        id: p.id,
        title: p.title,
        views: p.views,
        avgStars: p.avgStars.toFixed(1),
        featured: p.featured,
      }))
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Error importing project data:", err);
    process.exit(1);
  }
};

importData();
