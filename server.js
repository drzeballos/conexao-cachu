require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

console.log(`
🌊  C O N E X Ã O   C A C H Ú  🌊
   by Zeballos Tecnologia v3.0
//
//  ███████╗███████╗██████╗  █████╗ ██╗     ██╗      ██████╗ ███████╗
//  ╚══███╔╝██╔════╝██╔══██╗██╔══██╗██║     ██║     ██╔═══██╗██╔════╝
//    ███╔╝ █████╗  ██████╔╝███████║██║     ██║     ██║   ██║███████╗
//   ███╔╝  ██╔══╝  ██╔══██╗██╔══██║██║     ██║     ██║   ██║╚════██║
//  ███████╗███████╗██████╔╝██║  ██║███████╗███████╗╚██████╔╝███████║
//  ╚══════╝╚══════╝╚══════╝ ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚══════╝
//                                                                    
//  ████████╗███████╗ ██████╗███╗   ██╗ ██████╗ ██╗      ██████╗  ██████╗ ██╗ █████╗ 
//  ╚══██╔══╝██╔════╝██╔════╝████╗  ██║██╔═══██╗██║     ██╔═══██╗██╔════╝ ██║██╔══██╗
//     ██║   █████╗  ██║     ██╔██╗ ██║██║   ██║██║     ██║   ██║██║  ███╗██║███████║
//     ██║   ██╔══╝  ██║     ██║╚██╗██║██║   ██║██║     ██║   ██║██║   ██║██║██╔══██║
//     ██║   ███████╗╚██████╗██║ ╚████║╚██████╔╝███████╗╚██████╔╝╚██████╔╝██║██║  ██║
//     ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═╝
//
   
🚀 Servidor iniciando... Prepare a mochila!
`);

const app = express();

app.set('trust proxy', true); // Confia no proxy para pegar o IP real
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const {
  PORT = 3003,
  NOCODB_BASE_URL,
  NOCODB_API_TOKEN,
  NOCODB_TABLE,
  NOCODB_ADS_TABLE
} = process.env;

// Validação básica das variáveis de ambiente
if (!NOCODB_BASE_URL || !NOCODB_API_TOKEN || !NOCODB_TABLE || !NOCODB_ADS_TABLE) {
  console.error("❌ ERRO: Variáveis do NocoDB faltando no .env");
  process.exit(1);
}

// Cliente Axios para o NocoDB
const nocoClient = axios.create({
  baseURL: `${NOCODB_BASE_URL}/api/v2/tables`,
  headers: {
    "xc-token": NOCODB_API_TOKEN,
    "Content-Type": "application/json"
  }
});

// 🕵️‍♂️ Função Auxiliar: IP Seguro
function getClientIp(req) {
  const ip = req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.ip;
  if (typeof ip === 'string') return ip.split(',')[0].trim();
  return ip;
}

app.get("/health", (_, res) => res.json({ status: "API Online" }));

