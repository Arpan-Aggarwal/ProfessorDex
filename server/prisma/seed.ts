import bcrypt from "bcrypt";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  RatingCategory,
} from "../src/generated/prisma/client.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting ProfessorDex seed...");

  // =====================================================
  // SEMESTERS
  // =====================================================

  const semesters = [
    {
      name: "Semester 1",
      slug: "sem-1",
    },
    {
      name: "Semester 2",
      slug: "sem-2",
    },
    {
      name: "Semester 3",
      slug: "sem-3",
    },
    {
      name: "Semester 4",
      slug: "sem-4",
    },
  ];

  for (const semester of semesters) {
    await prisma.semester.upsert({
      where: {
        slug: semester.slug,
      },
      update: {
        name: semester.name,
      },
      create: {
        name: semester.name,
        slug: semester.slug,
        ratingsOpen: false,
        isActive: true,
      },
    });
  }

  console.log("✅ Semesters added");

  // =====================================================
  // RATING TITLES
  // =====================================================

  const ratingTitles = [
    // -----------------------------
    // TEACHING AURA
    // -----------------------------

    {
      category: RatingCategory.TEACHING_AURA,
      value: 1,
      title: "Classic Classroom",
      explanation: "Traditional and straightforward teaching",
    },
    {
      category: RatingCategory.TEACHING_AURA,
      value: 2,
      title: "Things Start Clicking",
      explanation: "Usually makes concepts understandable",
    },
    {
      category: RatingCategory.TEACHING_AURA,
      value: 3,
      title: "Concept Connector",
      explanation: "Connects ideas and examples well",
    },
    {
      category: RatingCategory.TEACHING_AURA,
      value: 4,
      title: "Brain Wi-Fi Connected",
      explanation: "Concepts click pretty quickly",
    },
    {
      category: RatingCategory.TEACHING_AURA,
      value: 5,
      title: "Sensei-Level Explainer",
      explanation: "Can make difficult topics feel simple",
    },

    // -----------------------------
    // HUMOUR METER
    // -----------------------------

    {
      category: RatingCategory.HUMOUR_METER,
      value: 1,
      title: "Mission Mode",
      explanation: "Mostly focused and serious",
    },
    {
      category: RatingCategory.HUMOUR_METER,
      value: 2,
      title: "Occasional Plot Twist",
      explanation: "A joke appears once in a while",
    },
    {
      category: RatingCategory.HUMOUR_METER,
      value: 3,
      title: "Sneaky One-Liners",
      explanation: "Random jokes unexpectedly land",
    },
    {
      category: RatingCategory.HUMOUR_METER,
      value: 4,
      title: "Classroom Comedian",
      explanation: "Humour is a regular part of class",
    },
    {
      category: RatingCategory.HUMOUR_METER,
      value: 5,
      title: "Comedy Arc Unlocked",
      explanation: "Class somehow becomes entertainment too",
    },

    // -----------------------------
    // CLASSROOM VIBE
    // -----------------------------

    {
      category: RatingCategory.CLASSROOM_VIBE,
      value: 1,
      title: "Professional Mode",
      explanation: "Formal and professional atmosphere",
    },
    {
      category: RatingCategory.CLASSROOM_VIBE,
      value: 2,
      title: "Calm & Collected",
      explanation: "Relaxed but structured",
    },
    {
      category: RatingCategory.CLASSROOM_VIBE,
      value: 3,
      title: "Easy to Approach",
      explanation: "Comfortable to talk to",
    },
    {
      category: RatingCategory.CLASSROOM_VIBE,
      value: 4,
      title: "More Chilled Than Ice",
      explanation: "Very relaxed and approachable",
    },
    {
      category: RatingCategory.CLASSROOM_VIBE,
      value: 5,
      title: "Certified Comfort Zone",
      explanation: "Students feel completely comfortable interacting",
    },

    // -----------------------------
    // MENTOR ENERGY
    // -----------------------------

    {
      category: RatingCategory.MENTOR_ENERGY,
      value: 1,
      title: "Points the Way",
      explanation: "Provides basic direction when needed",
    },
    {
      category: RatingCategory.MENTOR_ENERGY,
      value: 2,
      title: "Helpful When Asked",
      explanation: "Ready to help when students ask",
    },
    {
      category: RatingCategory.MENTOR_ENERGY,
      value: 3,
      title: "Always Has a Hint",
      explanation: "Helps students find the solution",
    },
    {
      category: RatingCategory.MENTOR_ENERGY,
      value: 4,
      title: "Guidance Sensei",
      explanation: "Provides strong guidance",
    },
    {
      category: RatingCategory.MENTOR_ENERGY,
      value: 5,
      title: "Mentor Arc Activated",
      explanation: "Genuinely guides students forward",
    },

    // -----------------------------
    // CLASSROOM PRESENCE
    // -----------------------------

    {
      category: RatingCategory.CLASSROOM_PRESENCE,
      value: 1,
      title: "Calm Presence",
      explanation: "Has a calm classroom presence",
    },
    {
      category: RatingCategory.CLASSROOM_PRESENCE,
      value: 2,
      title: "Steady Command",
      explanation: "Maintains steady control of the class",
    },
    {
      category: RatingCategory.CLASSROOM_PRESENCE,
      value: 3,
      title: "Owns the Classroom",
      explanation: "Has a noticeable classroom presence",
    },
    {
      category: RatingCategory.CLASSROOM_PRESENCE,
      value: 4,
      title: "Main Character Energy",
      explanation: "Strong and memorable presence",
    },
    {
      category: RatingCategory.CLASSROOM_PRESENCE,
      value: 5,
      title: "Final-Boss Presence",
      explanation: "Commands the room instantly",
    },
  ];

  for (const item of ratingTitles) {
    await prisma.ratingTitle.upsert({
      where: {
        category_value: {
          category: item.category,
          value: item.value,
        },
      },

      update: {
        title: item.title,
        explanation: item.explanation,
        isActive: true,
      },

      create: {
        category: item.category,
        value: item.value,
        title: item.title,
        explanation: item.explanation,
        isActive: true,
      },
    });
  }

