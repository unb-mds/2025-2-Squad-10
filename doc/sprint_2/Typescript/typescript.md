# Guia Básico de TypeScript


O **TypeScript** é um superset do JavaScript que adiciona **tipagem estática** e recursos avançados para facilitar o desenvolvimento de aplicações mais seguras e organizadas.


---


## 1. Configuração Inicial


Instalar TypeScript globalmente:
```bash
npm install -g typescript
```


Verificar versão:
```bash
tsc -v
```


Criar arquivo de configuração:
```bash
tsc --init
```


---

## 2. Tipos Básicos
```ts
let dados: unknown;
dados = "texto";
dados = 42;
```


---


## 3. Funções


### Tipagem de parâmetros e retorno
```ts
function soma(a: number, b: number): number {
return a + b;
}
```


### Parâmetros opcionais e padrão
```ts
function saudacao(nome: string, saudacao: string = "Olá"): string {
return `${saudacao}, ${nome}`;
}
```


---


## 4. Objetos e Interfaces


### Tipando objetos
```ts
let pessoa: { nome: string; idade: number } = {
nome: "João",
idade: 25
};
```


### Interfaces
```ts
interface Usuario {
id: number;
nome: string;
ativo?: boolean; // opcional
}


let usuario1: Usuario = {
id: 1,
nome: "Carlos"
};
```


---