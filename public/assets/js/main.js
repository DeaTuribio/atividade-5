const form = document.querySelector("#search-form");
const input = document.querySelector("#concurso-input");
const button = form.querySelector("button[type='submit']");
const result = document.querySelector("#result");

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function setMessage(message) {
  result.innerHTML = `<div class="message">${message}</div>`;
}

function renderDraw(data) {
  console.log(data);
  result.innerHTML = `
        <article class="draw">
            <header class="draw-header">
                <div>
                    <h2 class="draw-title">Concurso ${data.concurso}</h2>
                    <span class="draw-date">${formatDate(data.data_do_sorteio)}</span>
                </div>
                <strong>
                    ${Number(data.ganhadores_6_acertos) === 0 ? "Acumulou" : "Houve ganhadores"}
                </strong>
            </header>

            <ul class="balls">
                <li class="ball">${String(data.bola1 ?? data.bola_1).padStart(2, "0")}</li>
                <li class="ball">${String(data.bola2 ?? data.bola_2).padStart(2, "0")}</li>
                <li class="ball">${String(data.bola3 ?? data.bola_3).padStart(2, "0")}</li>
                <li class="ball">${String(data.bola4 ?? data.bola_4).padStart(2, "0")}</li>
                <li class="ball">${String(data.bola5 ?? data.bola_5).padStart(2, "0")}</li>
                <li class="ball">${String(data.bola6 ?? data.bola_6).padStart(2, "0")}</li>
            </ul>
            <div class="details">
              <div class="detail">
                <strong>6 acertos</strong>
                ${data.ganhadores_6_acertos} ganhador(es), ${formatCurrency(data.rateio_6_acertos)}
              </div>
              <div class="detail">
                <strong>5 acertos</strong>
                ${data.ganhadores_5_acertos} ganhador(es), ${formatCurrency(data.rateio_5_acertos)}
              </div>
              <div class="detail">
                <strong>4 acertos</strong>
                ${data.ganhadores_4_acertos} ganhador(es), ${formatCurrency(data.rateio_4_acertos)}
              </div>
              <div class="detail">
                <strong>Estimativa</strong>
                ${formatCurrency(data.estimativa_premio)}
              </div>
              <div class="detail">
                <strong>Sorteio realizado em</strong>
                ${formatDate(data.data_do_sorteio)}
              </div>
            </div>
          </article>`;
}

async function loadConcurso(concurso = "") {
  const endpoint = concurso ? `/api/${concurso}` : "/api";

  button.disabled = true;
  setMessage("Carregando...");

  await delay(1000);  


  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (response.ok) {
      renderDraw(data);
    } else {
      setMessage(data.message || "Não foi possível carregar o concurso");
    }
  } catch (error) {
    console.error(error);
    setMessage("Erro ao carregar o concurso");
  } finally {
    if (button) button.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const concurso = input.value.trim();
  loadConcurso(concurso);
});

loadConcurso();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 

