import { Injectable } from '@angular/core';
import { supabase } from './supabase';

export interface Servico {
   id?: number;
   nome: string;
   descricao: string;
   precoBase: number;
   image_url?: string; // URL da imagem no Supabase Storage (nome correto da coluna)
   created_at?: string;
   updated_at?: string;
}

@Injectable({
   providedIn: 'root'
})
export class ServicosService {

   constructor() { }

   /**
    * Busca todos os serviços da tabela 'servicos' ordenados por ID
    */
   async getServicos(): Promise<Servico[]> {
      try {
         const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .order('id', { ascending: true });

         if (error) {
            console.error('Erro ao buscar serviços:', error);
            throw error;
         }

         return data || [];
      } catch (error) {
         console.error('Erro inesperado ao buscar serviços:', error);
         throw error;
      }
   }

   /**
    * Busca um serviço específico por ID
    */
   async getServicoById(id: number): Promise<Servico | null> {
      try {
         const { data, error } = await supabase
            .from('servicos')
            .select('*')
            .eq('id', id)
            .single();

         if (error) {
            console.error('Erro ao buscar serviço por ID:', error);
            throw error;
         }

         return data;
      } catch (error) {
         console.error('Erro inesperado ao buscar serviço por ID:', error);
         throw error;
      }
   }

   /**
    * Faz upload de uma imagem para o Supabase Storage
    * @param file Arquivo de imagem a ser enviado
    * @param servicoId ID do serviço (usado para nomear o arquivo)
    * @returns URL pública da imagem ou null em caso de erro
    */
   async uploadImagem(file: File, servicoId?: number): Promise<string | null> {
      try {
         // Gerar nome único para o arquivo
         const timestamp = Date.now();
         const fileExt = file.name.split('.').pop();
         const fileName = servicoId
            ? `servico_${servicoId}_${timestamp}.${fileExt}`
            : `servico_novo_${timestamp}.${fileExt}`;

         // Upload do arquivo para o bucket 'servicos'
         const { data, error } = await supabase.storage
            .from('servicos')
            .upload(fileName, file, {
               cacheControl: '3600',
               upsert: false
            });

         if (error) {
            console.error('Erro no upload da imagem:', error);
            throw error;
         }

         // Obter URL pública da imagem
         const { data: urlData } = supabase.storage
            .from('servicos')
            .getPublicUrl(fileName);

         return urlData.publicUrl;
      } catch (error) {
         console.error('Erro inesperado no upload da imagem:', error);
         return null;
      }
   }

   /**
    * Remove uma imagem do Supabase Storage
    * @param imageUrl URL da imagem a ser removida
    */
   async removerImagem(imageUrl: string): Promise<boolean> {
      try {
         // Extrair o nome do arquivo da URL
         const fileName = imageUrl.split('/').pop();
         if (!fileName) return false;

         const { error } = await supabase.storage
            .from('servicos')
            .remove([fileName]);

         if (error) {
            console.error('Erro ao remover imagem:', error);
            return false;
         }

         return true;
      } catch (error) {
         console.error('Erro inesperado ao remover imagem:', error);
         return false;
      }
   }

   /**
    * Cria um novo serviço com imagem
    */
   async criarServico(servico: Omit<Servico, 'id'>): Promise<Servico | null> {
      try {
         const { data, error } = await supabase
            .from('servicos')
            .insert([servico])
            .select()
            .single();

         if (error) {
            console.error('Erro ao criar serviço:', error);
            throw error;
         }

         return data;
      } catch (error) {
         console.error('Erro inesperado ao criar serviço:', error);
         return null;
      }
   }

   /**
    * Atualiza um serviço existente
    */
   async atualizarServico(id: number, servico: Partial<Servico>): Promise<Servico | null> {
      try {
         console.log('Tentando atualizar serviço:', { id, servico });

         const { data, error } = await supabase
            .from('servicos')
            .update(servico)
            .eq('id', id)
            .select()
            .single();

         if (error) {
            console.error('Erro detalhado ao atualizar serviço:', {
               id,
               servico,
               error: error.message,
               details: error.details,
               hint: error.hint,
               code: error.code
            });
            throw error;
         }

         console.log('Serviço atualizado com sucesso:', data);
         return data;
      } catch (error) {
         console.error('Erro inesperado ao atualizar serviço:', {
            id,
            servico,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
         });
         return null;
      }
   }
}
