// Dados do Jogo
const destinos = ['Montadora B', 'Centro de Distribuicao C', 'Parceiro D', 'Fábrica E', 'Porto Marítimo F', 'Armazém G', 'Distrito Industrial H'];
const produtos = ['Parafusos', 'Peças de motor', 'Componentes Eletrônicos', 'Baterias de Lítio', 'Módulos de Cabine', 'Cabos e Fios', 'Painéis Solares'];

let caminhoes = [
    {
        id: 1,
        capacidadeMaxima: 100,
        disponivel: true,
        localizacaoAtual: 'Fabrica A'
    },
    {
        id: 2,
        capacidadeMaxima: 150,
        disponivel: true,
        localizacaoAtual: 'Fabrica A'
    },
    {
        id: 3,
        capacidadeMaxima: 200,
        disponivel: true,
        localizacaoAtual: 'Fabrica A'
    }
];

let pontuacao = 0;
let co2Mitigado = 0;
let missoesEmAndamento = [];
let estadoDoJogo = 'menu-principal';
let mensagemDoJogo = '';
let missaoAAceitar = null;

// Função para gerar uma nova lista de missões
function gerarNovasMissoes() {
    const novasMissoes = [];
    for (let i = 0; i < 7; i++) {
        const destinoAleatorio = destinos[Math.floor(Math.random() * destinos.length)];
        const produtoAleatorio = produtos[Math.floor(Math.random() * produtos.length)];
        const quantidadeAleatoria = Math.floor(Math.random() * 150) + 30; // 30 a 180 caixas
        const recompensaAleatoria = Math.floor(Math.random() * 4000) + 1000; // R$1000 a R$5000
        const co2Aleatorio = Math.floor(Math.random() * 1500) + 500; // 500 a 2000 kg

        novasMissoes.push({
            id: i + 1,
            destino: destinoAleatorio,
            produto: produtoAleatorio,
            quantidade: quantidadeAleatoria,
            recompensa: recompensaAleatoria,
            co2Economizado: co2Aleatorio
        });
    }
    return novasMissoes;
}

let missoesDisponiveis = gerarNovasMissoes();

// Referências aos elementos HTML
const uiOverlay = document.getElementById('ui-overlay');
const telas = {
    'menu-principal': document.getElementById('menu-principal'),
    'tela-status': document.getElementById('tela-status'),
    'tela-missoes': document.getElementById('tela-missoes'),
    'tela-caminhao': document.getElementById('tela-caminhao'),
    'tela-rastreabilidade': document.getElementById('tela-rastreabilidade')
};

const mensagemElemento = document.getElementById('game-message');

// --- Funções de Lógica do Jogo ---

function setEstado(novoEstado, ...args) {
    estadoDoJogo = novoEstado;
    for (let tela in telas) {
        telas[tela].style.display = 'none';
    }
    telas[estadoDoJogo].style.display = 'flex';
    
    if (novoEstado === 'tela-status') {
        renderizarStatus();
    } else if (novoEstado === 'tela-missoes') {
        renderizarMissoes();
    } else if (novoEstado === 'tela-caminhao') {
        missaoAAceitar = missoesDisponiveis.find(m => m.id === args[0]);
        renderizarEscolherCaminhao();
    } else if (novoEstado === 'tela-rastreabilidade') {
        simularRastreabilidade();
    }
}

function renderizarStatus() {
    document.getElementById('pontuacao-info').innerHTML = `
        <p><strong>Pontuação:</strong> R$${pontuacao}</p>
        <p><strong>CO² Mitigado:</strong> ${co2Mitigado} kg</p>
    `;
    const container = document.getElementById('caminhoes-status-container');
    container.innerHTML = '';
    
    caminhoes.forEach(caminhao => {
        const item = document.createElement('div');
        item.className = 'caminhao-item';

        let statusText = '';
        let statusClass = '';

        if (caminhao.disponivel) {
            item.classList.add('disponivel');
            statusText = 'Disponível';
            statusClass = 'status-disponivel';
        } else {
            item.classList.add('em-missao');
            statusText = 'Em missão';
            statusClass = 'status-em-missao';
        }
        
        item.innerHTML = `<p class="info">ID: ${caminhao.id} | Capacidade: ${caminhao.capacidadeMaxima} caixas | Status: <span class="${statusClass}">${statusText}</span></p>`;
        container.appendChild(item);
    });
}

