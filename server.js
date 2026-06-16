//Importar o Express
const express = require("express");

// Importar a ligação à base de dados
const pool = require("./db");

// Criar uma aplicação Express
const app = express();

// Definir a porta onde servidor vai ouvir
const PORT = 3008;

// Middleware para permitir ler JSON enviado no corpo dos pedidos
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "Rota inicial funcional"
    })
})



// --- CATEGORIAS ---
//GET - Listar todas as categorias
app.get("/api/categorias", async (req, res) => {
    try {
        const [categorias] = await pool.query("SELECT * FROM categorias");

        res.json(categorias)
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao obter categorias da base de dados"
        })
    }
});


//GET - Obter uma categoria pelo ID
app.get("/api/categorias/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O ID deve ser um número válido"
            })
        }

        const [categorias] = await pool.query(
            "SELECT * FROM categorias WHERE id = ?",
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                erro: "Categoria não encontrada"
            })
        }

        res.json(categorias[0]);

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao obter categoria da base de dados"
        })
    }
})


//POST - Criar categoria nova
app.post("/api/categorias", async (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: "O nome é obrigatório"
            })
        }

        const [resultado] = await pool.query(
            "INSERT INTO categorias (nome) VALUES (?)",
            [nome]
        )

        res.status(201).json({
            id: resultado.insertId,
            nome: nome
        })
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao criar categoria"
        })
    }
})


//PUT - Atualizar categoria existente
app.put("/api/categorias/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O ID deve ser um número."
            })
        }

        if (!nome) {
            return res.status(400).json({
                erro: "O nome é obrigatório"
            })
        }

        const [resultado] = await pool.query(
            "UPDATE categorias SET nome = ? WHERE id = ?",
            [nome, id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Categoria não encontrada."
            })
        }

        res.status(200).json({
            mensagem: "Categoria atualizada com sucesso.",
            categoria: {
                id: id,
                nome: nome
            }
        })

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao atualizar categoria"
        })
    }
})


//DELETE - Eliminar categoria
app.delete("/api/categorias/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O id deve ser um número."
            })
        }

        const [resultado] = await pool.query(
            "DELETE FROM categorias WHERE id = ?",
            [id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                erro: "Categoria não encontrada" 
            })
        }

        res.json({ 
            mensagem: "Categoria removida com sucesso" 
        })

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao eliminar categoria." 
        })
    }
})



// --- JOGOS ---
//GET - Listar todos os jogos
app.get("/api/jogos", async (req, res) => {
    try {
        const [jogos] = await pool.query("SELECT * FROM jogos");

        res.json(jogos)
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao obter jogos da base de dados"
        })
    }
});


//GET - Obter um jogo pelo ID
app.get("/api/jogos/:id", async (req, res) => {
    try {
        // Obter o ID do jogo a partir dos parâmetros da rota
        const id = Number(req.params.id);

        // Verificar se o ID é um número válido
        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O ID deve ser um número válido"
            })
        }

        // Consultar a base de dados para obter o jogo com o ID fornecido
        const [jogos] = await pool.query(
            "SELECT * FROM jogos WHERE id = ?",
            [id]
        );

        // Verificar se o jogo foi encontrado
        if (jogos.length === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado"
            })
        }

        // Devolver o jogo encontrado
        res.json(jogos[0]);

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao obter jogo da base de dados"
        })
    }
})


//POST - Criar jogo novo
app.post("/api/jogos", async (req, res) => {
    try {
        const { nome, quantidade, preco, id_categoria } = req.body;

        if (!nome || preco === undefined || preco === "" || isNaN(Number(preco)) || Number(preco) < 0
            || quantidade === undefined || quantidade === "" || isNaN(Number(quantidade)) || Number(quantidade) < 0
            || id_categoria === undefined || id_categoria === "" || isNaN(Number(id_categoria)) || Number(id_categoria) <= 0
        ) {
            return res.status(400).json({
                erro: "O nome é obrigatório, preço e quantidade devem ser números não negativos, e id_categoria deve ser um número válido"
            })
        }

        // Introduzir o jogo na base de dados
        const [resultado] = await pool.query(
            "INSERT INTO jogos (nome, quantidade, preco, id_categoria) VALUES (?, ?, ?, ?)",
            [nome, Number(quantidade), Number(preco), Number(id_categoria)]
        )

        res.status(201).json({
            id: resultado.insertId,
            nome: nome,
            quantidade: Number(quantidade),
            preco: Number(preco),
            id_categoria: Number(id_categoria)
        })
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao criar jogo"
        })
    }
})


