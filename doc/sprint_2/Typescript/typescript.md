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

## 5. Classes 

```ts 
class Animal{
    nome: string;

    contructor(nome: string){
        this.nome = nome;
    }
    fazersom(): void {
        console.log("Som genérico...");
    }
}
class cachorro extend Animal {
    fazersom(): void{
        console.log("Au Au");
    }
}
let dog = new cachorro("Rex");
dog.fazersom();
```

---

## 6. Generics

Generics permitem reutilizar código de foma tipada.

``` ts 
function identidade<T>(valor: T): T {
    return valor;
}

let num = identidade<number>(10);
let texto = identidade<string>("Olá");
```

---

## 7. Tipos Avançados

## Union Types
```ts
let id : number | string;
id = 10;
id = "abc123";
```
## Types Alias
```ts
interface Pessoa{
    nome: string;
}
interface Funcionario{
    salario: number;
}

let trabalhador: Pessoa & Funcionario = {
    nome: "Ana",
    salario: 10.000
};
```

---

