console.log("🔥 Form v3.1 (Clean Edition) carregado");

// === DATA NO RODAPÉ ===
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// === LISTA DE LOCAIS (CACHOEIRAS) ===
const LOCAIS = [
  // --- BASES / CIDADES ---
  "Alto Paraíso - Centro",
  "Vila de São Jorge",
  "Cavalcante - Centro",
  "São João D'Aliança - Centro",
  "Colinas do Sul - Centro",
  "Teresina de Goiás - Centro",
  "Brasília (Aeroporto/Rodoviária)",

  // --- ALTO PARAÍSO ---
  "Água Fria", "Aldeia Multiétnica", "Almécegas 1, 2 e 3", "São Bento",
  "Alpes Goianos", "Anjos e Arcanjos", "Bona Espero", "Caminho da Lua",
  "Caracol (Complexo do Caldeira)", "Chapada Alta (Sede/Selvagem)",
  "Cordovil", "Esmeralda", "Cataratas dos Couros", "Cristais",
  "Lajeado", "Loquinhas", "Mirante da Janela", "Morada do Sol",
  "Morro da Baleia", "Papagaio", "Paraíso dos Pandavas",
  "Parque Nacional (Portaria)", "Portal Beija-flor", "Praia do Jatobá",
  "Raizama", "Segredo", "Sertão Zen", "Simão Correia",
  "Valle das Pedras", "Vale da Lua",

  // --- CAVALCANTE ---
  "Ave Maria", "Barroco", "Mundo Novo", "Boqueirão", "Candaru",
  "Cânion São Félix", "Cachoeira Boa Brisa", "Capivara", "Canjica",
  "Complexo do Prata", "Complexo Veredas", "Ponte de Pedra",
  "Poço Xamânico", "Santa Bárbara", "Cachoeira Félix",
  "Vale da Chapada", "Vargem Redonda",

  // --- SÃO JOÃO D'ALIANÇA ---
  "Bocaina do Farias", "Cachoeira do Bonito", "Cantinho",
  "Complexo Veadeiros", "Cachoeira do Dragão", "Cachoeira Label",
  "Macaco", "Macaquinhos", "Paraíso dos Cactos",

  // --- COLINAS DO SUL ---
  "Águas Termais Éden", "Águas Termais Morro Vermelho",
  "Águas Termais do Jequitibá", "Encontro das Águas",
  "Funil do Rio Preto", "Montana", "No Pé da Serra", "Pau Brasil",
  "Pedras Bonitas", "Praia das Pedras", "Lago Serra da Mesa (Lancha)",

  // --- TERESINA DE GOIÁS ---
  "Fazenda Touro Bravo", "Cachoeira da Força", "Fundo de Quintal",
  "Poço Encantado", "Três Corações", "Jacundá"
];

const origemEl = document.getElementById("origem");
const destinoEl = document.getElementById("destino");

// Preencher os Selects e Ordenar
if (origemEl && destinoEl) {
  LOCAIS.sort().forEach(c => {
    origemEl.appendChild(new Option(c, c));
    destinoEl.appendChild(new Option(c, c));
  });
}

// === TÍTULO DINÂMICO ===
const params = new URLSearchParams(window.location.search);
const tipoURL = params.get("type") === "request" ? "request" : "offer";
const titleEl = document.getElementById("formTitle");
if (titleEl) {
  titleEl.textContent = tipoURL === "offer" ? "Oferecer Carona" : "Solicitar Carona";
}

const rideForm = document.getElementById("rideForm");
const successMsg = document.getElementById("successMsg");

// === MÁSCARA DE TELEFONE ===
const phoneInput = document.getElementById("phone");
if (phoneInput) {
  phoneInput.addEventListener("input", (e) => {
    let x = e.target.value.replace(/\D/g, "").match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : "(" + x[1] + ") " + x[2] + (x[3] ? "-" + x[3] : "");
  });
}

function limparErro() {
  if (origemEl) origemEl.classList.remove("border-red-500", "bg-red-50");
  if (destinoEl) destinoEl.classList.remove("border-red-500", "bg-red-50");
}

if (origemEl) origemEl.addEventListener("change", limparErro);
if (destinoEl) destinoEl.addEventListener("change", limparErro);

// === ENVIO DO FORMULÁRIO ===
if (rideForm) {
  rideForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const origin = origemEl.value;
    const destination = destinoEl.value;

    if (origin === destination) {
      alert("⚠️ Erro: Origem e Destino iguais!");
      origemEl.classList.add("border-red-500", "bg-red-50");
      destinoEl.classList.add("border-red-500", "bg-red-50");
      return;
    }

    // === MONTAGEM DO PAYLOAD ===
    const payload = {
      type: tipoURL,
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      secret_code: document.getElementById("secret_code").value.trim(),
      origin: origin,
      destination: destination,
      date: document.getElementById("data").value,
      time: document.getElementById("hora").value,
      price: document.getElementById("valor").value,
      seats: document.getElementById("vagas").value,
      pet: document.getElementById("pet").checked,
      only_woman: document.getElementById("only_woman").checked,
      package: false,
      baggage: false
    };

    try {
      const res = await fetch("/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro na API");

      if (successMsg) {
        successMsg.classList.remove("hidden");
        successMsg.scrollIntoView({ behavior: 'smooth' });
      }

      rideForm.reset();

      setTimeout(() => window.location.href = "/", 2000);

    } catch (err) {
      console.error(err);
      alert("Erro ao enviar carona.");
    }
  });
}