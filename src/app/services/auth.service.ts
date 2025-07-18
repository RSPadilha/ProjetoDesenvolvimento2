import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase';

@Injectable({
   providedIn: 'root'
})
export class AuthService {
   private isLoggedIn = false;
   private authStateSubject = new BehaviorSubject<boolean>(false);
   public authState$ = this.authStateSubject.asObservable();

   constructor(private router: Router) {
      this.initializeAuth();
   }

   private async initializeAuth() {
      // Verificar se o usuário já está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      this.isLoggedIn = !!session;
      this.authStateSubject.next(this.isLoggedIn);

      // Escutar mudanças no estado de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
         const wasLoggedIn = this.isLoggedIn;
         this.isLoggedIn = !!session;
         this.authStateSubject.next(this.isLoggedIn);

         // Só redirecionar se houve mudança real no estado de autenticação
         if (event === 'SIGNED_OUT' || (!wasLoggedIn && session)) {
            if (session) {
               // Usuário acabou de fazer login - navegar para home
               this.router.navigate(['/']);
            } else {
               // Usuário acabou de fazer logout - navegar para home (não mais para login)
               this.router.navigate(['/']);
            }
         }
      });

      // Navegação inicial apenas se estiver na página de login e já estiver autenticado
      const currentUrl = this.router.url;
      if (this.isLoggedIn && (currentUrl === '/login' || currentUrl === '/signup')) {
         this.router.navigate(['/']);
      }
      // Removida a lógica que redirecionava usuários deslogados para login automaticamente
   }

   isAuthenticated(): boolean {
      return this.isLoggedIn;
   }

   async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
   }

   async getCurrentUserId(): Promise<string | null> {
      const user = await this.getCurrentUser();
      return user?.id || null;
   }

   // Método para verificar se deve redirecionar (útil para guards)
   shouldRedirectToLogin(): boolean {
      return !this.isLoggedIn;
   }

   // Método para fazer logout com redirecionamento controlado
   async logout() {
      await supabase.auth.signOut();
      // O redirecionamento será feito automaticamente pelo onAuthStateChange
   }

   // Método para login anônimo
   async signInAnonymously(): Promise<{ success: boolean; error?: string; user?: any }> {
      try {
         const { data, error } = await supabase.auth.signInAnonymously();

         if (error) {
            console.error('Erro no login anônimo:', error);
            return { success: false, error: error.message };
         }

         console.log('Login anônimo realizado com sucesso:', data);
         return { success: true, user: data.user };
      } catch (error) {
         console.error('Erro inesperado no login anônimo:', error);
         return { success: false, error: 'Erro inesperado ao fazer login anônimo' };
      }
   }

   // Método para verificar se o usuário atual é anônimo
   async isAnonymousUser(): Promise<boolean> {
      try {
         const user = await this.getCurrentUser();
         return user?.is_anonymous || false;
      } catch (error) {
         console.error('Erro ao verificar se usuário é anônimo:', error);
         return false;
      }
   }
}
