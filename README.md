# Trabalho Prático Final - API Loja de Videojogos
Trabalho Prático Final da unidade curricular **Programação Servidor-Web**  
Curso de Desenvolvimento de Software - ISTEC  
Ano Letivo 2025/2026  
Docente: Mário Amorim  
Alunos: Raquel Azevedo 2025043
        Carlos Costa 2025086
        Maria Novais 2025041

---

## Descrição
Este projeto consiste numa aplicação web para gestão de uma loja de videojogos, desenvolvida com Node.js, Express e MySQL.

A aplicação disponibiliza uma API REST que permite gerir jogos e categorias, seguindo a estrutura prática de Programação de Serviços Web: criação de um projeto Node.js, ligação a uma base de dados MySQL, implementação de operações CRUD e utilização de relações entre tabelas.

Além da API, o projeto inclui um frontend simples em HTML, CSS e JavaScript, servido pela própria aplicação Express, onde é possível consultar, adicionar, editar e eliminar registos.

---

## Funcionalidades
- Gestão de jogos:
  - listar todos os jogos;
  - consultar um jogo pelo ID;
  - adicionar, editar e eliminar jogos.
- Gestão de categorias:
  - listar todas as categorias;
  - listar os jogos associados a uma categoria.
- Relacionamento entre tabelas:
  - cada jogo está associado a uma categoria;
  - as chaves estrangeiras usam `ON DELETE SET NULL` e `ON UPDATE CASCADE`.
- Frontend com interface para gerir jogos.
- Validação básica dos dados recebidos pela API.
- Respostas em formato JSON.
- Tratamento de erros e resposta `404` para rotas inexistentes.

---

## Estrutura do Projeto
```
├── db.js                    # Configuração da ligação à base de dados MySQL
├── package.json             # Dependências do projeto
├── package-lock.json        # Lock file das dependências
├── README.md                # Este ficheiro
├── server.js                # API REST principal
├── setup-database.js        # Script para criar a base de dados e dados iniciais
└── public/
    ├── app.js               # Lógica do frontend para consumir a API
    ├── index.html           # Página principal do frontend
    └── styles.css           # Estilos da interface
```

- `server.js`: ficheiro principal da aplicação. Configura o Express, serve o frontend e contém as rotas da API.
- `db.js`: configura a ligação à base de dados MySQL através de uma pool de ligações.
- `setup-database.js`: cria a base de dados, as tabelas e os dados iniciais.
- `public/index.html`: página principal do frontend.
- `public/app.js`: lógica do frontend para consumir a API.
- `public/styles.css`: estilos da interface.

---

## Tecnologias utilizadas
- Node.js
- Express
- MySQL
- mysql2
- HTML5
- CSS
- JavaScript
- API REST
- JSON

---

## Base de Dados
A aplicação utiliza a base de dados **psw_projetofinal**.

Tabelas criadas:

- `categorias`
  - `id`: INT AUTO_INCREMENT PRIMARY KEY
  - `nome`: VARCHAR(100) NOT NULL
- `jogos`
  - `id`: INT AUTO_INCREMENT PRIMARY KEY
  - `nome`: VARCHAR(150) NOT NULL
  - `quantidade`: INT NOT NULL
  - `preco`: DECIMAL(10, 2) NOT NULL
  - `id_categoria`: INT
  - Chave estrangeira: `FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE`
- `clientes`
  - `id`: INT AUTO_INCREMENT PRIMARY KEY
  - `nome`: VARCHAR(100) NOT NULL
- `favoritos`
  - `id`: INT AUTO_INCREMENT PRIMARY KEY
  - `id_cliente`: INT
  - `id_jogo`: INT
  - Chave estrangeira: `FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE ON UPDATE CASCADE`
  - Chave estrangeira: `FOREIGN KEY (id_jogo) REFERENCES jogos(id) ON DELETE CASCADE ON UPDATE CASCADE`

A tabela `jogos` está relacionada com `categorias` através de chaves estrangeiras.

---

## Endpoints da API

### Inicial

| Método | Endpoint | Descrição                             |
| ------ | -------- | ------------------------------------- |
| GET    | `/`      | Serve a página HTML do frontend       |

### Categorias

| Método | Endpoint                    | Descrição                        |
| ------ | --------------------------- | -------------------------------- |
| GET    | `/api/categorias`           | Lista todas as categorias        |
| GET    | `/api/categorias/:id/jogos` | Lista os jogos de uma categoria  |

### Jogos

| Método | Endpoint               | Descrição                             |
| ------ | -----------------------| ------------------------------------- |
| GET    | `/api/jogos`           | Lista todos os jogos                  |
| GET    | `/api/jogos/:id`       | Obtém um jogo pelo ID                 |
| GET    | `/api/jogos-categorias`| Lista jogos com suas categorias       |
| POST   | `/api/jogos`           | Adiciona um novo jogo                 |
| PUT    | `/api/jogos/:id`       | Atualiza um jogo existente            |
| DELETE | `/api/jogos/:id`       | Elimina um jogo                       |

---

## Exemplos de Requisições

### Criar um jogo (POST)
```bash
curl -X POST http://localhost:3008/api/jogos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Forza Horizon 6",
    "quantidade": 10,
    "preco": 59.99,
    "id_categoria": 1
  }'
```

### Atualizar um jogo (PUT)
```bash
curl -X PUT http://localhost:3008/api/jogos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Forza Horizon 6",
    "quantidade": 15,
    "preco": 49.99,
    "id_categoria": 1
  }'
```

### Obter um jogo (GET)
```bash
curl http://localhost:3008/api/jogos/1
```

### Eliminar um jogo (DELETE)
```bash
curl -X DELETE http://localhost:3008/api/jogos/1
```

---

### Instalação
1. **Instalar o Node.js no sistema**
```bash
node -v
```

2. **Criar o projeto no VS Code:**
```bash
npm init -y
```

3. **Configure a base de dados:**
```bash
npm run setup
```

4. **Iniciar o servidor:**
```bash
npm start
```

5. **Abrir a aplicação no navegador:**
```
http://localhost:3008
```

A API fica disponível a partir de:
```
http://localhost:3008/api
```

---

## Validações

A API implementa as seguintes validações:

- **Nome do jogo**: Campo obrigatório
- **Preço**: Deve ser um número válido e positivo
- **Quantidade**: Deve ser um número válido e não negativo
- **ID Categoria**: Deve ser um número válido e maior que zero
- **ID do Jogo**: Deve ser um número válido

---

## Tratamento de Erros
A aplicação retorna mensagens de erro estruturadas em JSON:

```json
{
  "erro": "Descrição do erro"
}
```

Com os respetivos códigos HTTP:
- **400** - Requisição inválida (dados faltando ou inválidos)
- **404** - Recurso não encontrado
- **500** - Erro no servidor

---