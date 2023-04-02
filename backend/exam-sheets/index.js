const { createSheet, publishSheet, getSheets, getSheet, deleteSheet, updateSheet } = require("./controllers/SheetsController");

const fastify = require("fastify")({
  logger: true
});
fastify.register(require('fastify-cors'));
require("dotenv").config();
const mongoose = require("mongoose");

const initDb = async () => {
  const uri = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`;

  mongoose.connection.on("connecting", () => {
    console.log("MONGOOSE_EVENT connecting");
  });
  mongoose.connection.on("connected", () => {
    console.log(`Mongodb - connected ${uri}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MONGOOSE_EVENT disconnected");
  });

  await mongoose.connect(uri);
};

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.post("/sheet", createSheet);
fastify.post("/sheet/:sheetId", updateSheet);
fastify.post("/sheet/publish", publishSheet);
fastify.get("/sheets", getSheets);
fastify.get("/sheet/:sheetId", getSheet);
fastify.delete("/sheet/:sheetId", deleteSheet);

const start = async () => {
  await initDb();
  console.log(process.env.PORT);
  try {
    await fastify.listen({ port: process.env.PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
