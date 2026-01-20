# 🌊 Conexão Cachú (Fork do Conexão Chapada)

> **O problema da "Última Milha" resolvido na Chapada dos Veadeiros.**

O **Conexão Cachú** é uma iniciativa open-source de mobilidade solidária focada no deslocamento interno entre as cidades-base (Alto Paraíso, São Jorge, Cavalcante) e as atrações turísticas (Cachoeiras) da região.

Nasceu de um *fork* estratégico do projeto [Conexão Chapada], adaptando a lógica de caronas rodoviárias para o ecossistema de turismo local, conectando turistas sem carro a guias e motoristas com vagas ociosas.

## 🚀 Tecnologias (A "Stack" do Poder)

Construído com simplicidade e performance em mente:

- **Frontend:** HTML5, TailwindCSS (Vanilla JS, sem frameworks pesados).
- **Backend:** Node.js + Express (Leve e rápido).
- **Database:** NocoDB (Low-code/No-code database) via API REST.
- **Infra:** Docker & Docker Compose.
- **Conceito:** PWA (Progressive Web App) - Funciona como app nativo.

## 🛠️ Como Rodar (Para a Posteridade)

### Pré-requisitos
- Node.js v18+ ou Docker
- Acesso a uma instância do NocoDB

### Instalação Local
1. Clone o repositório.
2. Configure o `.env` (use o `env.example` como base).
3. Instale as dependências:
   ```bash
   npm install


   ----
   graph TD
    User((👤 Usuário/Turista))
    Guide((🚙 Guia/Motorista))
    
    subgraph "Frontend (PWA)"
        UI[📱 Interface Mobile]
        JS[⚡ app.js / form.js]
    end

    subgraph "Backend (Node.js)"
        Server[🖥️ Express Server]
        Auth[🔒 Validação de PIN/IP]
        Router[🔀 Rotas /rides]
    end

    subgraph "Persistência (NocoDB)"
        API[📡 API REST]
        DB[(🗄️ Tabela Cachoeiras)]
    end

    User -->|Solicita Carona| UI
    Guide -->|Oferece Vaga| UI
    
    UI -->|Fetch JSON| JS
    JS -->|POST / GET / DELETE| Server
    
    Server -->|Valida Dados| Auth
    Auth -->|Request Seguro| Router
    Router -->|Axios| API
    API -->|CRUD| DB
    
    style User fill:#ff9f43,stroke:#333,stroke-width:2px
    style Guide fill:#0abde3,stroke:#333,stroke-width:2px
    style Server fill:#1dd1a1,stroke:#333,stroke-width:2px
    style DB fill:#5f27cd,stroke:#333,stroke-width:2px,color:white