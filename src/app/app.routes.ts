import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { AtendenteComponent } from './components/atendente/atendente.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';
import { SignupComponent } from './components/signup/signup.component';
import { MinhaContaComponent } from './components/minha-conta/minha-conta.component';
import { ServicoDetalhesComponent } from './components/servico-detalhes/servico-detalhes.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
   { path: '', component: HomeComponent }, // Removido AuthGuard para permitir acesso sem login
   { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
   { path: 'signup', component: SignupComponent, canActivate: [LoginGuard] },
   { path: 'servico/:id', component: ServicoDetalhesComponent }, // Nova rota para detalhes do serviço
   { path: 'cliente', component: ClienteComponent, canActivate: [AuthGuard] },
   { path: 'atendente', component: AtendenteComponent, canActivate: [AuthGuard] },
   { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
   { path: 'minhaconta', component: MinhaContaComponent, canActivate: [AuthGuard] },

   // Rotas dos produtos (adicionar mais tarde):
   // { path: 'produto/:id', component: ProductDetailComponent }, // Sem AuthGuard para permitir visualização
   // { path: 'produtos', component: ProductsListComponent }, // Sem AuthGuard para permitir visualização
   // { path: 'categoria/:categoria', component: CategoryProductsComponent }, // Sem AuthGuard para permitir visualização
   // { path: 'carrinho', component: ShoppingCartComponent, canActivate: [AuthGuard] }, // Manter AuthGuard para carrinho
   // { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] } // Manter AuthGuard para checkout
];
