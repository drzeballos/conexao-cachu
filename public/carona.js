document.getElementById("year").textContent = new Date().getFullYear();

function formatDateBR(dateStr) {
    if (!dateStr) return "";
    const cleanDate = dateStr.split(" ")[0];
    const parts = cleanDate.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function loadSingleRide() {
    const container = document.getElementById("singleRideContainer");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        container.innerHTML = `<div class="text-center py-8 bg-red-50 text-red-600 rounded-xl border border-red-200">⚠️ Link inválido.</div>`;
        return;
    }

    try {
        const res = await fetch(`/rides/${id}`);
        if (!res.ok) throw new Error("Carona não encontrada");
        const ride = await res.json();
        const valorFormatado = parseFloat(ride.price).toFixed(2).replace('.', ',');

        // Detalhes para o WhatsApp
        let opcionais = [];
        if (ride.only_woman) opcionais.push("*Só Mulheres*");
        if (ride.pet) opcionais.push("Aceita Pet");
        const textoOpcionais = opcionais.length > 0 ? opcionais.join(', ') : "Nenhum opcional";

        // Pega a URL atual exata para colocar no HREF
        const currentUrl = window.location.href;

        const whatsappMsg = `Olá *${ride.name}*! Vi seu anúncio no Conexão Cachú.\nDe: ${ride.origin}\nPara: ${ride.destination}\nData: ${formatDateBR(ride.date)} às ${ride.time}\nValor: R$ ${valorFormatado}\nDetalhes: ${textoOpcionais}\n\n---\n${currentUrl}`;
        const whatsappUrl = `https://wa.me/55${ride.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

        // Cores e Estilos
        const isOffer = ride.type === 'offer';
        const badgeColor = isOffer ? "bg-cyan-100 text-cyan-800" : "bg-orange-100 text-orange-800";
        const badgeText = isOffer ? "OFEREÇO" : "PROCURO";
        const borderColor = isOffer ? "bg-cyan-500" : "bg-orange-500";
        const btnZapColor = "bg-green-600 hover:bg-green-700 shadow-green-100";

        container.innerHTML = `
        <div class="ride-card bg-white rounded-2xl shadow-xl border border-gray-200 p-6 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-2 ${borderColor}"></div>
          
          <div class="flex justify-between items-start mb-4 pl-3">
            <div>
                <h3 class="font-bold text-gray-800 text-xl flex items-center gap-2">${ride.name}</h3>
                <span class="${badgeColor} text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">${badgeText}</span>
            </div>
            <div class="text-right">
                <span class="block text-2xl font-bold text-green-600">R$ ${valorFormatado}</span>
                <span class="text-sm text-gray-500 font-medium">${formatDateBR(ride.date)} • ${ride.time}</span>
            </div>
          </div>

          <div class="mb-6 text-base text-gray-700 space-y-2 pl-3 border-l-2 border-gray-100 ml-1">
            <p><strong>Origem:</strong> ${ride.origin}</p>
            <p><strong>Destino:</strong> ${ride.destination}</p>
          </div>

          <div class="space-y-3">
              <a href="${whatsappUrl}" target="_blank" class="flex items-center justify-center gap-2 w-full ${btnZapColor} text-white py-4 rounded-xl font-bold transition shadow-lg text-lg no-underline">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Conversar no WhatsApp
              </a>

              <div class="text-center">
                  <a href="${currentUrl}" class="flex items-center justify-center gap-2 w-full bg-cyan-50 text-cyan-600 border border-cyan-100 py-3 rounded-xl hover:bg-cyan-100 font-bold transition shadow-sm no-underline text-base cursor-pointer">
                    🔗 Link da Carona
                  </a>
                  <p class="text-xs text-gray-400 mt-1">Segure ou clique com botão direito para copiar</p>
              </div>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 text-center">
             <button onclick="deletarCarona('${ride.Id}')" class="text-red-400 text-sm font-medium hover:text-red-600 underline transition cursor-pointer flex items-center justify-center gap-1 mx-auto">
                 🗑️ Apagar este anúncio
             </button>
          </div>
        </div>`;

        // FIM DA INJEÇÃO HTML
        // Note que não existe mais addEventListener aqui. Zero JS para o link.

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="text-center py-12">👻 Carona não encontrada.</div>`;
    }
}

async function deletarCarona(id) {
    if (!confirm("Tem certeza que deseja apagar este anúncio?")) return;
    try {
        const res = await fetch(`/rides/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (res.ok) {
            alert("✨ Anúncio removido!");
            window.location.href = "/";
            return;
        }
        if (res.status === 401) {
            const pin = prompt("🔒 Digite sua senha (PIN):");
            if (!pin) return;
            const res2 = await fetch(`/rides/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: pin })
            });
            if (res2.ok) {
                alert("✅ Removido!");
                window.location.href = "/";
            } else {
                alert("❌ Erro no PIN");
            }
            return;
        }
    } catch (err) {
        alert("Erro de conexão.");
    }
}
window.deletarCarona = deletarCarona;
loadSingleRide();