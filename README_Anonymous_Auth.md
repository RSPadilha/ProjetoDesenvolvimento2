# Configuração de Login Anônimo no Supabase

## Passos para habilitar autenticação anônima:

### 1. Habilitar Login Anônimo no Dashboard
1. Acesse o Dashboard do Supabase (https://supabase.com/dashboard)
2. Vá para seu projeto
3. Navegue para **Authentication > Settings**
4. Na seção **User Signups**, habilite a opção **"Enable anonymous sign-ins"**
5. Salve as configurações

### 2. Executar Script SQL (Opcional)
Execute o script `sql/setup-anonymous-auth.sql` no SQL Editor do Supabase para:
- Criar a tabela `pedidos_anonimos` 
- Configurar políticas de segurança (RLS)
- Criar função de limpeza de usuários anônimos antigos

### 3. Verificar Configurações
Para verificar se está funcionando, teste:
```javascript
// No console do navegador ou em um componente de teste
import { supabase } from './services/supabase';

const testAnonymousLogin = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  console.log('Resultado:', { data, error });
};
```

## Como funciona o fluxo implementado:

1. **Usuário acessa a página de detalhes do serviço** (`/servico/:id`)
2. **Preenche o formulário** com endereço e observações
3. **Clica em "Fazer Pedido"**
4. **Sistema verifica se está logado**:
   - Se SIM: prossegue para criar pedido
   - Se NÃO: faz login anônimo automaticamente
5. **Cria o pedido** no banco associado ao usuário (anônimo ou normal)
6. **Usuário fica logado** como anônimo e pode acessar outras funcionalidades

## Vantagens do login anônimo:
- ✅ Usuário não precisa criar conta para fazer pedidos
- ✅ Sistema mantém rastreamento dos pedidos
- ✅ Possibilita funcionalidades como carrinho e histórico
- ✅ Usuário pode converter conta anônima em conta real depois
- ✅ Políticas de segurança (RLS) funcionam normalmente

## Estrutura dos dados:
```typescript
interface Pedido {
  id?: number;
  user_id?: string; // ID do usuário anônimo ou autenticado
  servico_id: number;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
    complemento?: string;
  };
  descricao?: string; // Observações sobre o pedido (anteriormente observacao)
  status?: string; // 'pendente', 'em_andamento', 'concluido', etc.
  created_at?: string;
  updated_at?: string;
}
```

## Serviços criados/atualizados:
- ✅ `AuthService`: método `signInAnonymously()` e `isAnonymousUser()`
- ✅ `PedidosService`: gerencia criação e consulta de pedidos
- ✅ `ServicoDetalhesComponent`: implementa o fluxo completo

## Próximos passos sugeridos:
1. Testar a funcionalidade no ambiente de desenvolvimento
2. Implementar página de listagem de pedidos do usuário
3. Adicionar validação de CEP com API externa
4. Implementar sistema de notificações
5. Criar funcionalidade para converter usuário anônimo em conta real
