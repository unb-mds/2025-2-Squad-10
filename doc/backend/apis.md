
# APIs

---

## 📖 Contexto

Uma **API (Application Programming Interface)** é um conjunto de regras e protocolos que permite que diferentes sistemas, serviços ou aplicações se comuniquem entre si.
Elas são a base da integração moderna de software, permitindo reuso de funcionalidades, comunicação entre microsserviços e integração com serviços de terceiros.

No projeto, precisamos avaliar quais tipos de APIs podem ser utilizados, como funcionam e quais ferramentas ajudam no desenvolvimento, teste e documentação.

---

## O que é uma API (resumo)

* **REST (Representational State Transfer):**
  Baseada em HTTP, muito usada na web, geralmente utiliza JSON.

* **GraphQL:**
  Linguagem de consulta onde o cliente define exatamente os dados que precisa.

* **gRPC (Google Remote Procedure Call):**
  Usa Protobuf, altamente eficiente para comunicação entre microsserviços.

* **WebSockets:**
  Comunicação em tempo real e bidirecional entre cliente e servidor.

---

## Como funciona uma API

1. **Cliente** faz uma requisição para um endpoint (ex.: `GET /users/1`).
2. **Servidor** processa a requisição e acessa dados/lógica necessária.
3. **Resposta** é enviada no formato definido (JSON, XML, Protobuf, etc.).

Exemplo de requisição REST:

```http
GET /users/1
Host: api.exemplo.com
Accept: application/json
```

Resposta:

```json
{
  "id": 1,
  "nome": "Maria",
  "email": "maria@exemplo.com"
}
```

---

## Tecnologias para controle e documentação de APIs

* **Postman** → testar e organizar requisições.
* **Insomnia** → alternativa ao Postman, mais leve.
* **Swagger / OpenAPI** → documentar APIs REST, gerar clientes e mocks.
* **API Gateway (Kong, Apigee, AWS API Gateway)** → gerenciar múltiplas APIs (autenticação, rate limiting, monitoramento).
* **OAuth 2.0 / JWT** → autenticação e autorização.

---

## Compatibilidade com Linguagens e Frameworks

| API         | Python                      | Node.js         | .NET            | Go        | Java         | PHP              | Ruby           |
| ----------- | --------------------------- | --------------- | --------------- | --------- | ------------ | ---------------- | -------------- |
| **REST**    | Flask, FastAPI, Django REST | Express, NestJS | ASP.NET Web API | Gin, Echo | Spring Boot  | Laravel, Symfony | Rails, Sinatra |
| **GraphQL** | Graphene, Strawberry        | Apollo, Yoga    | Hot Chocolate   | gqlgen    | GraphQL Java | Lighthouse       | GraphQL Ruby   |
| **gRPC**    | grpcio                      | grpc-node       | gRPC for .NET   | grpc-go   | grpc-java    | grpc-php         | gRPC Ruby      |

---

## Quando usar cada abordagem

* **REST:** padrão mais difundido, ótimo para web e mobile.
* **GraphQL:** quando o cliente precisa de consultas flexíveis e evitar múltiplas requisições.
* **gRPC:** ideal para microsserviços de alta performance.
* **WebSockets:** indicado para comunicação em tempo real (chat, streaming, jogos online).

---

## Vantagens & Desvantagens

### REST

* ✅ Simples, maduro, muito suporte.
* ❌ Muitas chamadas podem gerar sobrecarga.

### GraphQL

* ✅ Flexível, cliente define dados necessários.
* ❌ Implementação no servidor mais complexa.

### gRPC

* ✅ Alta performance, ideal para microsserviços.
* ❌ Não suportado nativamente em navegadores sem adaptação.

### WebSockets

* ✅ Comunicação em tempo real, bidirecional.
* ❌ Difícil de escalar e manter em grandes sistemas.

---

## Links úteis

* [Postman](https://www.postman.com/)
* [Swagger/OpenAPI](https://swagger.io/)
* [GraphQL](https://graphql.org/)
* [gRPC](https://grpc.io/)
* [Insomnia](https://insomnia.rest/)


