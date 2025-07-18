import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MensagemChat {
  id: string;
  texto: string;
  tipo: 'user' | 'support';
  timestamp: Date;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  usuarios: any[] = [];
  editandoId: number | null = null;
  pedidoEdit: any = {};
  private apiUrl = 'https://frameworks-dev-web-i-1.onrender.com/api';

  // Propriedades do chat
  chatAberto = false;
  mensagensChat: MensagemChat[] = [];
  novaMensagem = '';
  enviandoMensagem = false;

  // Propriedades do chat específico por pedido
  pedidoChatAberto: number | null = null;
  mensagensChatPedido: MensagemChat[] = [];
  novaMensagemPedido = '';
  enviandoMensagemPedido = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.buscarPedidos();
    this.buscarUsuarios();
  }

  buscarPedidos() {
    this.http.get<any[]>(`${this.apiUrl}/pedidos`).subscribe({
      next: (data) => {
        this.pedidos = data.map(pedido => ({
          ...pedido,
          nomeCliente: pedido.cliente || 'Não informado',
          nomeAtendente: pedido.atendente || 'Não atribuído',
          nomeServico: pedido.servico || 'Não informado',
          enderecoCompleto: pedido.endereco || 'Não informado',
          dataFormatada: pedido.dataCriacao ? new Date(pedido.dataCriacao).toLocaleDateString('pt-BR') : '-'
        }));
      },
      error: (error) => {
        console.error('Erro ao buscar pedidos:', error);
        this.pedidos = [];
      }
    });
  }

  buscarUsuarios() {
    this.http.get<any[]>(`${this.apiUrl}/usuarios`).subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error('Erro ao buscar usuários:', error);
        this.usuarios = [];
      }
    });
  }

  getNomeUsuario(id: number): string {
    const usuario = this.usuarios.find(u => u.id === id);
    return usuario ? usuario.nome : 'Não informado';
  }

  editarPedido(pedido: any) {
    this.editandoId = pedido.id;
    this.pedidoEdit = { ...pedido };
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.pedidoEdit = {};
  }

  salvarEdicao() {
    if (this.editandoId) {
      // Preparar dados para envio (remover campos calculados)
      const dadosParaEnvio = {
        idCliente: this.pedidoEdit.idCliente,
        idAtendente: this.pedidoEdit.idAtendente,
        idServico: this.pedidoEdit.idServico,
        descricao: this.pedidoEdit.descricao,
        idEndereco: this.pedidoEdit.idEndereco,
        status: this.pedidoEdit.status,
        dataConclusao: this.pedidoEdit.status === 'concluído' ? new Date().toISOString() : null
      };

      this.http.put(`${this.apiUrl}/pedidos/${this.editandoId}`, dadosParaEnvio).subscribe({
        next: () => {
          this.buscarPedidos();
          this.cancelarEdicao();
        },
        error: (error) => {
          console.error('Erro ao atualizar pedido:', error);
        }
      });
    }
  }

  deletarPedido(id: number) {
    if (confirm('Tem certeza que deseja deletar este pedido?')) {
      this.http.delete(`${this.apiUrl}/pedidos/${id}`).subscribe({
        next: () => {
          this.pedidos = this.pedidos.filter(p => p.id !== id);
        },
        error: (error) => {
          console.error('Erro ao deletar pedido:', error);
        }
      });
    }
  }

  atribuirAtendente(pedidoId: number, atendenteId: number) {
    const dadosParaEnvio = {
      idAtendente: atendenteId,
      status: 'em_andamento'
    };

    this.http.put(`${this.apiUrl}/pedidos/${pedidoId}`, dadosParaEnvio).subscribe({
      next: () => {
        this.buscarPedidos();
      },
      error: (error) => {
        console.error('Erro ao atribuir atendente:', error);
      }
    });
  }

  concluirPedido(pedidoId: number) {
    const dadosParaEnvio = {
      status: 'concluído',
      dataConclusao: new Date().toISOString()
    };

    this.http.put(`${this.apiUrl}/pedidos/${pedidoId}`, dadosParaEnvio).subscribe({
      next: () => {
        this.buscarPedidos();
      },
      error: (error) => {
        console.error('Erro ao concluir pedido:', error);
      }
    });
  }

  atualizarStatus(pedidoId: number, novoStatus: string) {
    const dadosParaEnvio = {
      status: novoStatus
    };

    this.http.put(`${this.apiUrl}/pedidos/${pedidoId}`, dadosParaEnvio).subscribe({
      next: () => {
        console.log(`Status do pedido ${pedidoId} atualizado para: ${novoStatus}`);
      },
      error: (error) => {
        console.error('Erro ao atualizar status do pedido:', error);
        // Reverter o status em caso de erro
        this.buscarPedidos();
      }
    });
  }

  getAtendentesDisponiveis() {
    return this.usuarios.filter(u => u.tipo === 'atendente' || u.tipo === 'admin');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pendente': return 'status-pendente';
      case 'em_andamento': return 'status-andamento';
      case 'concluído': return 'status-concluido';
      default: return 'status-default';
    }
  }

  // Métodos do Chat específico por pedido
  toggleChatPedido(pedidoId: number): void {
    if (this.pedidoChatAberto === pedidoId) {
      this.fecharChatPedido();
    } else {
      this.pedidoChatAberto = pedidoId;
      this.mensagensChatPedido = [];

      // Adicionar mensagem de boas-vindas específica do pedido
      setTimeout(() => {
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        const welcomeMsg = `Olá! Este é o chat do Pedido #${pedidoId}. ${pedido ? `Cliente: ${pedido.nomeCliente}, Serviço: ${pedido.nomeServico}.` : ''} Como posso ajudá-lo? 😊`;
        this.adicionarMensagemSuportePedido(welcomeMsg);
      }, 300);
    }
  }

  fecharChatPedido(): void {
    this.pedidoChatAberto = null;
    this.mensagensChatPedido = [];
    this.novaMensagemPedido = '';
    this.enviandoMensagemPedido = false;
  }

  enviarMensagemPedido(): void {
    if (!this.novaMensagemPedido.trim() || this.enviandoMensagemPedido || this.pedidoChatAberto === null) return;

    const textoMensagem = this.novaMensagemPedido.trim();

    // Adicionar mensagem do usuário
    this.adicionarMensagemUsuarioPedido(textoMensagem);

    // Limpar input
    this.novaMensagemPedido = '';

    // Simular resposta do suporte específica do pedido
    this.simularRespostaSuportePedidoEspecifico(textoMensagem);
  }

  private adicionarMensagemUsuarioPedido(texto: string): void {
    const mensagem: MensagemChat = {
      id: this.gerarIdMensagem(),
      texto: texto,
      tipo: 'user',
      timestamp: new Date()
    };
    this.mensagensChatPedido.push(mensagem);
    this.scrollParaUltimaMensagemPedido();
  }

  private adicionarMensagemSuportePedido(texto: string): void {
    const mensagem: MensagemChat = {
      id: this.gerarIdMensagem(),
      texto: texto,
      tipo: 'support',
      timestamp: new Date()
    };
    this.mensagensChatPedido.push(mensagem);
    this.scrollParaUltimaMensagemPedido();
  }

  private simularRespostaSuportePedidoEspecifico(mensagemUsuario: string): void {
    this.enviandoMensagemPedido = true;

    setTimeout(() => {
      let resposta = this.gerarRespostaAutomaticaPedidoEspecifico(mensagemUsuario);
      this.adicionarMensagemSuportePedido(resposta);
      this.enviandoMensagemPedido = false;
    }, 1000 + Math.random() * 2000);
  }

  private gerarRespostaAutomaticaPedidoEspecifico(mensagem: string): string {
    const mensagemLower = mensagem.toLowerCase();
    const pedidoAtual = this.pedidos.find(p => p.id === this.pedidoChatAberto);

    if (mensagemLower.includes('status')) {
      return `O status atual deste pedido é: "${pedidoAtual?.status || 'N/A'}". Você pode alterá-lo diretamente na tabela se necessário.`;
    }

    if (mensagemLower.includes('cliente')) {
      return `Este pedido pertence ao cliente: ${pedidoAtual?.nomeCliente || 'N/A'}. ID do cliente: ${pedidoAtual?.idCliente || 'N/A'}.`;
    }

    if (mensagemLower.includes('serviço') || mensagemLower.includes('servico')) {
      return `O serviço solicitado é: ${pedidoAtual?.nomeServico || 'N/A'}. Descrição: "${pedidoAtual?.descricao || 'N/A'}"`;
    }

    if (mensagemLower.includes('endereço') || mensagemLower.includes('endereco') || mensagemLower.includes('local')) {
      return `Endereço do serviço: ${pedidoAtual?.enderecoCompleto || 'N/A'}`;
    }

    if (mensagemLower.includes('data') || mensagemLower.includes('quando')) {
      return `Este pedido foi criado em: ${pedidoAtual?.dataFormatada || 'N/A'}`;
    }

    if (mensagemLower.includes('alterar') || mensagemLower.includes('mudar') || mensagemLower.includes('editar')) {
      return `Para alterar informações deste pedido, você pode modificar o status diretamente na tabela. Para outras alterações, entre em contato com o cliente ou o sistema administrativo.`;
    }

    if (mensagemLower.includes('olá') || mensagemLower.includes('oi')) {
      return `Olá! Estou aqui para ajudar com questões específicas sobre o Pedido #${this.pedidoChatAberto}. O que gostaria de saber?`;
    }

    if (mensagemLower.includes('obrigado') || mensagemLower.includes('valeu')) {
      return `De nada! Se precisar de mais informações sobre este pedido ou outros, estarei aqui para ajudar! 😊`;
    }

    // Resposta padrão específica do pedido
    return `Informações sobre o Pedido #${this.pedidoChatAberto}: Cliente ${pedidoAtual?.nomeCliente || 'N/A'}, Status: ${pedidoAtual?.status || 'N/A'}. Como posso ajudar especificamente com este pedido?`;
  }

  private scrollParaUltimaMensagemPedido(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  // Métodos auxiliares do chat
  private gerarIdMensagem(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  trackByMensagem(index: number, mensagem: MensagemChat): string {
    return mensagem.id;
  }

  formatarHora(timestamp: Date): string {
    return timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
