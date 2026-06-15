# DS-A1-S2-PSW-TP

Projeto PSW com API REST em Node.js, Express e MySQL, com frontend HTML simples.

## Requisitos

- Node.js
- MySQL a correr localmente

## Instalação

1. Instalar dependencias:

```bash
npm install
```

2. Criar a base de dados e as tabelas:

```bash
npm run setup
```

3. Iniciar o servidor:

```bash
npm start
```

4. Abrir no navegador:

```text
http://localhost:3008
```

## Funcionalidades

- Listagem, criacao, edicao e eliminacao de jogos
- Filtro por categoria
- Vista com JOIN entre jogos e categorias
- Frontend separado em `public/index.html`, `public/styles.css` e `public/script.js`

## API principal

- `GET /api/jogos`
- `GET /api/jogos/:id`
- `POST /api/jogos`
- `PUT /api/jogos/:id`
- `DELETE /api/jogos/:id`
- `GET /api/categorias`
- `GET /api/jogos-categorias`
- `GET /api/categorias/:id/jogos`