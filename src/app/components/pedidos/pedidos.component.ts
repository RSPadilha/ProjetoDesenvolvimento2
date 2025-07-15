import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
}
