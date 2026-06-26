require("dotenv").config();

const connectDB = require("./src/config/db.js/db.js");

const app = require("./src/app.js/app.js");

const listen = (port, attemptsLeft = 10) => {
  const server = app.listen(
    port,
    () => {
      console.log(
        `Server running on port ${port}`
      );
    }
  );

  server.on("error", error => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = Number(port) + 1;

      console.warn(
        `Port ${port} is already in use. Trying port ${nextPort}...`
      );

      listen(nextPort, attemptsLeft - 1);

      return;
    }

    console.error(error.message);
  });
};

const startServer =
  async () => {
    await connectDB();

    listen(Number(process.env.PORT) || 5000);
  };

startServer();
