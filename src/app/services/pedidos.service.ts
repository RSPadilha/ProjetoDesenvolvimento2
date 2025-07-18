import { Injectable } from '@angular/core';
import { supabase } from './supabase';
import { AuthService } from './auth.service';

export interface Pedido {
   id?: number;
   user_id?: string;
   servico_id: number;
   endereco: {
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      cep: string;
      complemento?: string;
   };
   descricao?: string; // Alterado de observacao para descricao
   status?: string;
   created_at?: string;
   updated_at?: string;
}@Injectable({
   providedIn: 'root'
})
export class PedidosService {

   constructor(private authService: AuthService) { }

   /**
    * Cria um novo pedido para o usuário atual (anônimo ou autenticado)
    */
   async criarPedido(pedidoData: Omit<Pedido, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; pedido?: Pedido; error?: string }> {
      try {
         // Obter o ID do usuário atual
         const userId = await this.authService.getCurrentUserId();

         if (!userId) {
            return { success: false, error: 'Usuário não autenticado' };
         }

         // Verificar se existe a tabela pedidos_anonimos, senão usar pedidos
         const tableName = await this.checkTableExists('pedidos_anonimos') ? 'pedidos_anonimos' : 'pedidos';

         const { data, error } = await supabase
            .from(tableName)
            .insert([{
               user_id: userId,
               servico_id: pedidoData.servico_id,
               endereco: pedidoData.endereco,
               descricao: pedidoData.descricao,
               status: 'pendente'
            }])
            .select()
            .single();

         if (error) {
            console.error('Erro ao criar pedido:', error);
            return { success: false, error: error.message };
         }

         return { success: true, pedido: data };
      } catch (error) {
         console.error('Erro inesperado ao criar pedido:', error);
         return { success: false, error: 'Erro inesperado ao criar pedido' };
      }
   }

   /**
    * Busca todos os pedidos do usuário atual
    */
   async getPedidosDoUsuario(): Promise<Pedido[]> {
      try {
         const userId = await this.authService.getCurrentUserId();

         if (!userId) {
            return [];
         }

         // Verificar se existe a tabela pedidos_anonimos, senão usar pedidos
         const tableName = await this.checkTableExists('pedidos_anonimos') ? 'pedidos_anonimos' : 'pedidos';

         const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

         if (error) {
            console.error('Erro ao buscar pedidos:', error);
            return [];
         }

         return data || [];
      } catch (error) {
         console.error('Erro inesperado ao buscar pedidos:', error);
         return [];
      }
   }

   /**
    * Busca um pedido específico por ID
    */
   async getPedidoPorId(id: number): Promise<Pedido | null> {
      try {
         const userId = await this.authService.getCurrentUserId();

         if (!userId) {
            return null;
         }

         // Verificar se existe a tabela pedidos_anonimos, senão usar pedidos
         const tableName = await this.checkTableExists('pedidos_anonimos') ? 'pedidos_anonimos' : 'pedidos';

         const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId) // Garantir que o usuário só veja seus próprios pedidos
            .single();

         if (error) {
            console.error('Erro ao buscar pedido:', error);
            return null;
         }

         return data;
      } catch (error) {
         console.error('Erro inesperado ao buscar pedido:', error);
         return null;
      }
   }

   /**
    * Verifica se uma tabela existe no banco de dados
    */
   private async checkTableExists(tableName: string): Promise<boolean> {
      try {
         const { error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);

         return !error;
      } catch (error) {
         return false;
      }
   }
}
