import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { supabase } from '../../services/supabase';

@Component({
   selector: 'app-signup',
   imports: [FormsModule, RouterLink],
   templateUrl: './signup.component.html',
   styleUrls: ['./signup.component.css']
})

export class SignupComponent {
   nomeCompleto: string = '';
   email: string = '';
   password: string = '';

   constructor(private router: Router) { }

   async cadastrar() {
      const { data, error } = await supabase.auth.signUp({
         email: this.email,
         password: this.password
      });
      if (error) {
         console.error('Erro ao criar usuário:', error.message);
         return;
      }

      const userId = data.user?.id;

      if (userId) {
         const { error: insertError } = await supabase
            .from('usuarios')
            .insert([{ nome: this.nomeCompleto, email: this.email, tipo: "cliente" }]);

         if (insertError) {
            console.error('Erro ao salvar na tabela usuarios:', insertError.message);
         } else {
            console.log('Usuário criado com sucesso!');
         }
      }

      console.log('Cadastrado com sucesso:', data);

      // Navegar para a rota raiz após cadastro bem-sucedido
      this.router.navigate(['']);
   }
}
