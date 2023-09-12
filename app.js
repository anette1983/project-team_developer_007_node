const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();

const authRouter = require("./routes/api/auth");
const recipesRouter = require("./routes/api/recipes");

const app = express();

// const corsOptions = {
//   origin: "https://anette1983.github.io/project-team_developer_007_react",
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true, 
// };

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
// app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/users", authRouter);
app.use("/api/recipes", recipesRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;
