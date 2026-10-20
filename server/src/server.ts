import "dotenv/config";

import app from "./app.ts";
import { prisma } from "./config/database.ts";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log("");
  console.log("========================================");
  console.log("🎓 ProfessorDex Backend");
  console.log("========================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log("========================================");
  console.log("");
});


async function shutdown() {
  console.log("\nShutting down ProfessorDex...");

  await prisma.$disconnect();

  server.close(() => {
    console.log("Server stopped.");
    process.exit(0);
  });
}


process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);