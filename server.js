//Importar o Express
const express = require("express");
const path = require("path");

// Importar a ligação à base de dados
const pool = require("./db");

// Criar uma aplicação Express
const app = express();

// Definir a porta onde servidor vai ouvir
const PORT = 3008;

// Middleware para permitir ler JSON enviado no corpo dos pedidos
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

// --- CATEGORIAS ---
app.get("/api/categorias", async (req, res) => {
    try {
        const [categorias] = await pool.query("SELECT * FROM categorias ORDER BY nome");

        res.json(categorias);
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao obter categorias da base de dados"
        });
    }
});

app.post("/api/categorias", async (req, res) => {
    try {
        const nome = String(req.body.nome || "").trim();

        if (!nome) {
            return res.status(400).json({
                erro: "O nome da categoria é obrigatório"
            });
        }

        const [categoriaExistente] = await pool.query(
            "SELECT id FROM categorias WHERE LOWER(nome) = LOWER(?) LIMIT 1",
            [nome]
        );

        if (categoriaExistente.length > 0) {
            return res.status(400).json({
                erro: "Já existe uma categoria com esse nome"
            });
        }

        const [resultado] = await pool.query(
            "INSERT INTO categorias (nome) VALUES (?)",
            [nome]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome
        });
    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao criar categoria"
        });
    }
});


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

//POST - Criar um jogo novo
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
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao criar jogo"
        })
    }
})

//PUT - Atualizar um jogo existente
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

        res.json({
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

//DELETE - Apagar pelo jogo
app.delete("/api/jogos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validar id
        if (isNaN(id)) {
            return res.status(400).json({
                erro: "O id deve ser um número."
            })
        }

        // Apagar o jogo da base de dados
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
            erro: "Erro ao apagar jogo."
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


// Rota inexistente
app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada"
    })
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servior a correr em http://localhost:${PORT}`);
});