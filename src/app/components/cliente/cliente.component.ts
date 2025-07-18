import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface TipoServico {
   id: number;
   nome: string;
   descricao: string;
   precoBase: number;
}

interface Endereco {
   id: number;
   rua: string;
   numero: string;
   complemento?: string;
   bairro: string;
   cidade: string;
   estado: string;
   cep: string;
}

interface Pedido {
   id?: number;
   idCliente: string;
   idServico: number;
   descricao: string;
   idEndereco: number;
   dataCriacao: string;
   status: string;
   valor?: number;
   // Campos para exibição
   nome_servico?: string;
   endereco_completo?: string;
}

interface NovoPedidoForm {
   idServico: number | null;
   descricao: string;
   idEndereco: number | null;
}

interface MensagemChat {
   id: string;
   texto: string;
   tipo: 'user' | 'support';
   timestamp: Date;
}

@Component({
   selector: 'app-cliente',
   standalone: true,
   imports: [CommonModule, FormsModule, RouterModule],
   templateUrl: './cliente.component.html',
   styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
   pedidos: any[] = [];
   tiposServico: TipoServico[] = [];
   enderecos: Endereco[] = [];
   loading = false;
   usuarioId: string | null = null;
   private apiUrl = 'https://frameworks-dev-web-i-1.onrender.com/api';

   // Propriedades do chat
   chatAberto = false;
   mensagensChat: MensagemChat[] = [];
   novaMensagem = '';
   enviandoMensagem = false;

   // Formulário para novo pedido
   novoPedidoForm: NovoPedidoForm = {
      idServico: null,
      descricao: '',
      idEndereco: null
   };

   constructor(private http: HttpClient, private authService: AuthService) { }

   async ngOnInit() {
      await this.carregarUsuario();

      // Só carrega os dados se o usuário foi carregado com sucesso
      if (this.usuarioId) {
         await this.carregarTiposServico();
         await this.carregarEnderecos();
         await this.carregarPedidos();
      }
   }

   async carregarUsuario() {
      try {
         // Obter o usuário logado do Supabase
         const user = await this.authService.getCurrentUser();

         if (!user || !user.email) {
            console.error('Usuário não está logado ou não tem e-mail');
            return;
         }

         console.log('E-mail do usuário logado:', user.email);

         // Fazer requisição para obter todos os usuários usando Promise
         const usuarios = await new Promise<any[]>((resolve, reject) => {
            this.http.get<any[]>(`${this.apiUrl}/usuarios`).subscribe({
               next: (data) => resolve(data),
               error: (error) => reject(error)
            });
         });

         // Encontrar o usuário com o mesmo e-mail
         const usuarioEncontrado = usuarios.find(u => u.email === user.email);

         if (usuarioEncontrado) {
            this.usuarioId = usuarioEncontrado.id.toString();
            console.log('ID do usuário na tabela usuarios:', this.usuarioId);
         } else {
            console.error('Usuário não encontrado na tabela usuarios');
            this.usuarioId = null;
         }
      } catch (error) {
         console.error('Erro ao carregar usuário:', error);
         this.usuarioId = null;
      }
   }

   async carregarTiposServico() {
      try {
         this.http.get<any[]>(`${this.apiUrl}/servicos`).subscribe({
            next: (data) => {
               this.tiposServico = data || [];
            },
            error: (error) => {
               console.error('Erro ao carregar tipos de serviço:', error);
               this.tiposServico = [];
            }
         });
      } catch (error) {
         console.error('Erro ao carregar tipos de serviço:', error);
         this.tiposServico = [];
      }
   }

   async carregarEnderecos() {
      if (!this.usuarioId) return;

      try {
         // Fazer requisição usando o ID da tabela usuarios
         this.http.get<any[]>(`${this.apiUrl}/enderecos/usuario/${this.usuarioId}`).subscribe({
            next: (data) => {
               this.enderecos = data || [];
               console.log('Endereços carregados:', this.enderecos);
            },
            error: (error) => {
               console.error('Erro ao carregar endereços:', error);
               this.enderecos = [];
            }
         });
      } catch (error) {
         console.error('Erro ao carregar endereços:', error);
         this.enderecos = [];
      }
   }

   async carregarPedidos() {
      if (!this.usuarioId) return;

      try {
         // Buscar todos os pedidos e filtrar pelo cliente
         this.http.get<any[]>(`${this.apiUrl}/pedidos`).subscribe({
            next: (todosPedidos) => {
               // Filtrar pedidos do usuário atual
               const pedidosDoUsuario = todosPedidos.filter(p => p.idCliente.toString() === this.usuarioId);

               if (pedidosDoUsuario.length === 0) {
                  this.pedidos = [];
                  console.log('Nenhum pedido encontrado para o usuário');
                  return;
               }

               // Mapear pedidos usando as informações já retornadas pela API
               this.pedidos = pedidosDoUsuario.map((pedido: any) => ({
                  ...pedido,
                  nome_servico: pedido.servico || 'Serviço não encontrado',
                  endereco_completo: pedido.endereco || 'Endereço não encontrado'
               }));

               console.log('Pedidos carregados:', this.pedidos);
            },
            error: (error) => {
               console.error('Erro ao carregar pedidos:', error);
               this.pedidos = [];
            }
         });
      } catch (error) {
         console.error('Erro ao carregar pedidos:', error);
         this.pedidos = [];
      }
   }

   async recarregarEnderecos() {
      await this.carregarEnderecos();
   }

   async novoPedido() {
      if (!this.usuarioId || !this.novoPedidoForm.idServico || !this.novoPedidoForm.idEndereco || !this.novoPedidoForm.descricao.trim()) {
         alert('Por favor, preencha todos os campos obrigatórios.');
         return;
      }

      this.loading = true;

      try {
         const novoPedido = {
            idCliente: this.usuarioId,
            idServico: this.novoPedidoForm.idServico,
            descricao: this.novoPedidoForm.descricao.trim(),
            idEndereco: this.novoPedidoForm.idEndereco,
            dataCriacao: new Date().toISOString(),
            status: 'pendente'
         };

         this.http.post<any>(`${this.apiUrl}/pedidos`, novoPedido).subscribe({
            next: (data) => {
               // Limpar formulário
               this.novoPedidoForm = {
                  idServico: null,
                  descricao: '',
                  idEndereco: null
               };

               // Recarregar pedidos
               this.carregarPedidos();
               alert('Pedido criado com sucesso!');
            },
            error: (error) => {
               console.error('Erro ao criar pedido:', error);
               alert('Erro ao criar pedido. Tente novamente.');
            },
            complete: () => {
               this.loading = false;
            }
         });
      } catch (error: any) {
         console.error('Erro ao criar pedido:', error);
         alert('Erro ao criar pedido. Tente novamente.');
      } finally {
         this.loading = false;
      }
   }

   formatarData(data: string): string {
      return new Date(data).toLocaleDateString('pt-BR');
   }

   getEnderecoCompleto(enderecoId: number): string {
      const endereco = this.enderecos.find(e => e.id === enderecoId);
      if (!endereco) return '';

      return `${endereco.rua}, ${endereco.numero}${endereco.complemento ? ' - ' + endereco.complemento : ''} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
   }

   // Métodos do Chat
   toggleChat(): void {
      this.chatAberto = !this.chatAberto;

      // Se abriu o chat e não tem mensagens, adicionar mensagem de boas-vindas
      if (this.chatAberto && this.mensagensChat.length === 0) {
         setTimeout(() => {
            this.adicionarMensagemSupporte('Olá! Como posso ajudá-lo hoje? 😊');
         }, 500);
      }
   }

   enviarMensagem(): void {
      if (!this.novaMensagem.trim() || this.enviandoMensagem) return;

      const textoMensagem = this.novaMensagem.trim();

      // Adicionar mensagem do usuário
      this.adicionarMensagemUsuario(textoMensagem);

      // Limpar input
      this.novaMensagem = '';

      // Simular resposta do suporte
      this.simularRespostaSupporte(textoMensagem);
   }

   private adicionarMensagemUsuario(texto: string): void {
      const mensagem: MensagemChat = {
         id: this.gerarIdMensagem(),
         texto: texto,
         tipo: 'user',
         timestamp: new Date()
      };
      this.mensagensChat.push(mensagem);
      this.scrollParaUltimaMensagem();
   }

   private adicionarMensagemSupporte(texto: string): void {
      const mensagem: MensagemChat = {
         id: this.gerarIdMensagem(),
         texto: texto,
         tipo: 'support',
         timestamp: new Date()
      };
      this.mensagensChat.push(mensagem);
      this.scrollParaUltimaMensagem();
   }

   private simularRespostaSupporte(mensagemUsuario: string): void {
      this.enviandoMensagem = true;

      setTimeout(() => {
         let resposta = this.gerarRespostaAutomatica(mensagemUsuario);
         this.adicionarMensagemSupporte(resposta);
         this.enviandoMensagem = false;
      }, 1000 + Math.random() * 2000); // Simular delay de 1-3 segundos
   }

   private gerarRespostaAutomatica(mensagem: string): string {
      const mensagemLower = mensagem.toLowerCase();

      if (mensagemLower.includes('pedido') || mensagemLower.includes('solicitação')) {
         return 'Posso ajudá-lo com questões sobre pedidos! Você pode acompanhar o status dos seus pedidos na tabela acima. Há algo específico que gostaria de saber?';
      }

      if (mensagemLower.includes('endereço') || mensagemLower.includes('endereco')) {
         return 'Para cadastrar ou editar endereços, você pode acessar a seção "Minha Conta" clicando no link acima. Lá você poderá gerenciar todos os seus endereços.';
      }

      if (mensagemLower.includes('serviço') || mensagemLower.includes('servico')) {
         return 'Oferecemos diversos tipos de serviços! Você pode ver todos disponíveis no formulário de criação de pedidos. Qual tipo de serviço você está interessado?';
      }

      if (mensagemLower.includes('valor') || mensagemLower.includes('preço') || mensagemLower.includes('preco')) {
         return 'Os valores são definidos após a análise de cada pedido. Um de nossos atendentes entrará em contato para passar o orçamento detalhado.';
      }

      if (mensagemLower.includes('olá') || mensagemLower.includes('oi') || mensagemLower.includes('bom dia') || mensagemLower.includes('boa tarde')) {
         return 'Olá! Fico feliz em poder ajudá-lo. Estou aqui para esclarecer dúvidas sobre nossos serviços, pedidos e muito mais!';
      }

      if (mensagemLower.includes('obrigado') || mensagemLower.includes('valeu') || mensagemLower.includes('thanks')) {
         return 'Por nada! Estou sempre aqui para ajudar. Se tiver mais alguma dúvida, não hesite em perguntar! 😊';
      }

      // Resposta padrão
      return 'Entendi sua mensagem! Para questões mais específicas, recomendo entrar em contato com nosso suporte especializado. Posso ajudá-lo com informações sobre pedidos, serviços e conta.';
   }

   private gerarIdMensagem(): string {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
   }

   private scrollParaUltimaMensagem(): void {
      setTimeout(() => {
         const chatMessages = document.querySelector('.chat-messages');
         if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
         }
      }, 100);
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
