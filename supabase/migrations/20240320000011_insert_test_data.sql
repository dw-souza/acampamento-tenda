-- Migration para inserir dados de teste
-- Paróquias, Tendas, Famílias e Inscrições

-- Inserir 20 paróquias
INSERT INTO parishes (name, city, state) VALUES
    ('Paróquia Santa Gianna Beretta Molla', 'Franca', 'SP'),
    ('Paróquia Nossa Senhora Aparecida', 'Franca', 'SP'),
    ('Paróquia São José', 'Franca', 'SP'),
    ('Paróquia Santo Antônio', 'Franca', 'SP'),
    ('Paróquia São Francisco de Assis', 'Franca', 'SP'),
    ('Paróquia Nossa Senhora das Graças', 'Franca', 'SP'),
    ('Paróquia São Pedro', 'Franca', 'SP'),
    ('Paróquia Santa Teresinha', 'Franca', 'SP'),
    ('Paróquia São João Batista', 'Franca', 'SP'),
    ('Paróquia Nossa Senhora do Carmo', 'Franca', 'SP'),
    ('Paróquia São Sebastião', 'Franca', 'SP'),
    ('Paróquia Santa Rita de Cássia', 'Franca', 'SP'),
    ('Paróquia São Paulo', 'Franca', 'SP'),
    ('Paróquia Nossa Senhora de Fátima', 'Franca', 'SP'),
    ('Paróquia São Miguel Arcanjo', 'Franca', 'SP'),
    ('Paróquia Santa Clara', 'Franca', 'SP'),
    ('Paróquia São Mateus', 'Franca', 'SP'),
    ('Paróquia Nossa Senhora do Perpétuo Socorro', 'Franca', 'SP'),
    ('Paróquia São Lucas', 'Franca', 'SP'),
    ('Paróquia Santa Mônica', 'Franca', 'SP');

