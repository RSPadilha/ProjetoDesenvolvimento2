import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment as env } from '../../../environment/environment';
import { supabase } from '../../services/supabase'; // Importando o cliente Supabase
import { ServicosService, Servico } from '../../services/servicos.service';

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

  // Propriedades para upload de imagem
  selectedFile: File | null = null;
  uploadingImage = false;
  imagePreview: string | null = null;

  private apiUrl = `${env.apiUrl}`;
  // private apiUrl = 'https://frameworks-dev-web-i-1.onrender.com/api';

  constructor(
    private http: HttpClient,
    private servicosService: ServicosService
  ) { }

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
  async buscarServicos() {
    try {
      this.servicos = await this.servicosService.getServicos();
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      this.servicos = [];
    }
  }

  editarServico(servico: any) {
    this.editandoServicoId = servico.id;
    this.criandoNovoServico = false;
    this.servicoEdit = { ...servico };
    this.selectedFile = null;
    this.imagePreview = servico.image_url || null;
  }

  novoServico() {
    this.criandoNovoServico = true;
    this.editandoServicoId = null;
    this.servicoEdit = {
      nome: '',
      descricao: '',
      precoBase: 0,
      image_url: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  cancelarEdicaoServico() {
    this.editandoServicoId = null;
    this.criandoNovoServico = false;
    this.servicoEdit = {};
    this.selectedFile = null;
    this.imagePreview = null;
  }

  async salvarEdicaoServico() {
    if (!this.criandoNovoServico && this.editandoServicoId) {
      try {
        this.uploadingImage = true;
        console.log('Iniciando edição do serviço:', {
          id: this.editandoServicoId,
          servicoEdit: this.servicoEdit,
          hasFile: !!this.selectedFile
        });

        // Se há uma nova imagem selecionada, fazer upload
        if (this.selectedFile) {
          console.log('Fazendo upload da nova imagem...');
          const imageUrl = await this.servicosService.uploadImagem(this.selectedFile, this.editandoServicoId);
          if (imageUrl) {
            console.log('Upload realizado com sucesso:', imageUrl);
            this.servicoEdit.image_url = imageUrl;
          } else {
            console.error('Falha no upload da imagem');
          }
        }

        // Preparar dados para atualização (remover campos undefined/null)
        const dadosParaAtualizar: any = {
          nome: this.servicoEdit.nome,
          descricao: this.servicoEdit.descricao,
          precoBase: Number(this.servicoEdit.precoBase)
        };

        // Só incluir imagem se houver uma
        if (this.servicoEdit.image_url) {
          dadosParaAtualizar.image_url = this.servicoEdit.image_url;
        }

        console.log('Dados preparados para atualização:', dadosParaAtualizar);

        // Atualizar serviço
        const servicoAtualizado = await this.servicosService.atualizarServico(this.editandoServicoId, dadosParaAtualizar);

        if (servicoAtualizado) {
          console.log('Serviço atualizado com sucesso!');
          await this.buscarServicos();
          this.cancelarEdicaoServico();
        } else {
          console.error('Falha na atualização do serviço');
        }
      } catch (error) {
        console.error('Erro ao atualizar serviço no componente:', error);
      } finally {
        this.uploadingImage = false;
      }
    }
  }

  async salvarNovoServico(form: any) {
    if (form.valid) {
      try {
        this.uploadingImage = true;

        // Primeiro criar o serviço sem imagem
        const novoServico = await this.servicosService.criarServico({
          nome: this.servicoEdit.nome,
          descricao: this.servicoEdit.descricao,
          precoBase: this.servicoEdit.precoBase
        });

        if (novoServico && this.selectedFile) {
          // Se o serviço foi criado e há uma imagem, fazer upload
          const imageUrl = await this.servicosService.uploadImagem(this.selectedFile, novoServico.id);
          if (imageUrl) {
            // Atualizar o serviço com a URL da imagem
            await this.servicosService.atualizarServico(novoServico.id!, { image_url: imageUrl });
          }
        }

        await this.buscarServicos();
        this.cancelarEdicaoServico();
      } catch (error) {
        console.error('Erro ao criar serviço:', error);
      } finally {
        this.uploadingImage = false;
      }
    } else {
      // Marca todos os campos como tocados para exibir os erros
      Object.values(form.controls).forEach((control: any) => control.markAsTouched());
    }
  }

  async deletarServico(id: number) {
    if (confirm('Tem certeza que deseja deletar este serviço?')) {
      try {
        // Buscar o serviço para obter a URL da imagem antes de deletar
        const servico = this.servicos.find(s => s.id === id);

        // Se há uma imagem, remover do storage primeiro
        if (servico && servico.image_url) {
          await this.servicosService.removerImagem(servico.image_url);
        }

        // Deletar o serviço do banco usando Supabase
        const { error } = await supabase
          .from('servicos')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao deletar serviço:', error);
          alert('Erro ao deletar serviço. Tente novamente.');
          return;
        }

        // Remover da lista local
        this.servicos = this.servicos.filter(s => s.id !== id);
        console.log('Serviço deletado com sucesso!');

      } catch (error) {
        console.error('Erro inesperado ao deletar serviço:', error);
        alert('Erro inesperado ao deletar serviço. Tente novamente.');
      }
    }
  }

  // Métodos para upload de imagem
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor, selecione apenas arquivos de imagem (JPEG, PNG, GIF, WebP).');
        return;
      }

      // Validar tamanho do arquivo (máx 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('O arquivo é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
      }

      this.selectedFile = file;

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.servicoEdit.image_url = '';
  }

  // Getter para verificar se há preview de imagem
  get hasImagePreview(): boolean {
    return !!(this.imagePreview || this.servicoEdit.image_url);
  }

  // Getter para URL da imagem atual
  get currentImageUrl(): string {
    return this.imagePreview || this.servicoEdit.image_url || '';
  }
}