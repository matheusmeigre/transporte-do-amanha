import pygame
import sys

# --- Configurações Iniciais do Pygame ---
pygame.init()

# Cores
PRETO = (0, 0, 0)
BRANCO = (255, 255, 255)
CINZA = (200, 200, 200)
VERDE = (0, 150, 0)
VERDE_CLARO = (0, 200, 0)
VERMELHO = (200, 0, 0)
VERMELHO_CLARO = (255, 50, 50)
AZUL = (50, 50, 255)

# Configurações da janela
LARGURA, ALTURA = 1280, 768
TELA = pygame.display.set_mode((LARGURA, ALTURA))
pygame.display.set_caption("Simulador de Logística da IVECO")

# Fontes
FONTE_GRANDE = pygame.font.Font(None, 48)
FONTE_MEDIA = pygame.font.Font(None, 36)
FONTE_PEQUENA = pygame.font.Font(None, 24)

# --- Dados do Jogo ---
missoes_disponiveis = [
    {
        'id': 1,
        'destino': 'Montadora B',
        'produto': 'Parafusos',
        'quantidade': 50,
        'prazo_dias': 3,
        'recompensa': 1500,
        'co2_economizado': 500
    },
    {
        'id': 2,
        'destino': 'Centro de Distribuicao C',
        'produto': 'Peças de motor',
        'quantidade': 80,
        'prazo_dias': 5,
        'recompensa': 2200,
        'co2_economizado': 850
    }
]

caminhoes = [
    {
        'id': 1,
        'capacidade_maxima': 100,
        'disponivel': True,
        'localizacao_atual': 'Fabrica A'
    },
    {
        'id': 2,
        'capacidade_maxima': 150,
        'disponivel': True,
        'localizacao_atual': 'Fabrica A'
    }
]

# Variáveis do Jogo
pontuacao = 0
missoes_em_andamento = []
estado_do_jogo = "menu_principal"
mensagem_do_jogo = ""

# --- Funções de Renderização e Lógica da GUI ---

def desenhar_texto(texto, fonte, cor, x, y):
    """Função auxiliar para desenhar texto na tela."""
    superficie_texto = fonte.render(texto, True, cor)
    TELA.blit(superficie_texto, (x, y))

def criar_botao(texto, x, y, largura, altura, cor_inativa, cor_ativa, acao=None):
    """Desenha um botão na tela e verifica se foi clicado."""
    global estado_do_jogo, mensagem_do_jogo
    mouse = pygame.mouse.get_pos()
    clique = pygame.mouse.get_pressed()

    retangulo = pygame.Rect(x, y, largura, altura)
    
    # Altera a cor do botão ao passar o mouse
    if retangulo.collidepoint(mouse):
        pygame.draw.rect(TELA, cor_ativa, retangulo)
        if clique[0] == 1 and acao:
            pygame.time.delay(200) # Evita múltiplos cliques rápidos
            acao()
    else:
        pygame.draw.rect(TELA, cor_inativa, retangulo)
    
    # Centraliza o texto no botão
    superficie_texto = FONTE_PEQUENA.render(texto, True, BRANCO)
    retangulo_texto = superficie_texto.get_rect(center=(x + largura/2, y + altura/2))
    TELA.blit(superficie_texto, retangulo_texto)

# --- Funções das Telas do Jogo ---

def tela_menu_principal():
    """Tela principal com as opções do jogo."""
    global estado_do_jogo, mensagem_do_jogo
    
    TELA.fill(BRANCO)
    
    desenhar_texto("Simulador de Logística da IVECO", FONTE_GRANDE, PRETO, 100, 50)
    desenhar_texto("Gerencie sua frota para entregar mercadorias e reduzir o CO2.", FONTE_PEQUENA, PRETO, 100, 100)

    # Botões do Menu
    criar_botao("Ver Status", 350, 200, 200, 50, VERDE, VERDE_CLARO, lambda: set_estado("ver_status"))
    criar_botao("Ver e Aceitar Missões", 350, 280, 200, 50, AZUL, (50, 50, 200), lambda: set_estado("ver_missoes"))
    criar_botao("Concluir Missões", 350, 360, 200, 50, VERDE, VERDE_CLARO, concluir_missoes)
    criar_botao("Sair do Jogo", 350, 440, 200, 50, VERMELHO, VERMELHO_CLARO, lambda: pygame.quit() or sys.exit())

    if mensagem_do_jogo:
        desenhar_texto(mensagem_do_jogo, FONTE_PEQUENA, AZUL, 50, 600)

def tela_ver_status():
    """Mostra a pontuação e o status dos caminhões."""
    global estado_do_jogo
    
    TELA.fill(BRANCO)
    desenhar_texto("Status do Jogo", FONTE_GRANDE, PRETO, 50, 50)
    desenhar_texto(f"Pontuação: R${pontuacao}", FONTE_MEDIA, VERDE, 50, 120)

    # Exibe status dos caminhões
    desenhar_texto("Caminhões:", FONTE_MEDIA, PRETO, 50, 200)
    y_pos = 250
    for caminhao in caminhoes:
        status = "Disponível" if caminhao['disponivel'] else "Em missão"
        cor_status = VERDE if caminhao['disponivel'] else VERMELHO
        desenhar_texto(f"ID: {caminhao['id']} | Capacidade: {caminhao['capacidade_maxima']} caixas | Status: {status}",
                       FONTE_PEQUENA, cor_status, 50, y_pos)
        y_pos += 40

    criar_botao("Voltar", 350, 600, 200, 50, CINZA, VERDE_CLARO, lambda: set_estado("menu_principal"))

