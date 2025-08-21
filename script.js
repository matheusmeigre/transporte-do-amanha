// Dados do Jogo - Transcrição de data.py
let missoesDisponiveis = [
    {
        id: 1,
        destino: 'Montadora B',
        produto: 'Parafusos',
        quantidade: 50,
        prazoDias: 3,
        recompensa: 1500,
        co2Economizado: 500
    },
    {
        id: 2,
        destino: 'Centro de Distribuicao C',
        produto: 'Peças de motor',
        quantidade: 80,
        prazoDias: 5,
        recompensa: 2200,
        co2Economizado: 850
    },
    {
        id: 3,
        destino: 'Parceiro D',
        produto: 'Componentes Eletrônicos',
        quantidade: 120,
        prazoDias: 7,
        recompensa: 3500,
        co2Economizado: 1200
    },
    {
        id: 4,
        destino: 'Fábrica E',
        produto: 'Baterias de Lítio',
        quantidade: 40,
        prazoDias: 2, // Desafio de Prazo Curto
        recompensa: 2800,
        co2Economizado: 700
    },
    {
        id: 5,
        destino: 'Porto Marítimo F',
        produto: 'Módulos de Cabine',
        quantidade: 180, // Desafio de Grande Volume
        prazoDias: 6,
        recompensa: 5000,
        co2Economizado: 2000
    },
    {
        id: 6,
        destino: 'Armazém G',
        produto: 'Cabos e Fios',
        quantidade: 65,
        prazoDias: 4,
        recompensa: 1900,
        co2Economizado: 650
    },
    {
        id: 7,
        destino: 'Distrito Industrial H',
        produto: 'Painéis Solares',
        quantidade: 95,
        prazoDias: 5,
        recompensa: 3200,
        co2Economizado: 1100
    }
];

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
        id: 3, // Novo Caminhão
        capacidadeMaxima: 200,
        disponivel: true,
        localizacaoAtual: 'Fabrica A'
    }
];

let pontuacao = 0;
let missoesEmAndamento = [];
let estadoDoJogo = 'menu-principal';
let mensagemDoJogo = '';
let missaoAAceitar = null;

// Referências aos elementos HTML
const uiOverlay = document.getElementById('ui-overlay');
const telas = {
    'menu-principal': document.getElementById('menu-principal'),
    'tela-status': document.getElementById('tela-status'),
    'tela-missoes': document.getElementById('tela-missoes'),
    'tela-caminhao': document.getElementById('tela-caminhao')
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
    }
}

function renderizarStatus() {
    document.getElementById('pontuacao-info').innerText = `Pontuação: R$${pontuacao}`;
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
                <p><strong>Missão #${missao.id}:</strong></p>
                <p><strong>Destino:</strong> ${missao.destino}</p>
                <p><strong>Carga:</strong> ${missao.quantidade} caixas de ${missao.produto}</p>
                <p><strong>Recompensa:</strong> R$${missao.recompensa}</p>
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

function concluirMissoes() {
    if (missoesEmAndamento.length === 0) {
        exibirMensagem('Nenhuma missão em andamento.', true);
        return;
    }
    
    missoesEmAndamento.forEach(m => {
        pontuacao += m.missao.recompensa;
        m.caminhao.disponivel = true;
    });
    
    missoesEmAndamento = [];
    exibirMensagem('Todas as missões em andamento foram concluídas!', false);
    setEstado('menu-principal');
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
document.getElementById('btn-concluir').addEventListener('click', concluirMissoes);
document.getElementById('btn-sair').addEventListener('click', () => {
    alert(`Obrigado por jogar! Sua pontuação final é: R$${pontuacao}`);
    window.close();
});

document.getElementById('btn-voltar-status').addEventListener('click', () => setEstado('menu-principal'));
document.getElementById('btn-voltar-missoes').addEventListener('click', () => setEstado('menu-principal'));
document.getElementById('btn-voltar-caminhao').addEventListener('click', () => setEstado('tela-missoes'));

// Inicializar o jogo
setEstado('menu-principal');