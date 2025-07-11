# Projeto de Desenvolvimento 2

> 💻 Site disponível em: [https://projetodesenvolvimento2front.vercel.app/](https://projetodesenvolvimento2front.vercel.app/)

Por: Ricardo Padilha

Este artigo tem como objetivo ilustrar um sistema web de gerenciamento centralizado de ordens de pedido para empresas prestadoras de serviço. Este será um projeto final do curso de Análise e Desenvolvimento de Sistemas do Unisenac-RS.



## Resumo do Projeto

A aplicação tem como objetivo oferecer uma solução eficiente e online para prestadores de serviço, permitindo o cadastro, controle e acompanhamento de solicitações, onde permitirá que os clientes realizem pedidos diretamente pela plataforma.
Este sistema será voltado para pequenas empresas que prestam serviços, como por exemplo, manutenção, consultoria e atendimento em geral que buscam facilidade, organização e melhorar o seu contato com o cliente.

Este sistema pretende melhorar o fluxo desde a criação de uma chamado até a sua finalização, permitindo a avaliação do atendimento e mantendo o histórico, porém não implementará métodos de pagamento para manter o escopo do MVP.

## Definição do Problema

Pequenas empresas prestadoras de serviço enfrentam dificuldades em organizar, acompanhar e gerenciar seus pedidos de forma eficiente, o que impacta diretamente a comunicação com o cliente e a prestação do serviço. A ausência de um sistema centralizado dificulta o controle do histórico, o acompanhamento do status e a gestão do atendimento, prejudicando a experiência com o cliente.

O principal objetivo desse projeto é de dar mais praticidade aos seus usuários, de forma simples, podendo acompanhar o fluxo de um pedido de serviço, desde o começo até a sua finalização.

Este projeto vem com o objetivo de tentar melhorar o fluxo de uma atendimento de empresas que não posuem um sistema específico para esse objetivo. Atualmente muitos atendimentos são feitas inteiramente pelo Whatsapp,onde há a necessidade de um chatbot ou um funcionário humano para fazer as requisições das informações do cliente, agendar horário e combinar o pagamento.

## Objetivos

### Objetivos Gerais

Desenvolver uma aplicação web que permita a gestão eficiente de pedidos de serviços em lojas online, visando facilitar o controle operacional, melhorar a comunicação entre empresas e clientes, e oferecer uma solução tecnológica acessível para organização e acompanhamento de atendimentos.

### Objetivos Especificos

- Identificar as necessidades de pequenas e médias empresas prestadoras de serviços quanto ao controle de pedidos.

- Implementar uma interface e api para cadastro, gerenciamento e acompanhamento de pedidos por clientes e administradores.

- Gerenciar a autenticação dos usuários logados.

- Validar a aplicação por meio de testes com usuários reais, avaliando sua eficácia e usabilidade. (Verificar se o sistema realmente resolve o problema proposto.)

## Stack Tecnológico

<!-- Descrever o por que de cada um -->
O projeto será uma aplicação web utilizando as seguintes tecnologias:
- Frontend: HTML, CSS, [JavaScript(Angular)](https://angular.dev/overview)
- Backend: [Node.js(Express)](https://expressjs.com/pt-br/)
- Banco de dados: [PostgreSQL(Supabase)](https://supabase.com/)
- Hospedagem: [AWS](https://aws.amazon.com/pt/), [Vercel](https://vercel.com/) ou similares.
- Controle de versão: [GitHub](https://github.com/)
- Autenticação: [JWT](https://jwt.io/)


## Descrição da Solução
<!-- Telas do sistema -->
O sistema foi estruturado como uma arquitetura MVC, utilizando Angular no frontend e uma api RESTful no backend.

A aplicação permite que clientes realizem pedidos e acompanhem o status em tempo real, enquanto a empresa gerencia os atendimentos por meio de um painel administrativo. Isso se derá através de login que utilizarão JWT para garantir a autenticidade de cada utilizador.

## Arquitetura

[Artefatos](artefatos/)
<!-- Informar sobre testes unitários, aqui ou em #validação -->

## Validação

A validação se derá através do feedback dos clientes tanto quanto das empresas, onde podem avaliar se esse sistema supre as suas necessidades.

## Estratégia

Os objetivos terão sua eficácia comprovada através de pesquisas com os usuários(personas), questionários e feedback nas próprias telas de uso do sistema.

## Consolidação dos Dados Coletados

_Relatório será gerado ao final do projeto_

## Conclusões

_Relatório será gerado ao final do projeto_

## Melhorias a Implementar

- [ ] Atualizar a stack tecnologica
- [ ] Integrar autenticação JWT
- [ ] Realizar testes unitários e de integração
- [x] Supabase online
- [x] Frontend no vercel
- [ ] 

## Referências Bibliográficas

ZANUZ, Luciano. Modelo de documentação, 2025 <https://github.com/lucianozanuz/projeto-desenvolvimento-ii/blob/main/modelo_de_documentacao.md>