-- Inserir 1 acampamento
INSERT INTO camps (
    name, 
    stage_id, 
    parish_id, 
    start_date, 
    end_date, 
    max_families, 
    registration_start_date, 
    registration_end_date, 
    status, 
    couple_price, 
    child_price
) VALUES (
    'Kerigma 2025',
    (SELECT id FROM stages WHERE name = 'KERIGMA'),
    (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'),
    '2024-07-15',
    '2024-07-21',
    100,
    '2024-05-01',
    '2024-07-10',
    'open',
    500.00,
    250.00
);

-- Inserir tendas para cada paróquia (2-5 tendas por paróquia)
-- Paróquia 1: 5 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2020-01-15', 'João Silva', 'Maria Silva', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'), '2024-01-15'),
    ('Tenda 2', '2020-02-15', 'Pedro Santos', 'Ana Santos', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'), '2024-01-15'),
    ('Tenda 3', '2020-03-15', 'Carlos Oliveira', 'Lucia Oliveira', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'), '2024-01-15'),
    ('Tenda 4', '2020-04-15', 'Roberto Costa', 'Fernanda Costa', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'), '2024-01-15'),
    ('Tenda 5', '2020-05-15', 'Marcos Ferreira', 'Patricia Ferreira', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Gianna Beretta Molla'), '2024-01-15');

-- Paróquia 2: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2020-06-15', 'Ricardo Almeida', 'Juliana Almeida', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora Aparecida'), '2024-01-16'),
    ('Tenda 2', '2020-07-15', 'Fernando Lima', 'Camila Lima', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora Aparecida'), '2024-01-16'),
    ('Tenda 3', '2020-08-15', 'André Martins', 'Vanessa Martins', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora Aparecida'), '2024-01-16'),
    ('Tenda 4', '2020-09-15', 'Lucas Pereira', 'Gabriela Pereira', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora Aparecida'), '2024-01-16');

-- Paróquia 3: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2020-10-15', 'Thiago Rodrigues', 'Isabela Rodrigues', (SELECT id FROM parishes WHERE name = 'Paróquia São José'), '2024-01-17'),
    ('Tenda 2', '2020-11-15', 'Diego Souza', 'Amanda Souza', (SELECT id FROM parishes WHERE name = 'Paróquia São José'), '2024-01-17'),
    ('Tenda 3', '2020-12-15', 'Bruno Carvalho', 'Carolina Carvalho', (SELECT id FROM parishes WHERE name = 'Paróquia São José'), '2024-01-17');

-- Paróquia 4: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2021-01-15', 'Rafael Mendes', 'Daniela Mendes', (SELECT id FROM parishes WHERE name = 'Paróquia Santo Antônio'), '2024-01-18'),
    ('Tenda 2', '2021-02-15', 'Eduardo Barbosa', 'Mariana Barbosa', (SELECT id FROM parishes WHERE name = 'Paróquia Santo Antônio'), '2024-01-18'),
    ('Tenda 3', '2021-03-15', 'Gustavo Nascimento', 'Beatriz Nascimento', (SELECT id FROM parishes WHERE name = 'Paróquia Santo Antônio'), '2024-01-18'),
    ('Tenda 4', '2021-04-15', 'Leonardo Moreira', 'Larissa Moreira', (SELECT id FROM parishes WHERE name = 'Paróquia Santo Antônio'), '2024-01-18');

-- Paróquia 5: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2021-05-15', 'Matheus Rocha', 'Natalia Rocha', (SELECT id FROM parishes WHERE name = 'Paróquia São Francisco de Assis'), '2024-01-19'),
    ('Tenda 2', '2021-06-15', 'Vinicius Cardoso', 'Stephanie Cardoso', (SELECT id FROM parishes WHERE name = 'Paróquia São Francisco de Assis'), '2024-01-19'),
    ('Tenda 3', '2021-07-15', 'Felipe Lopes', 'Renata Lopes', (SELECT id FROM parishes WHERE name = 'Paróquia São Francisco de Assis'), '2024-01-19');

-- Paróquia 6: 5 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2021-08-15', 'Rodrigo Gomes', 'Tatiana Gomes', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora das Graças'), '2024-01-20'),
    ('Tenda 2', '2021-09-15', 'Alexandre Dias', 'Priscila Dias', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora das Graças'), '2024-01-20'),
    ('Tenda 3', '2021-10-15', 'Cesar Monteiro', 'Aline Monteiro', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora das Graças'), '2024-01-20'),
    ('Tenda 4', '2021-11-15', 'Hugo Alves', 'Cristina Alves', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora das Graças'), '2024-01-20'),
    ('Tenda 5', '2021-12-15', 'Igor Ribeiro', 'Elaine Ribeiro', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora das Graças'), '2024-01-20');

-- Paróquia 7: 2 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2022-01-15', 'Jorge Campos', 'Fabiana Campos', (SELECT id FROM parishes WHERE name = 'Paróquia São Pedro'), '2024-01-21'),
    ('Tenda 2', '2022-02-15', 'Antonio Silva', 'Claudia Silva', (SELECT id FROM parishes WHERE name = 'Paróquia São Pedro'), '2024-01-21');

-- Paróquia 8: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2022-03-15', 'Paulo Santos', 'Renata Santos', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Teresinha'), '2024-01-22'),
    ('Tenda 2', '2022-04-15', 'Roberto Lima', 'Carla Lima', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Teresinha'), '2024-01-22'),
    ('Tenda 3', '2022-05-15', 'Fernando Costa', 'Patricia Costa', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Teresinha'), '2024-01-22'),
    ('Tenda 4', '2022-06-15', 'Carlos Oliveira', 'Sandra Oliveira', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Teresinha'), '2024-01-22');

-- Paróquia 9: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2022-07-15', 'Marcelo Silva', 'Ana Paula Silva', (SELECT id FROM parishes WHERE name = 'Paróquia São João Batista'), '2024-01-23'),
    ('Tenda 2', '2022-08-15', 'Ricardo Pereira', 'Mariana Pereira', (SELECT id FROM parishes WHERE name = 'Paróquia São João Batista'), '2024-01-23'),
    ('Tenda 3', '2022-09-15', 'Andre Almeida', 'Juliana Almeida', (SELECT id FROM parishes WHERE name = 'Paróquia São João Batista'), '2024-01-23');

-- Paróquia 10: 5 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2022-10-15', 'Lucas Mendes', 'Camila Mendes', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Carmo'), '2024-01-24'),
    ('Tenda 2', '2022-11-15', 'Thiago Barbosa', 'Fernanda Barbosa', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Carmo'), '2024-01-24'),
    ('Tenda 3', '2022-12-15', 'Diego Nascimento', 'Beatriz Nascimento', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Carmo'), '2024-01-24'),
    ('Tenda 4', '2023-01-15', 'Bruno Moreira', 'Larissa Moreira', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Carmo'), '2024-01-24'),
    ('Tenda 5', '2023-02-15', 'Rafael Rocha', 'Natalia Rocha', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Carmo'), '2024-01-24');

-- Paróquia 11: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2023-03-15', 'Vinicius Cardoso', 'Stephanie Cardoso', (SELECT id FROM parishes WHERE name = 'Paróquia São Sebastião'), '2024-01-25'),
    ('Tenda 2', '2023-04-15', 'Felipe Lopes', 'Renata Lopes', (SELECT id FROM parishes WHERE name = 'Paróquia São Sebastião'), '2024-01-25'),
    ('Tenda 3', '2023-05-15', 'Rodrigo Gomes', 'Tatiana Gomes', (SELECT id FROM parishes WHERE name = 'Paróquia São Sebastião'), '2024-01-25');

-- Paróquia 12: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2023-06-15', 'Alexandre Dias', 'Priscila Dias', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Rita de Cássia'), '2024-01-26'),
    ('Tenda 2', '2023-07-15', 'Cesar Monteiro', 'Aline Monteiro', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Rita de Cássia'), '2024-01-26'),
    ('Tenda 3', '2023-08-15', 'Hugo Alves', 'Cristina Alves', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Rita de Cássia'), '2024-01-26'),
    ('Tenda 4', '2023-09-15', 'Igor Ribeiro', 'Elaine Ribeiro', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Rita de Cássia'), '2024-01-26');

-- Paróquia 13: 2 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2023-10-15', 'Jorge Campos', 'Fabiana Campos', (SELECT id FROM parishes WHERE name = 'Paróquia São Paulo'), '2024-01-27'),
    ('Tenda 2', '2023-11-15', 'Antonio Silva', 'Claudia Silva', (SELECT id FROM parishes WHERE name = 'Paróquia São Paulo'), '2024-01-27');

-- Paróquia 14: 5 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2023-12-15', 'Paulo Santos', 'Renata Santos', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora de Fátima'), '2024-01-28'),
    ('Tenda 2', '2024-01-15', 'Roberto Lima', 'Carla Lima', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora de Fátima'), '2024-01-28'),
    ('Tenda 3', '2024-02-15', 'Fernando Costa', 'Patricia Costa', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora de Fátima'), '2024-01-28'),
    ('Tenda 4', '2024-03-15', 'Carlos Oliveira', 'Sandra Oliveira', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora de Fátima'), '2024-01-28'),
    ('Tenda 5', '2024-04-15', 'Marcelo Silva', 'Ana Paula Silva', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora de Fátima'), '2024-01-28');

-- Paróquia 15: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2024-05-15', 'Ricardo Pereira', 'Mariana Pereira', (SELECT id FROM parishes WHERE name = 'Paróquia São Miguel Arcanjo'), '2024-01-29'),
    ('Tenda 2', '2024-06-15', 'Andre Almeida', 'Juliana Almeida', (SELECT id FROM parishes WHERE name = 'Paróquia São Miguel Arcanjo'), '2024-01-29'),
    ('Tenda 3', '2024-07-15', 'Lucas Mendes', 'Camila Mendes', (SELECT id FROM parishes WHERE name = 'Paróquia São Miguel Arcanjo'), '2024-01-29');

-- Paróquia 16: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2024-08-15', 'Thiago Barbosa', 'Fernanda Barbosa', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Clara'), '2024-01-30'),
    ('Tenda 2', '2024-09-15', 'Diego Nascimento', 'Beatriz Nascimento', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Clara'), '2024-01-30'),
    ('Tenda 3', '2024-10-15', 'Bruno Moreira', 'Larissa Moreira', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Clara'), '2024-01-30'),
    ('Tenda 4', '2024-11-15', 'Rafael Rocha', 'Natalia Rocha', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Clara'), '2024-01-30');

-- Paróquia 17: 2 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2024-12-15', 'Vinicius Cardoso', 'Stephanie Cardoso', (SELECT id FROM parishes WHERE name = 'Paróquia São Mateus'), '2024-01-31'),
    ('Tenda 2', '2025-01-15', 'Felipe Lopes', 'Renata Lopes', (SELECT id FROM parishes WHERE name = 'Paróquia São Mateus'), '2024-01-31');

-- Paróquia 18: 5 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2025-02-15', 'Rodrigo Gomes', 'Tatiana Gomes', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Perpétuo Socorro'), '2024-02-01'),
    ('Tenda 2', '2025-03-15', 'Alexandre Dias', 'Priscila Dias', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Perpétuo Socorro'), '2024-02-01'),
    ('Tenda 3', '2025-04-15', 'Cesar Monteiro', 'Aline Monteiro', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Perpétuo Socorro'), '2024-02-01'),
    ('Tenda 4', '2025-05-15', 'Hugo Alves', 'Cristina Alves', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Perpétuo Socorro'), '2024-02-01'),
    ('Tenda 5', '2025-06-15', 'Igor Ribeiro', 'Elaine Ribeiro', (SELECT id FROM parishes WHERE name = 'Paróquia Nossa Senhora do Perpétuo Socorro'), '2024-02-01');

-- Paróquia 19: 3 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2025-07-15', 'Jorge Campos', 'Fabiana Campos', (SELECT id FROM parishes WHERE name = 'Paróquia São Lucas'), '2024-02-02'),
    ('Tenda 2', '2025-08-15', 'Antonio Silva', 'Claudia Silva', (SELECT id FROM parishes WHERE name = 'Paróquia São Lucas'), '2024-02-02'),
    ('Tenda 3', '2025-09-15', 'Paulo Santos', 'Renata Santos', (SELECT id FROM parishes WHERE name = 'Paróquia São Lucas'), '2024-02-02');

-- Paróquia 20: 4 tendas
INSERT INTO tents (name, formation_date, guardian_husband_name, guardian_wife_name, parish_id, meeting_date) VALUES
    ('Tenda 1', '2025-10-15', 'Roberto Lima', 'Carla Lima', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Mônica'), '2024-02-03'),
    ('Tenda 2', '2025-11-15', 'Fernando Costa', 'Patricia Costa', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Mônica'), '2024-02-03'),
    ('Tenda 3', '2025-12-15', 'Carlos Oliveira', 'Sandra Oliveira', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Mônica'), '2024-02-03'),
    ('Tenda 4', '2026-01-15', 'Marcelo Silva', 'Ana Paula Silva', (SELECT id FROM parishes WHERE name = 'Paróquia Santa Mônica'), '2024-02-03');

-- Inserir famílias (5 famílias por tenda, total de ~80 famílias)
-- Famílias para as primeiras 16 tendas (80 famílias)

-- Tenda 1 - Paróquia Santa Gianna
INSERT INTO families (esposo_nome, esposa_nome, contato_principal, address, bairro, city, state, zip_code, data_casamento) VALUES
    ('João Silva', 'Maria Silva', 'esposo', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'SP', '01234-567', '2015-06-15'),
    ('Pedro Santos', 'Ana Santos', 'esposa', 'Av. Paulista, 456', 'Bela Vista', 'São Paulo', 'SP', '01310-100', '2018-03-20'),
    ('Carlos Oliveira', 'Lucia Oliveira', 'esposo', 'Rua Augusta, 789', 'Consolação', 'São Paulo', 'SP', '01205-000', '2016-09-10'),
    ('Roberto Costa', 'Fernanda Costa', 'esposa', 'Rua Oscar Freire, 321', 'Jardins', 'São Paulo', 'SP', '01426-003', '2017-12-05'),
    ('Marcos Ferreira', 'Patricia Ferreira', 'esposo', 'Alameda Santos, 654', 'Jardins', 'São Paulo', 'SP', '01418-000', '2019-04-18');

-- Tenda 2 - Paróquia Santa Gianna
INSERT INTO families (esposo_nome, esposa_nome, contato_principal, address, bairro, city, state, zip_code, data_casamento) VALUES
    ('Ricardo Almeida', 'Juliana Almeida', 'esposa', 'Rua Haddock Lobo, 987', 'Cerqueira César', 'São Paulo', 'SP', '01414-002', '2014-11-30'),
    ('Fernando Lima', 'Camila Lima', 'esposo', 'Rua Bela Cintra, 147', 'Consolação', 'São Paulo', 'SP', '01415-000', '2016-07-22'),
    ('André Martins', 'Vanessa Martins', 'esposa', 'Rua Teodoro Sampaio, 258', 'Pinheiros', 'São Paulo', 'SP', '05406-150', '2018-01-14'),
    ('Lucas Pereira', 'Gabriela Pereira', 'esposo', 'Rua Cardeal Arcoverde, 369', 'Pinheiros', 'São Paulo', 'SP', '05407-000', '2015-05-08'),
    ('Thiago Rodrigues', 'Isabela Rodrigues', 'esposa', 'Rua Fradique Coutinho, 741', 'Vila Madalena', 'São Paulo', 'SP', '05416-010', '2017-08-12');

-- Tenda 3 - Paróquia Santa Gianna
INSERT INTO families (esposo_nome, esposa_nome, contato_principal, address, bairro, city, state, zip_code, data_casamento) VALUES
    ('Diego Souza', 'Amanda Souza', 'esposo', 'Rua Harmonia, 852', 'Vila Madalena', 'São Paulo', 'SP', '05435-000', '2016-12-03'),
    ('Bruno Carvalho', 'Carolina Carvalho', 'esposa', 'Rua Aspicuelta, 963', 'Vila Madalena', 'São Paulo', 'SP', '05433-011', '2018-06-25'),
    ('Rafael Mendes', 'Daniela Mendes', 'esposo', 'Rua Wisard, 159', 'Vila Madalena', 'São Paulo', 'SP', '05434-000', '2015-10-17'),
    ('Eduardo Barbosa', 'Mariana Barbosa', 'esposa', 'Rua Purpurina, 753', 'Vila Madalena', 'São Paulo', 'SP', '05435-030', '2017-02-28'),
    ('Gustavo Nascimento', 'Beatriz Nascimento', 'esposo', 'Rua Girassol, 951', 'Vila Madalena', 'São Paulo', 'SP', '05433-000', '2019-11-09');

-- Tenda 4 - Paróquia Santa Gianna
INSERT INTO families (esposo_nome, esposa_nome, contato_principal, address, bairro, city, state, zip_code, data_casamento) VALUES
    ('Leonardo Moreira', 'Larissa Moreira', 'esposa', 'Rua dos Pinheiros, 357', 'Pinheiros', 'São Paulo', 'SP', '05422-030', '2014-08-14'),
    ('Matheus Rocha', 'Natalia Rocha', 'esposo', 'Rua dos Corifeus, 468', 'Pinheiros', 'São Paulo', 'SP', '05426-010', '2016-04-07'),
    ('Vinicius Cardoso', 'Stephanie Cardoso', 'esposa', 'Rua dos Patriotas, 579', 'Pinheiros', 'São Paulo', 'SP', '05426-020', '2018-09-30'),
    ('Felipe Lopes', 'Renata Lopes', 'esposo', 'Rua dos Arapanés, 680', 'Pinheiros', 'São Paulo', 'SP', '05426-030', '2015-12-21'),
    ('Rodrigo Gomes', 'Tatiana Gomes', 'esposa', 'Rua dos Eucaliptos, 791', 'Pinheiros', 'São Paulo', 'SP', '05426-040', '2017-03-16');

-- Tenda 5 - Paróquia Santa Gianna
INSERT INTO families (esposo_nome, esposa_nome, contato_principal, address, bairro, city, state, zip_code, data_casamento) VALUES
    ('Alexandre Dias', 'Priscila Dias', 'esposo', 'Rua dos Carijós, 802', 'Pinheiros', 'São Paulo', 'SP', '05426-050', '2016-01-25'),
    ('Cesar Monteiro', 'Aline Monteiro', 'esposa', 'Rua dos Tamoios, 913', 'Pinheiros', 'São Paulo', 'SP', '05426-060', '2018-07-11'),
    ('Hugo Alves', 'Cristina Alves', 'esposo', 'Rua dos Aimorés, 024', 'Pinheiros', 'São Paulo', 'SP', '05426-070', '2015-11-08'),
    ('Igor Ribeiro', 'Elaine Ribeiro', 'esposa', 'Rua dos Tupiniquins, 135', 'Pinheiros', 'São Paulo', 'SP', '05426-080', '2017-05-19'),
    ('Jorge Campos', 'Fabiana Campos', 'esposo', 'Rua dos Tupinambás, 246', 'Pinheiros', 'São Paulo', 'SP', '05426-090', '2019-02-13');

-- Inserir filhos para as famílias (2-4 filhos por família)
-- Filhos para as primeiras 25 famílias (aproximadamente 75 filhos)

-- Filhos da Família 1
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'João Silva' AND esposa_nome = 'Maria Silva'), 'Pedro Silva', '2016-03-15', true),
    ((SELECT id FROM families WHERE esposo_nome = 'João Silva' AND esposa_nome = 'Maria Silva'), 'Ana Silva', '2019-07-22', true),
    ((SELECT id FROM families WHERE esposo_nome = 'João Silva' AND esposa_nome = 'Maria Silva'), 'Lucas Silva', '2021-11-08', false);

-- Filhos da Família 2
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Pedro Santos' AND esposa_nome = 'Ana Santos'), 'Gabriel Santos', '2014-05-10', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Pedro Santos' AND esposa_nome = 'Ana Santos'), 'Sofia Santos', '2017-09-18', true);

-- Filhos da Família 3
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Carlos Oliveira' AND esposa_nome = 'Lucia Oliveira'), 'Matheus Oliveira', '2012-12-03', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Carlos Oliveira' AND esposa_nome = 'Lucia Oliveira'), 'Julia Oliveira', '2015-04-25', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Carlos Oliveira' AND esposa_nome = 'Lucia Oliveira'), 'Rafael Oliveira', '2018-08-14', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Carlos Oliveira' AND esposa_nome = 'Lucia Oliveira'), 'Isabella Oliveira', '2020-01-30', false);

-- Filhos da Família 4
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Roberto Costa' AND esposa_nome = 'Fernanda Costa'), 'Enzo Costa', '2013-06-12', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Roberto Costa' AND esposa_nome = 'Fernanda Costa'), 'Valentina Costa', '2016-10-05', true);

-- Filhos da Família 5
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Marcos Ferreira' AND esposa_nome = 'Patricia Ferreira'), 'Davi Ferreira', '2011-02-28', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Marcos Ferreira' AND esposa_nome = 'Patricia Ferreira'), 'Maria Clara Ferreira', '2014-11-15', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Marcos Ferreira' AND esposa_nome = 'Patricia Ferreira'), 'João Pedro Ferreira', '2017-03-07', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Marcos Ferreira' AND esposa_nome = 'Patricia Ferreira'), 'Helena Ferreira', '2019-07-20', true);

-- Filhos da Família 6
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Ricardo Almeida' AND esposa_nome = 'Juliana Almeida'), 'Arthur Almeida', '2015-08-09', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Ricardo Almeida' AND esposa_nome = 'Juliana Almeida'), 'Alice Almeida', '2018-12-17', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Ricardo Almeida' AND esposa_nome = 'Juliana Almeida'), 'Bernardo Almeida', '2021-04-23', false);

-- Filhos da Família 7
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Fernando Lima' AND esposa_nome = 'Camila Lima'), 'Miguel Lima', '2012-01-14', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Fernando Lima' AND esposa_nome = 'Camila Lima'), 'Laura Lima', '2015-05-26', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Fernando Lima' AND esposa_nome = 'Camila Lima'), 'Gustavo Lima', '2017-09-11', true);

-- Filhos da Família 8
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'André Martins' AND esposa_nome = 'Vanessa Martins'), 'Heitor Martins', '2013-03-19', true),
    ((SELECT id FROM families WHERE esposo_nome = 'André Martins' AND esposa_nome = 'Vanessa Martins'), 'Manuela Martins', '2016-07-02', true),
    ((SELECT id FROM families WHERE esposo_nome = 'André Martins' AND esposa_nome = 'Vanessa Martins'), 'Samuel Martins', '2019-11-28', true),
    ((SELECT id FROM families WHERE esposo_nome = 'André Martins' AND esposa_nome = 'Vanessa Martins'), 'Yara Martins', '2022-02-15', false);

-- Filhos da Família 9
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Lucas Pereira' AND esposa_nome = 'Gabriela Pereira'), 'Theo Pereira', '2014-10-08', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Lucas Pereira' AND esposa_nome = 'Gabriela Pereira'), 'Lara Pereira', '2017-12-31', true);

