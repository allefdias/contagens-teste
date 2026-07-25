// COLE AQUI A NOVA URL GERADA NO GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxMHA02cPFOQR0t1BSSpQUhcUiw3vRK2WUF7eo5P4pupwzBj2WSbaZHHvnz03jJSbf6/exec";

let setorCount = 0;
let dataSelecionada = new Date();

/* ---------------- SETORES COMUNS ---------------- */
const setoresComuns = [
    "RM HOSPITAL",
    "TC HOSPITAL",
    "USG HOSPITAL",
    "RM ANEXO 1 DE",
    "RM ANEXO 2 DE",
    "RM ANEXO 3 DE",
    "TC ANEXO DE",
    "USG ANEXO DE"
];

if (!localStorage.getItem("setoresSalvos")) {
    localStorage.setItem("setoresSalvos", JSON.stringify(setoresComuns));
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    atualizarDataTitulo();
    carregarNomesSalvos();
    carregarSetoresSalvos();
    adicionarSetor();
});

/* ---------------- DATA ---------------- */
function atualizarDataTitulo() {
    const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR");
    document.getElementById("dataHoje").innerText = `📅 Data: ${dataFormatada}`;
}

function alternarData() {
    document.getElementById("inputData").style.display = "inline-block";
    document.getElementById("btnConfirmarData").style.display = "inline-block";
    document.getElementById("btnAlterarData").style.display = "none";
}

function confirmarData() {
    const valor = document.getElementById("inputData").value;
    if (!valor) return;
    dataSelecionada = new Date(valor + "T00:00:00");
    atualizarDataTitulo();

    document.getElementById("inputData").style.display = "none";
    document.getElementById("btnConfirmarData").style.display = "none";
    document.getElementById("btnAlterarData").style.display = "inline-block";
}

function adicionarSetor() {
    setorCount++;
    const container = document.getElementById("setoresContainer");

    const setorDiv = document.createElement("div");
    setorDiv.className = "setor";
    setorDiv.id = `setor-${setorCount}`;

    setorDiv.innerHTML = `
        <label><strong>Setor:</strong></label>
        <div class="setor-info">
            <input type="text" class="input-setor" placeholder="Nome do setor"
                list="setoresList" onchange="salvarSetor(this.value)">
        </div>

        <div class="nomesContainer" id="nomes-${setorCount}"></div>
        <button onclick="adicionarNome(${setorCount})">+ Adicionar Nome</button>
        ${setorCount > 1 ? `<button class="repetir" onclick="repetirNomes(${setorCount})">↻ Repetir Nomes</button>` : ""}
    `;

    container.appendChild(setorDiv);
    adicionarNome(setorCount);
}

/* ---------------- NOMES ---------------- */
function adicionarNome(setorId, valor = "") {
    const container = document.getElementById(`nomes-${setorId}`);
    const div = document.createElement("div");
    div.className = "nome-proc";

    div.innerHTML = `
        <input type="text" class="input-nome" placeholder="Nome"
            list="nomesSalvosList" value="${valor}"
            onchange="salvarNome(this.value)">
        <input type="number" class="input-proc" placeholder="Qtd" min="0">
    `;

    container.appendChild(div);
}

function repetirNomes(setorId) {
    const primeiro = document.querySelector("#setor-1 .nomesContainer");
    const nomes = primeiro.querySelectorAll(".nome-proc");
    const container = document.getElementById(`nomes-${setorId}`);
    container.innerHTML = "";

    nomes.forEach(n => {
        const nome = n.querySelector(".input-nome").value.trim();
        if (nome) adicionarNome(setorId, nome);
    });
}

/* ---------------- LOCALSTORAGE ---------------- */
function salvarNome(nome) {
    if (!nome) return;
    let lista = JSON.parse(localStorage.getItem("nomesSalvos")) || [];
    if (!lista.includes(nome)) {
        lista.push(nome);
        localStorage.setItem("nomesSalvos", JSON.stringify(lista));
        atualizarDatalist("nomesSalvos", "nomesSalvosList");
    }
}

