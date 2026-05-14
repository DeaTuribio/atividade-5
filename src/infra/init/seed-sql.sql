TRUNCATE TABLE megasena;
COPY megasena
FROM '__SEED_DATA_DIR__/megasena.csv'
WITH (
FORMAT csv,
HEADER true,
DELIMITER ';',
NULL 'NULL',
ENCODING 'UTF8'
);