// === SISTEMA DE DESTAQUES (public/highlights.js) ===
// v3.0 - Proporção 3:1 (1200x400) Perfeita
(async function initHighlights() {
    console.log("🚀 Highlights: Iniciando sistema com proporção 3:1...");

    const container = document.getElementById("highlightContainer");

    if (!container) return;

    // === PREPARAÇÃO DO CONTAINER ===
    console.log("🔧 Highlights: Ajustando proporção...");

    container.classList.remove('opacity-0', 'scale-95', 'transition-all', 'transform');

    // CSS CRÍTICO PARA NÃO CORTAR
    // aspect-ratio: 3/1 garante que a caixa tenha o formato exato da imagem (1200x400)
    container.style.cssText = `
        display: block;
        width: 100%;
        aspect-ratio: 3 / 1; /* A MÁGICA ESTÁ AQUI */
        position: relative;
        overflow: hidden;
        border-radius: 0.75rem;
        background-color: #f3f4f6;
        opacity: 1;
        margin-bottom: 1.5rem;
    `;

    try {
        const res = await fetch('/partners');
        const data = await res.json();

        if (!data || data.length === 0) {
            container.style.display = 'none';
            return;
        }

        let currentIndex = 0;

        function renderStructure(item) {
            container.innerHTML = `
                <a href="${item.link}" id="hl-link" target="_blank" style="display: block; width: 100%; height: 100%;">
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        <img id="hl-img" src="${item.img}" 
                             alt="Destaque" 
                             style="width: 100%; height: 100%; object-fit: cover; opacity: 1; transition: opacity 0.7s ease-in-out;"
                        >
                    </div>
                    <div style="position: absolute; bottom: 6px; right: 6px; background-color: rgba(0,0,0,0.6); color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; z-index: 10;">
                        Parceiro
                    </div>
                </a>
            `;
        }

        renderStructure(data[0]);

        if (data.length > 1) {
            setInterval(() => {
                const img = document.getElementById('hl-img');
                const link = document.getElementById('hl-link');

                if (!img || !link) return;

                // Fade Out
                img.style.opacity = '0';

                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % data.length;
                    const nextItem = data[currentIndex];

                    const temp = new Image();
                    temp.src = nextItem.img;

                    temp.onload = () => {
                        link.href = nextItem.link;
                        img.src = nextItem.img;
                        // Fade In
                        requestAnimationFrame(() => img.style.opacity = '1');
                    };

                }, 700);

            }, data[currentIndex].duration || 5000);
        }

    } catch (err) {
        console.error("Erro highlights:", err);
        container.style.display = 'none';
    }
})();