const mysql = require("mysql2/promise");

async function setupDatabase() {
    let connection;

    try {
        // Criar uma ligação ao MySQL sem indicar ainda a base de dados
        connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: ""
        });

        console.log("Ligação ao MySQL estabelecida com sucesso");

        // Criar a base de dados se ela não existir
        await connection.query("CREATE DATABASE IF NOT EXISTS psw_projetofinal");
        console.log("Base de dados 'psw_projetofinal' criada ou já existente.");

        // Selecionar a base de dados
        await connection.query("USE psw_projetofinal");
        console.log("Base de dados 'psw_projetofinal' selecionada.");

        // Tabela categorias
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL
            )
        `);
        console.log("Tabela 'categorias' criada ou já existente.");

        // Tabela jogos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS jogos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                quantidade INT NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                id_categoria INT,
                    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
            )
        `);
        console.log("Tabela 'jogos' criada ou já existente.");

        // Tabela clientes
        await connection.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telemovel INT NOT NULL
            )
        `);
        console.log("Tabela 'clientes' criada ou já existente.");

        // Tabela favoritos
        await connection.query(`
            CREATE TABLE IF NOT EXISTS favoritos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_cliente INT NOT NULL,
                id_jogo INT NOT NULL,
                    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
                    FOREIGN KEY (id_jogo) REFERENCES jogos(id)
            );
        `);
        console.log("Tabela 'favoritos' criada ou já existente.");


        // Verificar se a tabela tem categorias
        const [categoriasrows] = await connection.query(
            `SELECT COUNT(*) as total FROM categorias`
        );
        console.log(`Número de categorias na tabela: ${categoriasrows[0].total}`);

        if (categoriasrows[0].total === 0) {
            // Adicionar categorias se a a tabela estiver vazia
            await connection.query(`
                INSERT INTO categorias (nome) 
            VALUES
                ("Corrida"),
                ("Terror"),
                ("Tiro"),
                ("Retro")
                `);
            console.log("Categorias adicionadas com sucesso.");
        }

        // Verificar se a tabela tem jogos
        const [jogosrows] = await connection.query(
            "SELECT COUNT(*) as total FROM jogos"
        );
        console.log(`Número de jogos na tabela: ${jogosrows[0].total}`);

        if (jogosrows[0].total === 0) {
            // Adicionar jogos se a a tabela estiver vazia
            await connection.query(`
                INSERT INTO jogos (nome, quantidade, preco, id_categoria) 
            VALUES
                ("Forza Horizon 6", 60, 99.99, 1),
                ("Gran Turismo 7", 70, 79.99, 1),
                ("Resident Evil Requiem", 90, 69.99, 2),
                ("Silent Hill f", 80, 89.99, 2),
                ("Halo: Combat Envolved", 50, 9.99, 3),
                ("Streets of Rage", 40, 49.99, 4),
                ("Golden Axe trilogy", 30, 39.99, 4)
                `);
            console.log("Jogos adicionados com sucesso.");
        }

        // Verificar se a tabela tem clientes
        const [clientesrows] = await connection.query(
            "SELECT COUNT(*) as total FROM clientes"
        );
        console.log(`Número de clientes na tabela: ${clientesrows[0].total}`);

        if (clientesrows[0].total === 0) {
            // Adicionar clientes se a a tabela estiver vazia
            await connection.query(`
                INSERT INTO clientes (nome, email, telemovel) 
            VALUES
                ("Raquel Azevedo", "raquel@gmail.com", 911111111),
                ("Carlos Costa", "carlos@gmail.com", 922222222),
                ("Maria Novais", "maria@gmail.com", 933333333),
                ("Samuel Pinto", "samuel@gmail.com", 966666666)
                `);
            console.log("Clientes adicionados com sucesso.");
        }

        // Verificar se a tabela tem favoritos
        const [favoritosrows] = await connection.query(
            "SELECT COUNT(*) as total FROM favoritos"
        );
        console.log(`Número de favoritos na tabela: ${favoritosrows[0].total}`);

        if (favoritosrows[0].total === 0) {
            // Adicionar favoritos se a a tabela estiver vazia
            await connection.query(`
                INSERT INTO favoritos (id_cliente, id_jogo) 
            VALUES
                (1, 6),
                (2, 1),
                (3, 4)
                `);
            console.log("Favoritos adicionados com sucesso.");
        }

    } catch (error) {
        console.error("Erro ao conectar ao MySQL:", error.message);
    } finally {
        // Fechar a ligação se ela foi criada
        if (connection) {
            await connection.end();
            console.log("Ligação ao MySQL fechada.");
        }
    }
}

// Executar a função principal
setupDatabase();