// =====================================================
// ARCHETYPES
// =====================================================

const archetypes = [
  // -----------------------------
  // ORIGINAL 8 ARCHETYPES
  // -----------------------------
  {
    name: "Legendary Sensei",
    description:
      "A powerful teacher who combines strong explanation, guidance and classroom presence.",
    teachingAuraWeight: 0.45,
    humourMeterWeight: 0.00,
    classroomVibeWeight: 0.00,
    mentorEnergyWeight: 0.35,
    classroomPresenceWeight: 0.20,
  },
  {
    name: "Concept Commander",
    description:
      "A professor whose greatest strength is making concepts clear and understandable.",
    teachingAuraWeight: 0.50,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.20,
    classroomPresenceWeight: 0.15,
  },
  {
    name: "Classroom Entertainer",
    description:
      "Turns lectures into an entertaining experience while keeping students engaged.",
    teachingAuraWeight: 0.10,
    humourMeterWeight: 0.45,
    classroomVibeWeight: 0.25,
    mentorEnergyWeight: 0.05,
    classroomPresenceWeight: 0.15,
  },
  {
    name: "Chill Mentor",
    description:
      "Approachable, relaxed and supportive while helping students move forward.",
    teachingAuraWeight: 0.05,
    humourMeterWeight: 0.20,
    classroomVibeWeight: 0.40,
    mentorEnergyWeight: 0.35,
    classroomPresenceWeight: 0.00,
  },
  {
    name: "Guardian Sensei",
    description:
      "Known for supporting students and guiding them whenever they need help.",
    teachingAuraWeight: 0.20,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.15,
    mentorEnergyWeight: 0.45,
    classroomPresenceWeight: 0.15,
  },
  {
    name: "Main Character Faculty",
    description:
      "A memorable professor whose personality and presence naturally stand out.",
    teachingAuraWeight: 0.10,
    humourMeterWeight: 0.20,
    classroomVibeWeight: 0.25,
    mentorEnergyWeight: 0.05,
    classroomPresenceWeight: 0.40,
  },
  {
    name: "Calm Commander",
    description:
      "Maintains a calm atmosphere while still commanding the classroom.",
    teachingAuraWeight: 0.15,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.20,
    mentorEnergyWeight: 0.10,
    classroomPresenceWeight: 0.50,
  },
  {
    name: "Balanced Legend",
    description:
      "An all-round professor with a balanced combination of every ProfessorDex stat.",
    teachingAuraWeight: 0.20,
    humourMeterWeight: 0.20,
    classroomVibeWeight: 0.20,
    mentorEnergyWeight: 0.20,
    classroomPresenceWeight: 0.20,
  },

  // -----------------------------
  // 12 NEW ARCHETYPES
  // Each set of weights totals 1.00.
  // -----------------------------
  {
    name: "The Knowledge Alchemist",
    description:
      "Transforms difficult ideas into clear understanding through excellent teaching and thoughtful guidance.",
    teachingAuraWeight: 0.40,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.35,
    classroomPresenceWeight: 0.10,
  },
  {
    name: "The Lecture Showrunner",
    description:
      "Combines engaging delivery, humour and confident presence to make lectures memorable.",
    teachingAuraWeight: 0.15,
    humourMeterWeight: 0.30,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.05,
    classroomPresenceWeight: 0.40,
  },
  {
    name: "The Lecture Titan",
    description:
      "Pairs exceptional explanation skills with a commanding and memorable classroom presence.",
    teachingAuraWeight: 0.40,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.05,
    mentorEnergyWeight: 0.10,
    classroomPresenceWeight: 0.40,
  },
  {
    name: "The Syllabus Strategist",
    description:
      "Organizes complex material into a clear learning path and delivers it with precision.",
    teachingAuraWeight: 0.35,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.10,
    classroomPresenceWeight: 0.40,
  },
  {
    name: "The Student Shield",
    description:
      "Creates a supportive learning environment and consistently helps students find their way forward.",
    teachingAuraWeight: 0.10,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.30,
    mentorEnergyWeight: 0.45,
    classroomPresenceWeight: 0.10,
  },
  {
    name: "The Ice-Cold Intellectual",
    description:
      "Brings precise explanations, composure and formidable command of the classroom.",
    teachingAuraWeight: 0.35,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.05,
    mentorEnergyWeight: 0.10,
    classroomPresenceWeight: 0.45,
  },
  {
    name: "The Academic Oracle",
    description:
      "Combines clear teaching, insightful mentorship and a confident classroom presence.",
    teachingAuraWeight: 0.30,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.30,
    classroomPresenceWeight: 0.25,
  },
  {
    name: "The Faculty Mythic",
    description:
      "A rare all-rounder whose strengths span teaching, humour, classroom atmosphere, mentorship and presence.",
    teachingAuraWeight: 0.20,
    humourMeterWeight: 0.20,
    classroomVibeWeight: 0.20,
    mentorEnergyWeight: 0.20,
    classroomPresenceWeight: 0.20,
  },
  {
    name: "The Clarity Champion",
    description:
      "Makes challenging concepts understandable and communicates them with confidence.",
    teachingAuraWeight: 0.45,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.15,
    classroomPresenceWeight: 0.25,
  },
  {
    name: "The Inspiration Icon",
    description:
      "Leads with confidence and encourages students through strong mentorship and presence.",
    teachingAuraWeight: 0.10,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.15,
    mentorEnergyWeight: 0.35,
    classroomPresenceWeight: 0.35,
  },
  {
    name: "The Wisdom Architect",
    description:
      "Builds lasting understanding through clear explanations, supportive guidance and a welcoming atmosphere.",
    teachingAuraWeight: 0.30,
    humourMeterWeight: 0.05,
    classroomVibeWeight: 0.20,
    mentorEnergyWeight: 0.35,
    classroomPresenceWeight: 0.10,
  },
  {
    name: "The Lecture Legend",
    description:
      "Combines strong teaching, engaging humour and memorable classroom presence.",
    teachingAuraWeight: 0.30,
    humourMeterWeight: 0.25,
    classroomVibeWeight: 0.10,
    mentorEnergyWeight: 0.05,
    classroomPresenceWeight: 0.30,
  },
];