def tela_ver_missoes():
    """Mostra as missões disponíveis para serem aceitas."""
    global estado_do_jogo
    
    TELA.fill(BRANCO)
    desenhar_texto("Missões Disponíveis", FONTE_GRANDE, PRETO, 50, 50)
    
    if not missoes_disponiveis:
        desenhar_texto("Nenhuma missão disponível no momento.", FONTE_PEQUENA, VERMELHO, 50, 150)
    else:
        y_pos = 120
        for missao in missoes_disponiveis:
            info_missao = f"ID: {missao['id']} | Destino: {missao['destino']} | Quantidade: {missao['quantidade']} caixas | Recompensa: R${missao['recompensa']}"
            desenhar_texto(info_missao, FONTE_PEQUENA, PRETO, 50, y_pos)
            
            # Botão para aceitar a missão
            criar_botao(f"Aceitar Missão {missao['id']}", 650, y_pos - 10, 200, 30, AZUL, (50, 50, 200),
                        lambda m=missao: set_estado("escolher_caminhao", missao_id=m['id']))
            y_pos += 50
    
    criar_botao("Voltar", 350, 600, 200, 50, CINZA, VERDE_CLARO, lambda: set_estado("menu_principal"))

def tela_escolher_caminhao():
    """Tela para selecionar um caminhão para uma missão específica."""
    global estado_do_jogo, missao_a_aceitar
    
    TELA.fill(BRANCO)
    desenhar_texto("Escolher Caminhão", FONTE_GRANDE, PRETO, 50, 50)
    desenhar_texto(f"Missão: {missao_a_aceitar['produto']} para {missao_a_aceitar['destino']}", FONTE_MEDIA, PRETO, 50, 120)
    
    y_pos = 180
    for caminhao in caminhoes:
        if caminhao['disponivel'] and caminhao['capacidade_maxima'] >= missao_a_aceitar['quantidade']:
            info_caminhao = f"ID: {caminhao['id']} | Capacidade: {caminhao['capacidade_maxima']} caixas"
            desenhar_texto(info_caminhao, FONTE_PEQUENA, VERDE, 50, y_pos)
            
            criar_botao(f"Selecionar Caminhão {caminhao['id']}", 650, y_pos - 10, 200, 30, VERDE, VERDE_CLARO,
                        lambda c=caminhao: aceitar_missao(missao_a_aceitar, c))
            y_pos += 40
    
    criar_botao("Voltar", 350, 600, 200, 50, CINZA, VERDE_CLARO, lambda: set_estado("ver_missoes"))

# --- Funções de Lógica do Jogo (AGORA CHAMADAS PELOS BOTÕES) ---

def set_estado(novo_estado, **kwargs):
    """Altera o estado do jogo para a tela correta."""
    global estado_do_jogo, missao_a_aceitar
    estado_do_jogo = novo_estado
    if 'missao_id' in kwargs:
        missao_a_aceitar = next((m for m in missoes_disponiveis if m['id'] == kwargs['missao_id']), None)

def aceitar_missao(missao_escolhida, caminhao_escolhido):
    """Executa a lógica de aceitar a missão, agora chamada por um botão."""
    global missoes_em_andamento, missoes_disponiveis, estado_do_jogo, mensagem_do_jogo
    
    caminhao_escolhido['disponivel'] = False
    missoes_em_andamento.append({'missao': missao_escolhida, 'caminhao': caminhao_escolhido})
    missoes_disponiveis.remove(missao_escolhida)
    mensagem_do_jogo = f"Missão para {missao_escolhida['destino']} iniciada com sucesso!"
    estado_do_jogo = "menu_principal"

def concluir_missoes():
    """Simula a conclusão das missões em andamento."""
    global pontuacao, missoes_em_andamento, mensagem_do_jogo
    if not missoes_em_andamento:
        mensagem_do_jogo = "Nenhuma missão em andamento."
        return
        
    for missao_em_curso in list(missoes_em_andamento):
        missao = missao_em_curso['missao']
        caminhao = missao_em_curso['caminhao']
        
        pontuacao += missao['recompensa']
        caminhao['disponivel'] = True
        missoes_em_andamento.remove(missao_em_curso)
        
    mensagem_do_jogo = "Todas as missões em andamento foram concluídas com sucesso!"

# --- Loop Principal do Jogo ---

def main():
    """Função principal que gerencia o fluxo do jogo."""
    while True:
        # Gerenciamento de eventos
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        # Renderização da tela baseada no estado
        if estado_do_jogo == "menu_principal":
            tela_menu_principal()
        elif estado_do_jogo == "ver_status":
            tela_ver_status()
        elif estado_do_jogo == "ver_missoes":
            tela_ver_missoes()
        elif estado_do_jogo == "escolher_caminhao":
            tela_escolher_caminhao()

        pygame.display.flip()

if __name__ == "__main__":
    main()