function renderizarMissoes() {
    const container = document.getElementById('missoes-list-container');
    container.innerHTML = '';

    if (missoesDisponiveis.length === 0) {
        container.innerHTML = '<p class="message error">Nenhuma missão disponível no momento.</p>';
        return;
    }

    missoesDisponiveis.forEach(missao => {
        const item = document.createElement('div');
        item.className = 'mission-item';
        
        item.innerHTML = `
            <div class="info">
                <p><strong>Destino:</strong> ${missao.destino}</p>
                <p><strong>Carga:</strong> ${missao.quantidade} caixas</p>
                <p><strong>Recompensa:</strong> R$${missao.recompensa}</p>
                <p><strong>CO² Evitado:</strong> ${missao.co2Economizado} kg</p>
            </div>
            <button class="btn-aceitar" data-id="${missao.id}">Aceitar</button>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.btn-aceitar').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            setEstado('tela-caminhao', id);
        });
    });
}

function renderizarEscolherCaminhao() {
    document.getElementById('caminhao-missao-info').innerText = `Missão: ${missaoAAceitar.produto} para ${missaoAAceitar.destino}`;
    const container = document.getElementById('caminhoes-select-container');
    container.innerHTML = '';

    caminhoes.forEach(caminhao => {
        if (caminhao.disponivel && caminhao.capacidadeMaxima >= missaoAAceitar.quantidade) {
            const item = document.createElement('div');
            item.className = 'caminhao-item disponivel';
            item.innerHTML = `
                <div class="info">
                    <p>ID: ${caminhao.id} | Capacidade: ${caminhao.capacidadeMaxima} caixas</p>
                </div>
                <button class="btn-selecionar" data-id="${caminhao.id}">Selecionar</button>
            `;
            container.appendChild(item);
        }
    });

    document.querySelectorAll('.btn-selecionar').forEach(button => {
        button.addEventListener('click', (e) => {
            const caminhaoId = parseInt(e.target.dataset.id);
            const caminhaoEscolhido = caminhoes.find(c => c.id === caminhaoId);
            aceitarMissao(missaoAAceitar, caminhaoEscolhido);
        });
    });
}

function aceitarMissao(missao, caminhao) {
    caminhao.disponivel = false;
    missoesEmAndamento.push({ missao, caminhao });
    missoesDisponiveis = missoesDisponiveis.filter(m => m.id !== missao.id);
    exibirMensagem(`Missão para ${missao.destino} iniciada com sucesso!`, false);
    setEstado('menu-principal');
}

function simularRastreabilidade() {
    const container = document.getElementById('rastreabilidade-container');
    const finalizarBtn = document.getElementById('btn-finalizar-rastreamento');
    finalizarBtn.style.display = 'none';

    if (missoesEmAndamento.length === 0) {
        container.innerHTML = '<p class="message error">Nenhuma missão em andamento para rastrear.</p>';
        finalizarBtn.style.display = 'block';
        return;
    }

    container.innerHTML = '';
    
    missoesEmAndamento.forEach(m => {
        const item = document.createElement('div');
        item.className = 'mission-item em-missao';
        item.innerHTML = `
            <div class="info">
                <p><strong>Caminhão ${m.caminhao.id}:</strong> ${m.missao.destino}</p>
                <p>Status: <span id="status-caminhao-${m.caminhao.id}">Em rota</span></p>
                <div class="progress-bar-container">
                    <div id="progress-${m.caminhao.id}" class="progress-bar-fill"></div>
                </div>
            </div>
        `;
        container.appendChild(item);

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            const progressBar = document.getElementById(`progress-${m.caminhao.id}`);
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            if (progress >= 100) {
                clearInterval(progressInterval);
                const statusSpan = document.getElementById(`status-caminhao-${m.caminhao.id}`);
                if (statusSpan) {
                    statusSpan.innerText = 'Concluído';
                }
            }
        }, 300);
    });

    setTimeout(() => {
        finalizarBtn.style.display = 'block';
    }, missoesEmAndamento.length * 300 + 1500);
}

function concluirMissaoRealmente() {
    if (missoesEmAndamento.length === 0) {
        return;
    }
    
    missoesEmAndamento.forEach(m => {
        pontuacao += m.missao.recompensa;
        co2Mitigado += m.missao.co2Economizado;
        m.caminhao.disponivel = true;
    });
    
    missoesEmAndamento = [];
    exibirMensagem('Todas as missões em andamento foram concluídas!', false);
    setEstado('tela-status');
}

function exibirMensagem(texto, isError) {
    mensagemElemento.innerText = texto;
    mensagemElemento.className = 'message ' + (isError ? 'error' : 'success');
    setTimeout(() => {
        mensagemElemento.innerText = '';
    }, 3000);
}

// --- Event Listeners para os botões ---
document.getElementById('btn-status').addEventListener('click', () => setEstado('tela-status'));
document.getElementById('btn-missoes').addEventListener('click', () => setEstado('tela-missoes'));
document.getElementById('btn-concluir').addEventListener('click', () => setEstado('tela-rastreabilidade'));
document.getElementById('btn-sair').addEventListener('click', () => {
    alert(`Obrigado por jogar! Sua pontuação final é: R$${pontuacao} e você mitigou ${co2Mitigado} kg de CO²!`);
    window.close();
});
document.getElementById('btn-atualizar-missoes').addEventListener('click', () => {
    missoesDisponiveis = gerarNovasMissoes();
    exibirMensagem('Missões atualizadas!', false);
    renderizarMissoes();
});
document.getElementById('btn-finalizar-rastreamento').addEventListener('click', concluirMissaoRealmente);

document.getElementById('btn-voltar-status').addEventListener('click', () => setEstado('menu-principal'));
document.getElementById('btn-voltar-missoes').addEventListener('click', () => setEstado('menu-principal'));
document.getElementById('btn-voltar-caminhao').addEventListener('click', () => setEstado('tela-missoes'));

// Inicializar o jogo
setEstado('menu-principal');