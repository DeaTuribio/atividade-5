const pool = require("../database/db");

async function last(_req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM megasena ORDER BY concurso DESC LIMIT 1",
    );

    if (result.rowCount == 0) {
      return res.status(404).json({ message: "Nenhum concurso cadastrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function getConcurso(req, res) {
  const { concurso } = req.params;

  if (/^\d+$/.test(concurso) == false) {
    return res
      .status(400)
      .json({ message: "O concurso deve ser um número inteiro" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM megasena WHERE concurso = $1`,
      [concurso],
    );

    if (result.rowCount == 0) {
      return res.status(404).json({ message: "Nenhum concurso cadastrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function conferirPalpite(req, res) {
  const { numeros } = req.query;
  
  if (!numeros || typeof numeros !== 'string') {
    return res.status(400).json({ message: "O parâmetro 'numeros' é obrigatório e deve ser uma string." });
  }

  const numeroString = numeros
    .replace(/[^\d,]/g, "")
    .replace(/,+/g, ",")
    .split(",");

  const palpite = [];
  for (const nro of numeroString) {
    if (Number(nro) >= 1 && Number(nro) <= 60) {
      palpite.push(Number(nro));
    }
  }

  if (palpite.length < 6 || palpite.length > 12) {
    return res
      .status(400)
      .json({
        message:
          "O palpite deve conter entre 6 e 12 dezenas com valores de 1 a 60",
      });
  }

  const acertos = {
    "4 acertos": 0,
    "5 acertos": 0,
    "6 acertos": 0,
  };

  try {
    // 1️⃣ BUSCAR OS DADOS DO SORTEIO
    const result = await pool.query(
      `SELECT concurso, bola1, bola2, bola3, bola4, bola5, bola6 FROM megasena ORDER BY concurso DESC LIMIT 1`,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Nenhum concurso encontrado" });
    }

    // 2️⃣ EXTRAIR AS BOLAS SORTEADAS
    const sorteio = result.rows[0];
    const bolasSorteadas = [
      sorteio.bola1,
      sorteio.bola2,
      sorteio.bola3,
      sorteio.bola4,
      sorteio.bola5,
      sorteio.bola6,
    ];

    // 3️⃣ CONTAR QUANTOS NÚMEROS DO PALPITE ACERTARAM
    let quantidadeAcertos = 0;
    for (const numeroPalpite of palpite) {
      // Verifica se o número do palpite existe nas bolas sorteadas
      if (bolasSorteadas.includes(numeroPalpite)) {
        quantidadeAcertos++;
      }
    }

    // 4️⃣ ATUALIZAR O OBJETO ACERTOS
    // Se acertou 4, 5 ou 6 números, incrementa o contador
    if (quantidadeAcertos === 4) {
      acertos["4 acertos"] = 1;  // 1 significa "acertou em 1 concurso"
    } else if (quantidadeAcertos === 5) {
      acertos["5 acertos"] = 1;
    } else if (quantidadeAcertos === 6) {
      acertos["6 acertos"] = 1;
    }

    // 5️⃣ RETORNAR O RESULTADO
    res.json({
      palpite,
      concursos_consultados: result.rowCount,
      bolasSorteadas,
      quantidadeAcertos,
      acertos,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = {
  last,
  getConcurso,
  conferirPalpite,
};
