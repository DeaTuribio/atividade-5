const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

const router = require("./routes/senas.routes");
dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "..", ".env"),
});
const PORT = process.env.PORT || 3005;
const app = express();
app.use(express.json());
const publicPath = path.join(__dirname, "..", "public");
const pagesPath = path.join(publicPath, "pages");
const assetsPath = path.join(publicPath, "assets");
app.use("/", express.static(pagesPath));
app.use("/assets", express.static(assetsPath));
app.use("/api", router);
app.listen(PORT, function () {
  console.log(`Rodando em http://localhost:${PORT}`);
});
