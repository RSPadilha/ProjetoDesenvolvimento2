import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../services/supabase';

interface Endereco {
  id?: number;
  cep: string;
  estado: string;
  cidade: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
  isEditing?: boolean;
}

interface Usuario {
  id?: number;
  email: string;
  nome: string;
  telefone: string;
  enderecos: Endereco[];
}

@Component({
  selector: 'app-minha-conta',
  imports: [CommonModule, FormsModule],
  templateUrl: './minha-conta.component.html',
  styleUrl: './minha-conta.component.css'
})
export class MinhaContaComponent implements OnInit {
  usuario: Usuario = {
    email: '',
    nome: '',
    telefone: '',
    enderecos: []
  };

  loading = false;
  novoEndereco: Endereco = {
    cep: '',
    estado: '',
    cidade: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: ''
  };

  adicionandoEndereco = false;

  async ngOnInit() {
    await this.carregarDadosUsuario();
  }

  async carregarDadosUsuario() {
    this.loading = true;
    try {
      // Buscar dados do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user);
      if (user) {
        this.usuario.email = user.email || '';

        // Buscar informações do usuário na tabela usuarios
        const { data: dadosUsuario, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', user.email)
          .single();

        if (dadosUsuario) {
          this.usuario.id = dadosUsuario.id;
          this.usuario.nome = dadosUsuario.nome || '';
          this.usuario.telefone = dadosUsuario.telefone || '';
        }

        // Buscar endereços do usuário se ele existir na tabela usuarios
        if (this.usuario.id) {
          const { data: enderecos, error: enderecoError } = await supabase
            .from('endereco')
            .select('*')
            .eq('id_usuario', this.usuario.id);

          if (enderecos) {
            this.usuario.enderecos = enderecos.map(endereco => ({
              id: endereco.id,
              cep: endereco.cep || '',
              estado: endereco.estado || '',
              cidade: endereco.cidade || '',
              rua: endereco.rua || '',
              bairro: endereco.bairro || '',
              numero: endereco.numero || '',
              complemento: endereco.complemento || '',
              isEditing: false
            }));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      this.loading = false;
    }
  }

  async salvarDadosUsuario() {
    this.loading = true;
    try {
      if (this.usuario.id) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            nome: this.usuario.nome,
            telefone: this.usuario.telefone
          })
          .eq('id', this.usuario.id);

        if (error) {
          console.error('Erro ao atualizar dados do usuário:', error);
          alert('Erro ao salvar dados. Tente novamente.');
        } else {
          alert('Dados salvos com sucesso!');
        }
      } else {
        // Criar novo usuário
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            email: this.usuario.email,
            nome: this.usuario.nome,
            telefone: this.usuario.telefone || ''
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar usuário:', error);
          alert('Erro ao salvar dados. Tente novamente.');
        } else {
          this.usuario.id = data.id;
          alert('Dados salvos com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      alert('Erro ao salvar dados. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  editarEndereco(endereco: Endereco) {
    endereco.isEditing = true;
  }

  async salvarEndereco(endereco: Endereco) {
    this.loading = true;
    try {
      if (endereco.id) {
        // Atualizar endereço existente
        const { error } = await supabase
          .from('endereco')
          .update({
            cep: endereco.cep,
            estado: endereco.estado,
            cidade: endereco.cidade,
            rua: endereco.rua,
            bairro: endereco.bairro,
            numero: endereco.numero,
            complemento: endereco.complemento
          })
          .eq('id', endereco.id);

        if (error) {
          console.error('Erro ao salvar endereço:', error);
          alert('Erro ao salvar endereço. Tente novamente.');
        } else {
          endereco.isEditing = false;
          alert('Endereço salvo com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      alert('Erro ao salvar endereço. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  cancelarEdicaoEndereco(endereco: Endereco) {
    endereco.isEditing = false;
    // Recarregar dados para desfazer mudanças
    this.carregarDadosUsuario();
  }

  async adicionarEndereco() {
    this.loading = true;
    try {
      if (!this.usuario.id) {
        alert('Erro: Usuário não encontrado. Faça login novamente.');
        return;
      }

      const { data, error } = await supabase
        .from('endereco')
        .insert({
          id_usuario: this.usuario.id,
          cep: this.novoEndereco.cep,
          estado: this.novoEndereco.estado,
          cidade: this.novoEndereco.cidade,
          rua: this.novoEndereco.rua,
          bairro: this.novoEndereco.bairro,
          numero: this.novoEndereco.numero,
          complemento: this.novoEndereco.complemento
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar endereço:', error);
        alert('Erro ao adicionar endereço. Tente novamente.');
      } else {
        // Adicionar o novo endereço à lista
        this.usuario.enderecos.push({
          id: data.id,
          ...this.novoEndereco,
          isEditing: false
        });

        // Limpar formulário
        this.novoEndereco = {
          cep: '',
          estado: '',
          cidade: '',
          rua: '',
          bairro: '',
          numero: '',
          complemento: ''
        };

        this.adicionandoEndereco = false;
        alert('Endereço adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      alert('Erro ao adicionar endereço. Tente novamente.');
    } finally {
      this.loading = false;
    }
  }

  async removerEndereco(endereco: Endereco) {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      this.loading = true;
      try {
        const { error } = await supabase
          .from('endereco')
          .delete()
          .eq('id', endereco.id);

        if (error) {
          console.error('Erro ao remover endereço:', error);
          alert('Erro ao remover endereço. Tente novamente.');
        } else {
          // Remover da lista local
          this.usuario.enderecos = this.usuario.enderecos.filter(e => e.id !== endereco.id);
          alert('Endereço removido com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao remover endereço:', error);
        alert('Erro ao remover endereço. Tente novamente.');
      } finally {
        this.loading = false;
      }
    }
  }

  cancelarNovoEndereco() {
    this.novoEndereco = {
      cep: '',
      estado: '',
      cidade: '',
      rua: '',
      bairro: '',
      numero: '',
      complemento: ''
    };
    this.adicionandoEndereco = false;
  }
}