function salvarSetor(nome) {
    if (!nome) return;
    let lista = JSON.parse(localStorage.getItem("setoresSalvos")) || [];
    if (!lista.includes(nome)) {
        lista.push(nome);
        localStorage.setItem("setoresSalvos", JSON.stringify(lista));
        atualizarDatalist("setoresSalvos", "setoresList");
    }
}

function carregarNomesSalvos() {
    atualizarDatalist("nomesSalvos", "nomesSalvosList");
}

function carregarSetoresSalvos() {
    atualizarDatalist("setoresSalvos", "setoresList");
}

function atualizarDatalist(key, id) {
    const lista = JSON.parse(localStorage.getItem(key)) || [];
    const dl = document.getElementById(id);
    dl.innerHTML = "";
    lista.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        dl.appendChild(o);
    });
}

/* ---------------- ESTRUTURA DOS DADOS ---------------- */
function extrairDadosFormulario() {
    const dados = {
        data: dataSelecionada.toLocaleDateString("pt-BR"),
        observacoes: document.getElementById("observacoes").value.trim(),
        setores: []
    };

    const setoresDivs = document.querySelectorAll(".setor");

    setoresDivs.forEach(setor => {
        const nomeSetor = setor.querySelector(".input-setor").value.trim();
        if (!nomeSetor) return;

        const nomesDivs = setor.querySelectorAll(".nome-proc");
        const funcionarios = [];

        nomesDivs.forEach(n => {
            const nome = n.querySelector(".input-nome").value.trim();
            const qtd = parseInt(n.querySelector(".input-proc").value);
            if (nome && qtd > 0) {
                funcionarios.push({ nome, qtd });
            }
        });

        if (funcionarios.length > 0) {
            dados.setores.push({
                nome: nomeSetor,
                funcionarios: funcionarios
            });
        }
    });

    return dados;
}

/* ---------------- RELATÓRIO ---------------- */
function gerarRelatorio() {
    const dados = extrairDadosFormulario();

    if (dados.setores.length === 0) {
        alert("Preencha pelo menos um setor com funcionários e quantidades de exames.");
        return;
    }

    let texto = `📅 Data: ${dados.data}\n\n`;

    dados.setores.forEach(setor => {
        let totalSetor = 0;
        let bloco = `*Setor: ${setor.nome}*\n`;

        setor.funcionarios.forEach(f => {
            bloco += `- ${f.nome}: ${f.qtd} Exames\n`;
            totalSetor += f.qtd;
        });

        bloco += `*Total: ${totalSetor} Exames*\n\n`;
        texto += bloco;
    });

    if (dados.observacoes) {
        texto += `*📝 Observações:*\n*${dados.observacoes}*\n\n`;
    }

    document.getElementById("relatorio").innerText = texto.trim();
    document.getElementById("relatorio").style.display = "block";
    document.getElementById("acoesRelatorio").style.display = "flex";
}

/* ---------------- ENVIAR WHATSAPP ---------------- */
function enviarParaWhatsApp() {
    const relatorio = encodeURIComponent(document.getElementById("relatorio").innerText);
    const url = `https://wa.me/?text=${relatorio}`;
    window.open(url, "_blank");
}

/* ---------------- ENVIAR GOOGLE SHEETS ---------------- */
async function enviarParaGoogleSheets() {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === "SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI") {
        alert("Por favor, configure a URL do seu Google Apps Script no arquivo script.js!");
        return;
    }

    const dados = extrairDadosFormulario();
    const btnPlanilha = document.getElementById("btnEnviarPlanilha");

    try {
        btnPlanilha.disabled = true;
        btnPlanilha.innerText = "⏳ Enviando dados...";

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        alert("✅ Dados salvos na planilha com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("❌ Ocorreu um erro ao salvar na planilha. Tente novamente.");
    } finally {
        btnPlanilha.disabled = false;
        btnPlanilha.innerText = "📊 Salvar no Google Sheets";
    }
}
