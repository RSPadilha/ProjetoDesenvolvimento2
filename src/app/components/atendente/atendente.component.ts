import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.prod';


@Component({
  selector: 'app-atendente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atendente.component.html',
  styleUrls: ['./atendente.component.css']
})
export class AtendenteComponent implements OnInit {
  clientes: any[] = [];
  editandoId: number | null = null;
  clienteEdit: any = {};
  criandoNovo: boolean = false;

  // Propriedades para gerenciamento de serviços
  servicos: any[] = [];
  editandoServicoId: number | null = null;
  servicoEdit: any = {};
  criandoNovoServico: boolean = false;

  // Controle de abas
  abaAtiva: 'clientes' | 'servicos' = 'clientes';

  private apiUrl = 'https://frameworks-dev-web-i-1.onrender.com/api';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.buscarClientes();
    this.buscarServicos();
  }

  buscarClientes() {
    this.http.get<any[]>(`${this.apiUrl}/usuarios`).subscribe({
      next: (usuarios) => {
        this.clientes = usuarios;
        // Buscar endereços para cada cliente
        this.carregarEnderecosDosClientes();
      },
      error: (error) => {
        console.error('Erro ao buscar usuários:', error);
        this.clientes = [];
      }
    });
  }

  carregarEnderecosDosClientes() {
    // Para cada cliente, buscar seus endereços
    this.clientes.forEach(cliente => {
      this.http.get<any[]>(`${this.apiUrl}/enderecos/usuario/${cliente.id}`).subscribe({
        next: (enderecos) => {
          // Adicionar endereços ao cliente
          cliente.enderecos = enderecos || [];

          // Se houver endereços, pegar o primeiro como principal
          if (enderecos && enderecos.length > 0) {
            const enderecoPrincipal = enderecos[0];
            cliente.endereco_completo = `${enderecoPrincipal.rua}, ${enderecoPrincipal.numero}`;
            if (enderecoPrincipal.complemento) {
              cliente.endereco_completo += ` - ${enderecoPrincipal.complemento}`;
            }
            cliente.endereco_completo += ` - ${enderecoPrincipal.bairro}, ${enderecoPrincipal.cidade}/${enderecoPrincipal.estado}`;
            cliente.cep = enderecoPrincipal.cep;
          } else {
            cliente.endereco_completo = 'Endereço não cadastrado';
            cliente.cep = '';
          }
        },
        error: (error) => {
          console.error(`Erro ao buscar endereços do cliente ${cliente.id}:`, error);
          cliente.enderecos = [];
          cliente.endereco_completo = 'Erro ao carregar endereço';
          cliente.cep = '';
        }
      });
    });
  }

  deletarCliente(id: number) {
    this.http.delete(`${this.apiUrl}/usuarios/${id}`).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(c => c.id !== id);
      },
      error: (error) => {
        console.error('Erro ao deletar usuário:', error);
      }
    });
  }


  editarCliente(cliente: any) {
    this.editandoId = cliente.id;
    this.criandoNovo = false;

    // Inicializar clienteEdit com dados do cliente
    this.clienteEdit = {
      ...cliente,
      endereco: cliente.enderecos && cliente.enderecos.length > 0 ? { ...cliente.enderecos[0] } : {}
    };
  }

  novoCliente() {
    this.criandoNovo = true;
    this.editandoId = null;
    this.clienteEdit = {
      nome: '',
      telefone: '',
      email: '',
      tipo: 'cliente',
      endereco: {
        cep: '',
        estado: '',
        cidade: '',
        rua: '',
        bairro: '',
        numero: '',
        complemento: ''
      }
    };
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.criandoNovo = false;
    this.clienteEdit = {};
  }

  salvarEdicao() {
    // Mantém para edição de cliente existente
    if (!this.criandoNovo) {
      this.http.put(`${this.apiUrl}/usuarios/${this.editandoId}`, this.clienteEdit).subscribe({
        next: () => {
          this.buscarClientes();
          this.cancelarEdicao();
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
        }
      });
    }
  }

  salvarNovoCliente(form: any) {
    if (form.valid) {
      this.http.post(`${this.apiUrl}/usuarios`, this.clienteEdit).subscribe({
        next: () => {
          this.buscarClientes();
          this.cancelarEdicao();
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
        }
      });
    } else {
      // Marca todos os campos como tocados para exibir os erros
      Object.values(form.controls).forEach((control: any) => control.markAsTouched());
    }
  }

  // Métodos para controle de abas
  mudarAba(aba: 'clientes' | 'servicos') {
    this.abaAtiva = aba;
    this.cancelarEdicao();
    this.cancelarEdicaoServico();
  }

  // Métodos para CRUD de serviços
  buscarServicos() {
    this.http.get<any[]>(`${this.apiUrl}/servicos`).subscribe({
      next: (data) => {
        this.servicos = data;
      },
      error: (error) => {
        console.error('Erro ao buscar serviços:', error);
        this.servicos = [];
      }
    });
  }

  editarServico(servico: any) {
    this.editandoServicoId = servico.id;
    this.criandoNovoServico = false;
    this.servicoEdit = { ...servico };
  }

  novoServico() {
    this.criandoNovoServico = true;
    this.editandoServicoId = null;
    this.servicoEdit = {
      nome: '',
      descricao: '',
      precoBase: 0
    };
  }

  cancelarEdicaoServico() {
    this.editandoServicoId = null;
    this.criandoNovoServico = false;
    this.servicoEdit = {};
  }

  salvarEdicaoServico() {
    if (!this.criandoNovoServico) {
      this.http.put(`${this.apiUrl}/servicos/${this.editandoServicoId}`, this.servicoEdit).subscribe({
        next: () => {
          this.buscarServicos();
          this.cancelarEdicaoServico();
        },
        error: (error) => {
          console.error('Erro ao atualizar serviço:', error);
        }
      });
    }
  }

  salvarNovoServico(form: any) {
    if (form.valid) {
      this.http.post(`${this.apiUrl}/servicos`, this.servicoEdit).subscribe({
        next: () => {
          this.buscarServicos();
          this.cancelarEdicaoServico();
        },
        error: (error) => {
          console.error('Erro ao criar serviço:', error);
        }
      });
    } else {
      // Marca todos os campos como tocados para exibir os erros
      Object.values(form.controls).forEach((control: any) => control.markAsTouched());
    }
  }

  deletarServico(id: number) {
    if (confirm('Tem certeza que deseja deletar este serviço?')) {
      this.http.delete(`${this.apiUrl}/servicos/${id}`).subscribe({
        next: () => {
          this.servicos = this.servicos.filter(s => s.id !== id);
        },
        error: (error) => {
          console.error('Erro ao deletar serviço:', error);
        }
      });
    }
  }
}
