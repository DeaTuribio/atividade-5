const { Router } = require("express");
const {
  getConcurso,
  last,
  conferirPalpite,
} = require("../repositories/senas.repository");

const routes = Router();

routes.get("/", last);
routes.get("/palpite", conferirPalpite);
routes.get("/:concurso", getConcurso);

module.exports = routes;
