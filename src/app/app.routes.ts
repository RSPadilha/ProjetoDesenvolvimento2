import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ClienteComponent } from './components/cliente/cliente.component';
import { AtendenteComponent } from './components/atendente/atendente.component';
import { PedidosComponent } from './components/pedidos/pedidos.component';

export const routes: Routes = [
   // { path: '', component: HomeComponent }, // na vdd a rota é a mesma. carregar login ou home
   { path:'login', component: LoginComponent },
   { path: 'cliente', component: ClienteComponent },
   { path: 'atendente', component: AtendenteComponent },
   { path: 'pedidos', component: PedidosComponent }
];
