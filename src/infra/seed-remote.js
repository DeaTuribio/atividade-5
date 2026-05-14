const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');
const path = require('path');

// Carrega as variáveis de ambiente do .env na raiz do projeto
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  console.error("ERRO: DATABASE_URL não encontrada no arquivo .env");
  console.error("Por favor, adicione DATABASE_URL=sua_url_do_render no seu .env local e tente novamente.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ';' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current);
  return result;
}

async function run() {
  try {
    console.log("Conectando ao banco de dados na nuvem...");
    
    // 1. Criar a tabela
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'init/schema-sql.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log("Tabela 'megasena' garantida no banco.");

    // Limpa a tabela caso já tenha algo
    await pool.query('TRUNCATE TABLE megasena');

    console.log("Lendo arquivo CSV e enviando milhares de linhas para a nuvem... Isso pode demorar alguns segundos.");
    const fileStream = fs.createReadStream(path.resolve(__dirname, 'init/seed-data/megasena.csv'));
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true;
    for await (const line of rl) {
      if (isFirstLine) {
        isFirstLine = false;
        continue; // Pula o cabeçalho
      }
      
      const values = parseCSVLine(line);
      const processedValues = values.map(v => v === 'NULL' || v.trim() === '' ? null : v.trim());
      
      const query = `
        INSERT INTO megasena (
          concurso, data_do_sorteio, bola1, bola2, bola3, bola4, bola5, bola6, 
          ganhadores_6_acertos, cidade_uf, rateio_6_acertos, ganhadores_5_acertos, 
          rateio_5_acertos, ganhadores_4_acertos, rateio_4_acertos, acumulado_6_acertos, 
          arrecadacao_total, estimativa_premio, acumulado_sorteio_especial_mega_da_virada, observacao
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
      `;
      
      await pool.query(query, processedValues);
    }
    
    console.log("✅ Dados da Mega-Sena enviados com sucesso para o banco no Render!");
  } catch (err) {
    console.error("❌ Ocorreu um erro:", err);
  } finally {
    await pool.end();
  }
}

run();
