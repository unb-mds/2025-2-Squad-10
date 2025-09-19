# Configuração do Docker e Docker Compose

Este guia descreve como criar e executar containers para o projeto **React (frontend)** e **Node.js (backend)** utilizando **Docker** e **Docker Compose**.

---

## 1. Pré-requisitos

Antes de começar, instale em sua máquina:

- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/install/) (já incluso no Docker Desktop em muitas distribuições)

Verifique a instalação:

```bash
docker --version
docker compose version
```

---

## 2. Estrutura básica de arquivos

No diretório raiz do projeto,  será necessario:

```
.
├── backend/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env (opcional para variáveis de ambiente)
```

---
