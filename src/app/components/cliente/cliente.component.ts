import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../services/supabase';
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
   idCliente: number;
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

@Component({
   selector: 'app-cliente',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './cliente.component.html',
   styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
   pedidos: any[] = [];
   tiposServico: TipoServico[] = [];
   enderecos: Endereco[] = [];
   loading = false;
   usuarioId: number | null = null;

   // Formulário para novo pedido
   novoPedidoForm: NovoPedidoForm = {
      idServico: null,
      descricao: '',
      idEndereco: null
   };

   constructor(private authService: AuthService) { }

   async ngOnInit() {
      await this.carregarUsuario();
      await this.carregarTiposServico();
      await this.carregarEnderecos();
      await this.carregarPedidos();
   }

   async carregarUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', user.email)
            .single();

         this.usuarioId = data?.id || null;
      }
   }

   async carregarTiposServico() {
      try {
         const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .order('nome');

         if (error) throw error;
         this.tiposServico = data || [];
      } catch (error) {
         console.error('Erro ao carregar tipos de serviço:', error);
         this.tiposServico = [];
      }
   }

   async carregarEnderecos() {
      if (!this.usuarioId) return;

      try {
         const { data, error } = await supabase
            .from('endereco')
            .select('*')
            .eq('id_usuario', this.usuarioId);

         if (error) throw error;
         this.enderecos = data || [];
      } catch (error) {
         console.error('Erro ao carregar endereços:', error);
         this.enderecos = [];
      }
   }

   async carregarPedidos() {
      if (!this.usuarioId) return;

      try {
         const { data, error } = await supabase
            .from('pedidos')
            .select(`
               *,
               servicos!inner(nome, descricao),
               endereco!inner(rua, numero, complemento, bairro, cidade, estado, cep)
            `)
            .eq('idCliente', this.usuarioId)
            .order('dataCriacao', { ascending: false });

         if (error) throw error;

         this.pedidos = (data || []).map(pedido => ({
            ...pedido,
            nome_servico: pedido.servicos?.nome || 'Serviço não encontrado',
            endereco_completo: `${pedido.endereco?.rua}, ${pedido.endereco?.numero}${pedido.endereco?.complemento ? ' - ' + pedido.endereco.complemento : ''} - ${pedido.endereco?.bairro}, ${pedido.endereco?.cidade}/${pedido.endereco?.estado}`
         }));
      } catch (error) {
         console.error('Erro ao carregar pedidos:', error);
         this.pedidos = [];
      }
   }

   async novoPedido() {
      if (!this.usuarioId || !this.novoPedidoForm.idServico || !this.novoPedidoForm.idEndereco || !this.novoPedidoForm.descricao.trim()) {
         alert('Por favor, preencha todos os campos obrigatórios.');
         return;
      }

      this.loading = true;

      try {
         const { data, error } = await supabase
            .from('pedidos')
            .insert({
               idCliente: this.usuarioId,
               idServico: this.novoPedidoForm.idServico,
               descricao: this.novoPedidoForm.descricao.trim(),
               idEndereco: this.novoPedidoForm.idEndereco,
               dataCriacao: new Date().toISOString(),
               status: 'pendente'
            })
            .select()
            .single();

         if (error) throw error;

         // Limpar formulário
         this.novoPedidoForm = {
            idServico: null,
            descricao: '',
            idEndereco: null
         };

         // Recarregar pedidos
         await this.carregarPedidos();

         alert('Pedido criado com sucesso!');
      } catch (error) {
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
}
