*** db.js ***
Ficheiro utilizado pelo server.js para aceder à base de dads
Objetivo: Criar e exportar a ligação à base de dados MySQL


*** setup-database.js ***
Este ficheiro deve ser executado apenas uma vez para preprar a base de dados
Objetivo: Criar a base de dados, criar a tabela categorias, jogos e clientes e fazer alguns inputs.


*** server.js ***
Objetivos: criar a API REST que permite gerir as coisas guardadas na base de dados MySQL

GET -> Listar/Obter
POST -> Adicionar
PUT -> Atualizar
DELETE -> Apagar

POST e PUT -> colocar o body em JSON, copiar script do get para adicionar jogo novo

base de dados: loja que vende videojogos
tabelas: categorias, jogos, clientes
    categorias: 
            Corrida
            Terror
            Tiro
            Retro
    jogos: 
            Forza Horizon 6 + Gran Turismo 7
            Resident Evil Requiem + Silent Hill f
            Halo: Combat Envolved + (Doom Eternal (adicionado no POST))
            Streets of Rage + Golden axe trilogy    
    clientes:
            Raquel Azevedo
            Carlos Costa
            Maria Novais
            Samuel Pinto


# mudar " para ` nas cenas tipo datagrip