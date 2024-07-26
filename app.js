const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const upload = multer();
const http = require("http");
const socketIo = require("socket.io");
const flash = require("express-flash");
const authSocket = require("./middleware/authSocket");
const setupRoutes = require("./startup/routes");
const { initializeDB } = require("./startup/start");
const models = require("./models/index");
const setupSocketRoutes = require("./chatRoutes/index");

const app = express();

async function initialize() {
  try {
    await initializeDB();

    const server = http.createServer(app);
    const io = socketIo(server);

    io.use(authSocket); // Use the authentication middleware

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(upload.any());
    app.use("/uploads", express.static("uploads"));
    app.use("/logos", express.static("logos"));
    app.set("models", models);
    app.set("view engine", "ejs");

    setupRoutes(app);
    await setupSocketRoutes(io);

    const port = 3001;
    server.listen(port, () =>
      console.log(`Server is running on port: ${port}`)
    );
  } catch (err) {
    console.log("Failed to initialize: ", err);
    process.exit(1);
  }
}

initialize();
