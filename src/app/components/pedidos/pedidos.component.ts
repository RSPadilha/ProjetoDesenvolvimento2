import { Component } from '@angular/core';

@Component({
  selector: 'app-pedidos',
  imports: [],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {
  pedidos: any[] = [];

  async buscarTodosPedidos() {
    try {
      const res = await fetch(`http://pfs-api.onrender.com/pedidos`);
      const pedidos = await res.json();
      // Busca atendentes e serviços para mapear nomes
      const [attendantsRes] = await Promise.all([
        fetch('http://pfs-api.onrender.com/atendentes')
        // fetch('http://localhost:3000/servicos')
      ]);
      const attendants = await attendantsRes.json();
      // const services = await servicesRes.json();

      this.pedidos = pedidos.map((pedido: any) => {
        return {
          id: pedido.id,
          idCliente: pedido.cliente.id,
          cliente: pedido.cliente.nome || '-',
          atendente: pedido.atendente?.nome || '-',
          descricao: pedido.descricao || '-',
          endereco: pedido.cliente.endereco.rua || '-',
          dataInicio: pedido.data ? new Date(pedido.data).toLocaleDateString() : '-',
          dataFinalizado: pedido.dataFinalizado ? new Date(pedido.dataFinalizado).toLocaleDateString() : '-',
          status: pedido.status || '-',
          valor: pedido.valor || '-'
        };
      });
    } catch (e) {
      this.pedidos = [];
    }
  }

  async ngOnInit() { //ng... versão antiga do angular
    await this.buscarTodosPedidos();
  }
}