// 🤝 ROTA PARCEIROS (Destaques)
app.get("/partners", async (_, res) => {
  try {
    const { data } = await nocoClient.get(`/${NOCODB_ADS_TABLE}/records`, {
      params: { limit: 100, sort: '-Id' }
    });
    const list = data.list || [];

    let ads = list.map(item => {
      let finalUrl = '';
      if (item.image && Array.isArray(item.image) && item.image.length > 0) {
        const fileData = item.image[0];
        let rawPath = fileData.signedUrl || fileData.url || fileData.path;
        if (rawPath) {
          if (rawPath.startsWith('http')) {
            try {
              const parsedUrl = new URL(rawPath);
              rawPath = parsedUrl.pathname + parsedUrl.search;
            } catch (e) { }
          }
          const base = NOCODB_BASE_URL.replace(/\/$/, "");
          const path = rawPath.replace(/^\//, "");
          finalUrl = `${base}/${path}`;
        }
      } else if (typeof item.image === 'string') {
        finalUrl = item.image;
      }
      return {
        link: item.link || '#',
        img: finalUrl,
        duration: parseInt(item.duration) || 15000,
        originalId: item.Id
      };
    }).filter(ad => ad.img !== '');

    ads.sort((a, b) => {
      if (b.duration !== a.duration) return b.duration - a.duration;
      return b.originalId - a.originalId;
    });

    res.json(ads.slice(0, 20));
  } catch (err) {
    console.error("ERRO GET /partners:", err.message);
    res.json([]);
  }
});

// 📄 ROTA: Listar caronas
app.get("/rides", async (_, res) => {
  try {
    // FILTRO POWER: Traz apenas o que NÃO é 'expired' E TAMBÉM NÃO é 'removed'
    // Isso evita que caronas deletadas apareçam na lista para serem processadas
    const { data } = await nocoClient.get(`/${NOCODB_TABLE}/records`, {
      params: { limit: 100, sort: 'date', where: '(status,neq,expired)~and(status,neq,removed)' }
    });

    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    const activeRides = [];
    const updates = [];

    for (const ride of (data.list || [])) {
      // Dupla checagem de segurança
      if (ride.status === 'removed' || ride.status === 'expired') continue;

      if (ride.date && ride.date < today) {
        // Auto-Expiração: Se a data passou, marca como expired
        console.log(`[AUTO-EXPIRE] Expirando carona ID: ${ride.Id}`);
        updates.push(
          nocoClient.patch(`/${NOCODB_TABLE}/records`, {
            Id: ride.Id,
            status: "expired"
          }).catch(err => console.error(`Falha ao expirar ID ${ride.Id}`, err.message))
        );
      } else {
        activeRides.push(ride);
      }
    }

    // Processa atualizações em background sem travar a resposta
    if (updates.length > 0) Promise.all(updates);

    res.json(activeRides);
  } catch (err) {
    console.error("ERRO GET /rides:", err.message);
    res.status(500).json({ error: "Erro" });
  }
});

// 🔍 ROTA: Carona Específica
app.get("/rides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await nocoClient.get(`/${NOCODB_TABLE}/records/${id}`);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Carona não encontrada." });
  }
});

// ➕ ROTA: Criar carona
app.post("/rides", async (req, res) => {
  try {
    const { only_woman, pet, package: pkg, baggage, price, seats, secret_code, ...rest } = req.body;
    const userIp = getClientIp(req);
    console.log(`[NOVA CARONA] IP: ${userIp}`);

    const payload = {
      ...rest,
      price: parseFloat(price) || 0,
      seats: parseInt(seats) || 1,
      pet: !!pet,
      package: !!pkg,
      baggage: !!baggage,
      only_woman: !!only_woman,
      status: "active",
      secret_code: secret_code || "0000",
      ip_user: userIp
    };

    const { data } = await nocoClient.post(`/${NOCODB_TABLE}/records`, payload);
    res.status(201).json(data);
  } catch (err) {
    console.error("ERRO POST /rides:", err.message);
    res.status(500).json({ error: "Erro ao salvar carona" });
  }
});

// 🗑️ ROTA: Soft Delete (CORRIGIDA)
// Note a palavra 'async' abaixo! Ela é obrigatória para usar 'await'
app.delete("/rides/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    const requestIp = getClientIp(req);

    // 1. Busca a carona para validar permissão
    const { data: ride } = await nocoClient.get(`/${NOCODB_TABLE}/records/${id}`);

    let authorized = false;

    // Verifica PIN ou IP
    if (pin && ride.secret_code === pin) {
      authorized = true;
      console.log(`[DELETE] Autorizado por PIN. ID: ${id}`);
    } else if (ride.ip_user && ride.ip_user === requestIp) {
      authorized = true;
      console.log(`[DELETE] Autorizado por IP. ID: ${id}`);
    }

    if (!authorized) {
      if (!pin) return res.status(401).json({ error: "PIN necessário" });
      return res.status(403).json({ error: "Senha incorreta!" });
    }

    // 2. Realiza a remoção lógica (Soft Delete)
    // IMPORTANTE: parseInt(id) garante que o ID seja enviado como número
    await nocoClient.patch(`/${NOCODB_TABLE}/records`, {
      Id: parseInt(id),
      status: "removed"
    });

    console.log(`[DELETE] Sucesso. ID ${id} marcado como removed.`);
    res.json({ success: true });

  } catch (err) {
    console.error("Erro Delete:", err.message);
    res.status(500).json({ error: "Erro ao excluir." });
  }
});

// Rota coringa para o Frontend (SPA)
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`🚀 Conexão Cachú rodando na porta ${PORT}`));