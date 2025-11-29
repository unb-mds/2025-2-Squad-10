---
title: "Arraynode"
date: 2025-11-29
# type: "documentacao" # Opcional: defina um tipo de conteúdo específico para Hugo
draft: false
---

# 📑 Resumo das ferramentas do Node.js / JavaScript

## 🔹 Métodos de Arrays

- **`.length`**
  Retorna o tamanho (quantidade de elementos) do array.
  
  ```js
  const arr = [1, 2, 3];
  console.log(arr.length); // 3
- **`.push()`**
  Adiciona um ou mais elementos no final do array.
  
  ```js
  arr.push(4); // [1, 2, 3, 4]

- **`.pop()`**
  Remove o último elemento do array e o retorna.

  ```js
  arr.pop(); // retorna 4 → [1, 2, 3]

- **`.slice(início, fim)`**
  Cria uma cópia parcial do array, sem alterar o original.
  
  ```js
  const frutas = ["maçã", "banana", "uva", "laranja"];
  console.log(frutas.slice(1, 3)); // ["banana", "uva"]


- **`.splice(início, quantos, ...itens)`**
  Altera o array original: pode remover, substituir ou adicionar elementos.

  ```js
  frutas.splice(1, 2, "kiwi"); 
  // remove 2 a partir do índice 1 → ["maçã", "kiwi", "laranja"]


- **`.concat()`**
  Junta dois ou mais arrays em um novo.

  ```js
  const a = [1, 2], b = [3, 4];
  console.log(a.concat(b)); // [1, 2, 3, 4]


- **`.includes(valor)`**
  Verifica se o array contém determinado valor (retorna true/false).

  ```js
  console.log(frutas.includes("maçã")); // true


- **`.indexOf(valor)`**
  Retorna o índice da primeira ocorrência do valor no array, ou -1 se não existir.
  ```js
  console.log(frutas.indexOf("kiwi")); // 1

## 🔹 Estruturas e Operadores

- **`Desestruturação de array`**
Extrai valores de um array em variáveis separadas.

  ```js
  const [x, y, z] = [10, 20, 30];
  console.log(x, y, z); // 10 20 30


- **`i++ vs ++i`**
  i++ → retorna o valor atual antes de incrementar.
  ++i → incrementa primeiro e depois retorna.

  ```js
  let i = 1;
  console.log(i++); // 1 (depois vira 2)
  console.log(++i); // 3


- **`for..of`**
  Itera diretamente sobre os valores de um array.

  ```js
  for (let fruta of frutas) {
    console.log(fruta);
  }

## 🔹 Iteração de Arrays

- **`.forEach()`**
  	Executa uma função para cada elemento do array (não retorna nada).

  ```js
  frutas.forEach(f => console.log(f));


- **`.map()`**
  Cria um novo array aplicando uma transformação a cada elemento.

  ```js
  const numeros = [1, 2, 3];
  const dobro = numeros.map(n => n * 2); 
  console.log(dobro); // [2, 4, 6]


- **`.filter()`**
  Cria um novo array apenas com os elementos que passam em uma condição.

  ```js
  const pares = numeros.filter(n => n % 2 === 0);
  console.log(pares); // [2]


- **`.reduce()`**
  Reduz o array a um único valor, acumulando resultados.

  ```js
  const soma = numeros.reduce((acc, n) => acc + n, 0);
  console.log(soma); // 6

## 🔹 Outros recursos

- **`Spread Operator (...)`**
  Expande os elementos de um array/objeto.

  ```js
  const arr1 = [1, 2], arr2 = [3, 4];
  const combinado = [...arr1, ...arr2]; 
  console.log(combinado); // [1, 2, 3, 4]


- **`Set`**
  Estrutura de dados que guarda valores únicos, sem repetição.

  ```js
  const numerosSet = new Set([1, 2, 2, 3]);
  console.log(numerosSet); // Set {1, 2, 3}
