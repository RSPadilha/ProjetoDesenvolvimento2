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
      const response = await fetch(`http://localhost:3000/orders`);
      const orders = await response.json();
      // Busca atendentes e serviços para mapear nomes
      const [attendantsRes, servicesRes] = await Promise.all([
        fetch('http://localhost:3000/attendant'),
        fetch('http://localhost:3000/services')
      ]);
      const attendants = await attendantsRes.json();
      const services = await servicesRes.json();

      this.pedidos = orders.map((order: any) => {
        const atendente = attendants.find((a: any) => a.id == order.idAttendant)?.name || '-';
        const tipoServico = services.find((s: any) => s.id == order.idService)?.category || '-';
        const endereco = order.adress ? `${order.adress.street}, ${order.adress.number}` : '-';
        return {
          atendente,
          tipoServico,
          descricao: order.description,
          endereco,
          dataInicio: order['start-date'],
          dataFinalizado: order['end-date'],
          status: order.status,
          valor: order.value
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