//PUT - Atualizar jogo existente
app.put("/api/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, quantidade, preco, id_categoria } = req.body;

        // Validar ID
        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O ID deve ser um número."
            })
        }

        // Validações para nome, preço e quantidade
        if (!nome || preco === undefined || preco === "" || isNaN(Number(preco)) || Number(preco) <= 0
            || quantidade === undefined || quantidade === "" || isNaN(Number(quantidade)) || Number(quantidade) <= 0
            || id_categoria === undefined || id_categoria === "" || isNaN(Number(id_categoria)) || Number(id_categoria) <= 0
        ) {
            return res.status(400).json({
                erro: "O nome é obrigatório, preço e a quantidade devem ser um número superior a zero, e a categoria deve ser válida"
            })
        }

        // Atualizar o jogo na base de dados
        const [resultado] = await pool.query(
            "UPDATE jogos SET nome = ?, quantidade = ?, preco = ?, id_categoria = ? WHERE id = ?",
            [nome, Number(quantidade), Number(preco), Number(id_categoria), id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado."
            })
        }

        res.status(200).json({
            mensagem: "Jogo atualizado com sucesso.",
            jogo: {
                id: id,
                nome: nome,
                quantidade: Number(quantidade),
                preco: Number(preco),
                id_categoria: Number(id_categoria)
            }
        })

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao atualizar jogo"
        })
    }
})


//DELETE - Eliminar jogo
app.delete("/api/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar id
        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O id deve ser um número."
            })
        }

        // Eliminar o jogo da base de dados
        const [resultado] = await pool.query(
            "DELETE FROM jogos WHERE id = ?",
            [id]
        )

        // Validar se apagou
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado"
            })
        }

        res.json({
            mensagem: "Jogo removido com sucesso"
        })

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao eliminar jogo."
        })
    }
})

// Rota com JOIN (jogo e a sua respetiva categoria)
app.get("/api/jogos-categorias", async (req, res) => {
    try {
        const [resultado] = await pool.query(`
            SELECT 
                jogos.id,
                jogos.nome,
                jogos.quantidade,
                jogos.preco,
                jogos.id_categoria,
                categorias.nome AS categoria
            FROM jogos
            INNER JOIN categorias
                ON jogos.id_categoria = categorias.id
        `);

        res.json(resultado);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao obter jogos com categorias" });
    }
});


// Endpoint de relação por chave estrangeira
app.get("/api/categorias/:id/jogos", async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar o ID
        if (isNaN(id)) {
            return res.status(400).json({ erro: "O ID da categoria deve ser um número válido" });
        }

        // Consultar jogos que pertencem à categoria indicada
        const [resultado] = await pool.query(`
            SELECT 
                jogos.id,
                jogos.nome,
                jogos.quantidade,
                jogos.preco,
                jogos.id_categoria,
                categorias.nome AS categoria
            FROM jogos
            INNER JOIN categorias
                ON jogos.id_categoria = categorias.id
            WHERE categorias.id = ?
        `, [id]);

        // Verificar se há jogos nessa categoria
        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Nenhum jogo encontrado para esta categoria" });
        }

        res.json(resultado);

    } catch (erro) {
        res.status(500).json({ erro: "Erro ao obter jogos da categoria" });
    }
});



// --- CLIENTES ---
//GET - Listar todos os clientes
app.get("/api/clientes", async (req, res) => {
    try {
        const [clientes] = await pool.query("SELECT * FROM clientes");

        res.json(clientes)
    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao obter clientes da base de dados" 
        })
    }
});

//GET - Obter um cliente pelo ID
app.get("/api/clientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O ID deve ser um número válido" 
            })
        }

        const [clientes] = await pool.query(
            "SELECT * FROM clientes WHERE id = ?",
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({ 
                erro: "Cliente não encontrado" 
            })
        }

        res.json(clientes[0]);

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao obter cliente da base de dados" 
        })
    }
})

//POST - Criar cliente novo
app.post("/api/clientes", async (req, res) => {
    try {
        const { nome, email, telemovel } = req.body;

        if (!nome || !email || telemovel === undefined || telemovel === "" || isNaN(Number(telemovel)) || Number(telemovel) <= 0) {
            return res.status(400).json({ 
                erro: "Nome, email e telemóvel válidos são obrigatórios" 
            })
        }

        const [resultado] = await pool.query(
            "INSERT INTO clientes (nome, email, telemovel) VALUES (?, ?, ?)",
            [nome, email, Number(telemovel)]
        )

        res.status(201).json({
            id: resultado.insertId,
            nome: nome,
            email: email,
            telemovel: Number(telemovel)
        })
    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao criar cliente" 
        })
    }
})