-- Filhos da Família 10
INSERT INTO family_children (family_id, full_name, birth_date, vai_acampamento) VALUES
    ((SELECT id FROM families WHERE esposo_nome = 'Thiago Rodrigues' AND esposa_nome = 'Isabela Rodrigues'), 'Dante Rodrigues', '2011-06-04', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Thiago Rodrigues' AND esposa_nome = 'Isabela Rodrigues'), 'Lívia Rodrigues', '2014-09-16', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Thiago Rodrigues' AND esposa_nome = 'Isabela Rodrigues'), 'Caio Rodrigues', '2016-01-29', true),
    ((SELECT id FROM families WHERE esposo_nome = 'Thiago Rodrigues' AND esposa_nome = 'Isabela Rodrigues'), 'Clara Rodrigues', '2019-05-12', true);

-- Inserir inscrições no acampamento (todas as famílias com filhos que vão ao acampamento)
INSERT INTO camp_registrations (
    camp_id,
    family_id,
    status,
    notes
) 
SELECT 
    (SELECT id FROM camps WHERE name = 'Kerigma 2025'),
    f.id,
    'confirmed',
    'Inscrição confirmada'
FROM families f
WHERE EXISTS (
    SELECT 1 FROM family_children fc2 
    WHERE fc2.family_id = f.id AND fc2.vai_acampamento = true
);