const createdArchetypes: Record<string, string> = {};

for (const archetype of archetypes) {
  const result = await prisma.archetype.upsert({
    where: {
      name: archetype.name,
    },

    update: {
      description: archetype.description,
      teachingAuraWeight: archetype.teachingAuraWeight,
      humourMeterWeight: archetype.humourMeterWeight,
      classroomVibeWeight: archetype.classroomVibeWeight,
      mentorEnergyWeight: archetype.mentorEnergyWeight,
      classroomPresenceWeight: archetype.classroomPresenceWeight,
      isActive: true,
    },

    create: {
      ...archetype,
      isActive: true,
    },
  });

  createdArchetypes[result.name] = result.id;
}

console.log("✅ Archetypes added");


// =====================================================
// SPECIAL MOVES
// =====================================================

const specialMoves = [
  // Original 8 special moves
  {
    archetype: "Legendary Sensei",
    name: "Concept Liberation: Final Form",
    description:
      "Breaks a difficult concept into pieces until the entire class finally understands it.",
  },
  {
    archetype: "Concept Commander",
    name: "Infinite Knowledge",
    description:
      "Connects concepts, examples and explanations into one unstoppable teaching combo.",
  },
  {
    archetype: "Classroom Entertainer",
    name: "Comedy Domain: Infinite One-Liners",
    description:
      "Transforms an ordinary lecture into an entertaining classroom session.",
  },
  {
    archetype: "Chill Mentor",
    name: "Domain Expansion: Absolute Chill",
    description:
      "Creates a relaxed zone where students can ask questions without hesitation.",
  },
  {
    archetype: "Guardian Sensei",
    name: "Guidance Overdrive",
    description:
      "Activates maximum mentor energy to help students find the path forward.",
  },
  {
    archetype: "Main Character Faculty",
    name: "Conqueror's Presence",
    description:
      "Enters the classroom and instantly captures everyone's attention.",
  },
  {
    archetype: "Calm Commander",
    name: "Domain Expansion: Complete Silence",
    description:
      "Restores classroom order with calm, confident presence.",
  },
  {
    archetype: "Balanced Legend",
    name: "Ultimate Technique: Perfect Balance",
    description:
      "Combines teaching, humour, mentorship, vibe and presence into one balanced ability.",
  },

  // New 12 signature special moves
  {
    archetype: "The Knowledge Alchemist",
    name: "Concept Transmutation",
    description:
      "Turns a difficult topic into a clear and understandable idea.",
  },
  {
    archetype: "The Lecture Showrunner",
    name: "The Grand Reveal",
    description:
      "Brings a lesson together with engaging delivery and a memorable explanation.",
  },
  {
    archetype: "The Lecture Titan",
    name: "Knowledge Shockwave",
    description:
      "Connects the key ideas of a topic in one powerful, confidence-building explanation.",
  },
  {
    archetype: "The Syllabus Strategist",
    name: "Master Plan",
    description:
      "Links separate lessons into a structured path students can follow.",
  },
  {
    archetype: "The Student Shield",
    name: "Safety Net",
    description:
      "Makes a challenging learning moment feel manageable with patient guidance.",
  },
  {
    archetype: "The Ice-Cold Intellectual",
    name: "Flawless Deduction",
    description:
      "Breaks a complex problem into precise, logical steps.",
  },
  {
    archetype: "The Academic Oracle",
    name: "Future Insight",
    description:
      "Anticipates common points of confusion and guides students through them.",
  },
  {
    archetype: "The Faculty Mythic",
    name: "Legendary Lecture",
    description:
      "Brings teaching, humour, classroom atmosphere, mentorship and presence together.",
  },
  {
    archetype: "The Clarity Champion",
    name: "Clarity Burst",
    description:
      "Transforms a complicated topic into a simple, memorable explanation.",
  },
  {
    archetype: "The Inspiration Icon",
    name: "Inspiration Surge",
    description:
      "Turns a difficult moment into motivation to keep learning.",
  },
  {
    archetype: "The Wisdom Architect",
    name: "Wisdom Blueprint",
    description:
      "Connects a difficult concept to practical examples students can remember.",
  },
  {
    archetype: "The Lecture Legend",
    name: "Legendary Delivery",
    description:
      "Makes a lesson engaging and memorable through clear teaching and confident delivery.",
  },
];

for (const move of specialMoves) {
  const archetypeId = createdArchetypes[move.archetype];

  const existingMove = await prisma.specialMove.findFirst({
    where: {
      name: move.name,
      archetypeId,
    },
  });

  if (existingMove) {
    await prisma.specialMove.update({
      where: {
        id: existingMove.id,
      },

      data: {
        description: move.description,
        isActive: true,
      },
    });
  } else {
    await prisma.specialMove.create({
      data: {
        name: move.name,
        description: move.description,
        archetypeId,
        isActive: true,
      },
    });
  }
}

console.log("✅ Special moves added");

  console.log("✅ 25 rating titles added");
  console.log("🎉 ProfessorDex seed completed successfully");

// =====================================================
// DEFAULT ADMIN
// =====================================================

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error(
    "ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env"
  );
}

const passwordHash = await bcrypt.hash(adminPassword, 12);

await prisma.admin.upsert({
  where: {
    email: adminEmail,
  },

  update: {
    passwordHash,
    isActive: true,
  },

  create: {
    email: adminEmail,
    passwordHash,
    name: "ProfessorDex Admin",
    isActive: true,
  },
});

console.log("✅ Default admin created");

}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });