import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicosService, Servico } from '../../services/servicos.service';
import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';

@Component({
   selector: 'app-servico-detalhes',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './servico-detalhes.component.html',
   styleUrls: ['./servico-detalhes.component.css']
})
export class ServicoDetalhesComponent implements OnInit {
   servico: Servico | null = null;
   loading = true;
   error: string | null = null;
   processandoPedido = false; // Novo estado para controlar o loading do pedido

   // Dados do formulário de pedido
   endereco = {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      cep: '',
      complemento: ''
   };
   observacao = '';

   constructor(
      private route: ActivatedRoute,
      private router: Router,
      private servicosService: ServicosService,
      private authService: AuthService,
      private pedidosService: PedidosService
   ) { }

   ngOnInit() {
      this.route.params.subscribe(params => {
         const id = +params['id'];
         if (id) {
            this.carregarServico(id);
         } else {
            this.error = 'ID do serviço inválido';
            this.loading = false;
         }
      });
   }

   async carregarServico(id: number) {
      try {
         this.loading = true;
         this.error = null;

         this.servico = await this.servicosService.getServicoById(id);

         if (!this.servico) {
            this.error = 'Serviço não encontrado';
         }
      } catch (error) {
         console.error('Erro ao carregar serviço:', error);
         this.error = 'Erro ao carregar dados do serviço. Tente novamente.';
      } finally {
         this.loading = false;
      }
   }

   async fazerPedido() {
      // Validação básica
      if (!this.endereco.rua || !this.endereco.numero || !this.endereco.bairro ||
         !this.endereco.cidade || !this.endereco.cep) {
         alert('Por favor, preencha todos os campos obrigatórios do endereço.');
         return;
      }

      try {
         this.processandoPedido = true;

         // Verificar se o usuário já está logado
         const isAuthenticated = this.authService.isAuthenticated();

         if (!isAuthenticated) {
            // Fazer login anônimo
            console.log('Usuário não está logado, fazendo login anônimo...');
            const loginResult = await this.authService.signInAnonymously();

            if (!loginResult.success) {
               alert('Erro ao processar pedido: ' + (loginResult.error || 'Erro desconhecido'));
               return;
            }

            console.log('Login anônimo realizado com sucesso!');
         }

         // Aguardar um momento para garantir que o estado de autenticação foi atualizado
         await new Promise(resolve => setTimeout(resolve, 500));

         // Obter dados do usuário atual (anônimo ou não)
         const currentUser = await this.authService.getCurrentUser();

         if (!currentUser) {
            alert('Erro ao processar pedido: não foi possível autenticar o usuário.');
            return;
         }

         // Criar o pedido usando o serviço
         const pedidoResult = await this.pedidosService.criarPedido({
            servico_id: this.servico!.id!,
            endereco: this.endereco,
            descricao: this.observacao
         });

         if (!pedidoResult.success) {
            alert('Erro ao criar pedido: ' + (pedidoResult.error || 'Erro desconhecido'));
            return;
         }

         console.log('Pedido criado com sucesso:', pedidoResult.pedido);

         // Mostrar sucesso
         alert('Pedido criado com sucesso! Você foi autenticado automaticamente.');

         // Opcional: redirecionar para página de pedidos ou limpar formulário
         this.limparFormulario();

      } catch (error) {
         console.error('Erro ao processar pedido:', error);
         alert('Erro inesperado ao processar pedido. Tente novamente.');
      } finally {
         this.processandoPedido = false;
      }
   }

   private limparFormulario() {
      this.endereco = {
         rua: '',
         numero: '',
         bairro: '',
         cidade: '',
         cep: '',
         complemento: ''
      };
      this.observacao = '';
   }

   voltarParaHome() {
      this.router.navigate(['/']);
   }
}