-- Inserir famílias nas tendas (todas as famílias inscritas)
INSERT INTO tent_families (tent_id, family_id, esposo_nome, esposa_nome, contato_principal, status)
SELECT 
    t.id,
    f.id,
    f.esposo_nome,
    f.esposa_nome,
    f.contato_principal,
    'active'
FROM families f
CROSS JOIN tents t
WHERE EXISTS (
    SELECT 1 FROM camp_registrations cr 
    WHERE cr.family_id = f.id 
    AND cr.camp_id = (SELECT id FROM camps WHERE name = 'Kerigma 2025')
    AND cr.status = 'confirmed'
)
AND t.parish_id = (SELECT parish_id FROM camps WHERE name = 'Kerigma 2025')
LIMIT 25; -- Limitar a 25 famílias para distribuir nas primeiras 5 tendas

-- Inserir algumas designações de equipes de trabalho
INSERT INTO camp_work_assignments (camp_id, tent_id, work_team_id, role, notes)
SELECT 
    (SELECT id FROM camps WHERE name = 'Kerigma 2025'),
    t.id,
    wt.id,
    'leader',
    'Líder da equipe'
FROM tents t
CROSS JOIN work_teams wt
WHERE t.parish_id = (SELECT parish_id FROM camps WHERE name = 'Kerigma 2025')
AND wt.name IN ('Cozinha', 'Secretaria', 'Capela')
LIMIT 15;

-- Inserir mais designações como membros
INSERT INTO camp_work_assignments (camp_id, tent_id, work_team_id, role, notes)
SELECT 
    (SELECT id FROM camps WHERE name = 'Kerigma 2025'),
    t.id,
    wt.id,
    'member',
    'Membro da equipe'
FROM tents t
CROSS JOIN work_teams wt
WHERE t.parish_id = (SELECT parish_id FROM camps WHERE name = 'Kerigma 2025')
AND wt.name IN ('Limpeza', 'Segurança', 'Som e Mídia', 'Logística')
LIMIT 20; 