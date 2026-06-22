require("dotenv").config();

const connectDB = require("./src/config/db.js/db.js");

const app = require("./src/app.js/app.js");

const startServer =
  async () => {
    await connectDB();

    app.listen(
      process.env.PORT,
      () => {
        console.log(
          `Server running on port ${process.env.PORT}`
        );
      }
    );
  };

startServer();