//PUT - Atualizar cliente existente
app.put("/api/clientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, email, telemovel } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O ID deve ser um número." 
            })
        }

        if (!nome || !email || telemovel === undefined || telemovel === "" || isNaN(Number(telemovel)) || Number(telemovel) <= 0) {
            return res.status(400).json({ 
                erro: "Nome, email e telemóvel válidos são obrigatórios" 
            })
        }

        const [resultado] = await pool.query(
            "UPDATE clientes SET nome = ?, email = ?, telemovel = ? WHERE id = ?",
            [nome, email, Number(telemovel), id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                erro: "Cliente não encontrado." 
            })
        }

        res.status(200).json({
            mensagem: "Cliente atualizado com sucesso.",
            cliente: { 
                id: id, 
                nome: nome, 
                email: email, 
                telemovel: Number(telemovel) 
            }
        })

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao atualizar cliente" 
        })
    }
})

//DELETE - Eliminar cliente
app.delete("/api/clientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O id deve ser um número." 
            })
        }

        const [resultado] = await pool.query(
            "DELETE FROM clientes WHERE id = ?",
            [id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                erro: "Cliente não encontrado" 
            })
        }

        res.json({ 
            mensagem: "Cliente removido com sucesso" 
        })

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao eliminar cliente."
        })
    }
})


// --- FAVORITOS ---
//GET - Listar todos os favoritos
app.get("/api/favoritos", async (req, res) => {
    try {
        const [favoritos] = await pool.query("SELECT * FROM favoritos");

        res.json(favoritos)
    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao obter favoritos da base de dados" 
        })
    }
});


//GET - Obter um favorito pelo ID
app.get("/api/favoritos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O ID deve ser um número válido" 
            })
        }

        const [favoritos] = await pool.query(
            "SELECT * FROM favoritos WHERE id = ?",
            [id]
        );

        if (favoritos.length === 0) {
            return res.status(404).json({ 
                erro: "Favorito não encontrado" 
            })
        }

        res.json(favoritos[0]);

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao obter favorito da base de dados" 
        })
    }
})


//POST - Criar favorito novo
app.post("/api/favoritos", async (req, res) => {
    try {
        const { id_cliente, id_jogo } = req.body;

        if (id_cliente === undefined || id_cliente === "" || isNaN(Number(id_cliente)) || Number(id_cliente) <= 0
            || id_jogo === undefined || id_jogo === "" || isNaN(Number(id_jogo)) || Number(id_jogo) <= 0
        ) {
            return res.status(400).json({ 
                erro: "id_cliente e id_jogo válidos são obrigatórios" 
            })
        }

        const [resultado] = await pool.query(
            "INSERT INTO favoritos (id_cliente, id_jogo) VALUES (?, ?)",
            [Number(id_cliente), Number(id_jogo)]
        )

        res.status(201).json({
            id: resultado.insertId,
            id_cliente: Number(id_cliente),
            id_jogo: Number(id_jogo)
        })
    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao criar favorito" 
        })
    }
})


//PUT - Atualizar favorito existente
app.put("/api/favoritos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { id_cliente, id_jogo } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O ID deve ser um número." 
            })
        }

        if (id_cliente === undefined || id_cliente === "" || isNaN(Number(id_cliente)) || Number(id_cliente) <= 0
            || id_jogo === undefined || id_jogo === "" || isNaN(Number(id_jogo)) || Number(id_jogo) <= 0
        ) {
            return res.status(400).json({ 
                erro: "id_cliente e id_jogo válidos são obrigatórios" 
            })
        }

        const [resultado] = await pool.query(
            "UPDATE favoritos SET id_cliente = ?, id_jogo = ? WHERE id = ?",
            [Number(id_cliente), Number(id_jogo), id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                erro: "Favorito não encontrado." 
            })
        }

        res.status(200).json({
            mensagem: "Favorito atualizado com sucesso.",
            favorito: { 
                id: id, 
                id_cliente: Number(id_cliente), 
                id_jogo: Number(id_jogo) 
            }
        })

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao atualizar favorito" 
        })
    }
})


//DELETE - Eliminar favorito
app.delete("/api/favoritos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ 
                erro: "O id deve ser um número." 
            })
        }

        const [resultado] = await pool.query(
            "DELETE FROM favoritos WHERE id = ?",
            [id]
        )

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ 
                erro: "Favorito não encontrado" 
            })
        }

        res.json({ 
            mensagem: "Favorito removido com sucesso" 
        })

    } catch (erro) {
        res.status(500).json({ 
            erro: "Erro ao eliminar favorito." 
        })
    }
})



// Rota inexistente
app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada"
    })
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});