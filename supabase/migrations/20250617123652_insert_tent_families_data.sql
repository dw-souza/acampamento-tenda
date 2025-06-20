-- Migração para inserir dados de famílias participantes das TENDAs
-- Esta migração insere dados diretamente na tabela tent_families

-- Primeiro, vamos garantir que as TENDAs tenham stage_id definido (assumindo que são do Kerigma)
UPDATE tents 
SET stage_id = (SELECT id FROM stages WHERE name = 'KERIGMA' LIMIT 1)
WHERE stage_id IS NULL;

-- Inserir famílias participantes das TENDAs (dados diretos na tent_families)
-- Distribuindo 5 famílias por TENDA nas primeiras 5 TENDAs (25 famílias total)

-- TENDA 1 - Santa Gianna (primeira TENDA)
INSERT INTO tent_families (
    tent_id, 
    family_id, 
    esposo_nome, 
    esposa_nome, 
    esposo_phone, 
    esposo_email, 
    esposo_profissao,
    esposa_phone, 
    esposa_email, 
    esposa_profissao,
    address, 
    bairro, 
    city, 
    state, 
    zip_code, 
    data_casamento, 
    contato_principal, 
    status
) VALUES
    ((SELECT id FROM tents WHERE name = 'TENDA 1' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'João Silva', 'Maria Silva', '(11) 99999-1111', 'joao.silva@email.com', 'Engenheiro',
     '(11) 99999-1112', 'maria.silva@email.com', 'Advogada',
     'Rua das Flores, 123', 'Centro', 'Franca', 'SP', '14400-000', '2015-06-15', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 1' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Pedro Santos', 'Ana Santos', '(11) 99999-2221', 'pedro.santos@email.com', 'Médico',
     '(11) 99999-2222', 'ana.santos@email.com', 'Dentista',
     'Av. Paulista, 456', 'Bela Vista', 'Franca', 'SP', '14400-001', '2018-03-20', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 1' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Carlos Oliveira', 'Lucia Oliveira', '(11) 99999-3331', 'carlos.oliveira@email.com', 'Professor',
     '(11) 99999-3332', 'lucia.oliveira@email.com', 'Enfermeira',
     'Rua Augusta, 789', 'Consolação', 'Franca', 'SP', '14400-002', '2016-09-10', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 1' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Roberto Costa', 'Fernanda Costa', '(11) 99999-4441', 'roberto.costa@email.com', 'Advogado',
     '(11) 99999-4442', 'fernanda.costa@email.com', 'Psicóloga',
     'Rua Oscar Freire, 321', 'Jardins', 'Franca', 'SP', '14400-003', '2017-12-05', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 1' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Marcos Ferreira', 'Patricia Ferreira', '(11) 99999-5551', 'marcos.ferreira@email.com', 'Contador',
     '(11) 99999-5552', 'patricia.ferreira@email.com', 'Fisioterapeuta',
     'Alameda Santos, 654', 'Jardins', 'Franca', 'SP', '14400-004', '2019-04-18', 'esposo', 'active');

-- TENDA 2 - Santa Gianna (segunda TENDA)
INSERT INTO tent_families (
    tent_id, 
    family_id, 
    esposo_nome, 
    esposa_nome, 
    esposo_phone, 
    esposo_email, 
    esposo_profissao,
    esposa_phone, 
    esposa_email, 
    esposa_profissao,
    address, 
    bairro, 
    city, 
    state, 
    zip_code, 
    data_casamento, 
    contato_principal, 
    status
) VALUES
    ((SELECT id FROM tents WHERE name = 'TENDA 2' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Ricardo Almeida', 'Juliana Almeida', '(11) 99999-6661', 'ricardo.almeida@email.com', 'Arquiteto',
     '(11) 99999-6662', 'juliana.almeida@email.com', 'Designer',
     'Rua Haddock Lobo, 987', 'Cerqueira César', 'Franca', 'SP', '14400-005', '2014-11-30', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 2' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Fernando Lima', 'Camila Lima', '(11) 99999-7771', 'fernando.lima@email.com', 'Programador',
     '(11) 99999-7772', 'camila.lima@email.com', 'Analista de Sistemas',
     'Rua Bela Cintra, 147', 'Consolação', 'Franca', 'SP', '14400-006', '2016-07-22', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 2' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'André Martins', 'Vanessa Martins', '(11) 99999-8881', 'andre.martins@email.com', 'Vendedor',
     '(11) 99999-8882', 'vanessa.martins@email.com', 'Recepcionista',
     'Rua Teodoro Sampaio, 258', 'Pinheiros', 'Franca', 'SP', '14400-007', '2018-01-14', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 2' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Lucas Pereira', 'Gabriela Pereira', '(11) 99999-9991', 'lucas.pereira@email.com', 'Mecânico',
     '(11) 99999-9992', 'gabriela.pereira@email.com', 'Auxiliar Administrativo',
     'Rua Cardeal Arcoverde, 369', 'Pinheiros', 'Franca', 'SP', '14400-008', '2015-05-08', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 2' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Thiago Rodrigues', 'Isabela Rodrigues', '(11) 99999-0001', 'thiago.rodrigues@email.com', 'Eletricista',
     '(11) 99999-0002', 'isabela.rodrigues@email.com', 'Auxiliar de Escritório',
     'Rua Fradique Coutinho, 741', 'Vila Madalena', 'Franca', 'SP', '14400-009', '2017-08-12', 'esposa', 'active');

-- TENDA 3 - Santa Gianna (terceira TENDA)
INSERT INTO tent_families (
    tent_id, 
    family_id, 
    esposo_nome, 
    esposa_nome, 
    esposo_phone, 
    esposo_email, 
    esposo_profissao,
    esposa_phone, 
    esposa_email, 
    esposa_profissao,
    address, 
    bairro, 
    city, 
    state, 
    zip_code, 
    data_casamento, 
    contato_principal, 
    status
) VALUES
    ((SELECT id FROM tents WHERE name = 'TENDA 3' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Diego Souza', 'Amanda Souza', '(11) 99999-1113', 'diego.souza@email.com', 'Pintor',
     '(11) 99999-1114', 'amanda.souza@email.com', 'Auxiliar de Limpeza',
     'Rua Harmonia, 852', 'Vila Madalena', 'Franca', 'SP', '14400-010', '2016-12-03', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 3' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Bruno Carvalho', 'Carolina Carvalho', '(11) 99999-2223', 'bruno.carvalho@email.com', 'Pedreiro',
     '(11) 99999-2224', 'carolina.carvalho@email.com', 'Auxiliar de Cozinha',
     'Rua Aspicuelta, 963', 'Vila Madalena', 'Franca', 'SP', '14400-011', '2018-06-25', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 3' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Rafael Mendes', 'Daniela Mendes', '(11) 99999-3333', 'rafael.mendes@email.com', 'Jardineiro',
     '(11) 99999-3334', 'daniela.mendes@email.com', 'Auxiliar de Serviços Gerais',
     'Rua Wisard, 159', 'Vila Madalena', 'Franca', 'SP', '14400-012', '2015-10-17', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 3' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Eduardo Barbosa', 'Mariana Barbosa', '(11) 99999-4443', 'eduardo.barbosa@email.com', 'Auxiliar de Manutenção',
     '(11) 99999-4444', 'mariana.barbosa@email.com', 'Auxiliar de Escritório',
     'Rua Purpurina, 753', 'Vila Madalena', 'Franca', 'SP', '14400-013', '2017-02-28', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 3' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Gustavo Nascimento', 'Beatriz Nascimento', '(11) 99999-5553', 'gustavo.nascimento@email.com', 'Auxiliar de Produção',
     '(11) 99999-5554', 'beatriz.nascimento@email.com', 'Auxiliar de Vendas',
     'Rua Girassol, 951', 'Vila Madalena', 'Franca', 'SP', '14400-014', '2019-11-09', 'esposo', 'active');

-- TENDA 4 - Santa Gianna (quarta TENDA)
INSERT INTO tent_families (
    tent_id, 
    family_id, 
    esposo_nome, 
    esposa_nome, 
    esposo_phone, 
    esposo_email, 
    esposo_profissao,
    esposa_phone, 
    esposa_email, 
    esposa_profissao,
    address, 
    bairro, 
    city, 
    state, 
    zip_code, 
    data_casamento, 
    contato_principal, 
    status
) VALUES
    ((SELECT id FROM tents WHERE name = 'TENDA 4' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Leonardo Moreira', 'Larissa Moreira', '(11) 99999-6663', 'leonardo.moreira@email.com', 'Auxiliar de Logística',
     '(11) 99999-6664', 'larissa.moreira@email.com', 'Auxiliar de RH',
     'Rua dos Pinheiros, 357', 'Pinheiros', 'Franca', 'SP', '14400-015', '2014-08-14', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 4' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Matheus Rocha', 'Natalia Rocha', '(11) 99999-7773', 'matheus.rocha@email.com', 'Auxiliar de Almoxarifado',
     '(11) 99999-7774', 'natalia.rocha@email.com', 'Auxiliar de Contabilidade',
     'Rua dos Corifeus, 468', 'Pinheiros', 'Franca', 'SP', '14400-016', '2016-04-07', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 4' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Vinicius Cardoso', 'Stephanie Cardoso', '(11) 99999-8883', 'vinicius.cardoso@email.com', 'Auxiliar de Qualidade',
     '(11) 99999-8884', 'stephanie.cardoso@email.com', 'Auxiliar de Marketing',
     'Rua dos Patriotas, 579', 'Pinheiros', 'Franca', 'SP', '14400-017', '2018-09-30', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 4' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Felipe Lopes', 'Renata Lopes', '(11) 99999-9993', 'felipe.lopes@email.com', 'Auxiliar de Segurança',
     '(11) 99999-9994', 'renata.lopes@email.com', 'Auxiliar de Atendimento',
     'Rua dos Arapanés, 680', 'Pinheiros', 'Franca', 'SP', '14400-018', '2015-12-21', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 4' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Rodrigo Gomes', 'Tatiana Gomes', '(11) 99999-0003', 'rodrigo.gomes@email.com', 'Auxiliar de Estoque',
     '(11) 99999-0004', 'tatiana.gomes@email.com', 'Auxiliar de Compras',
     'Rua dos Eucaliptos, 791', 'Pinheiros', 'Franca', 'SP', '14400-019', '2017-03-16', 'esposa', 'active');

-- TENDA 5 - Santa Gianna (quinta TENDA)
INSERT INTO tent_families (
    tent_id, 
    family_id, 
    esposo_nome, 
    esposa_nome, 
    esposo_phone, 
    esposo_email, 
    esposo_profissao,
    esposa_phone, 
    esposa_email, 
    esposa_profissao,
    address, 
    bairro, 
    city, 
    state, 
    zip_code, 
    data_casamento, 
    contato_principal, 
    status
) VALUES
    ((SELECT id FROM tents WHERE name = 'TENDA 5' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Alexandre Dias', 'Priscila Dias', '(11) 99999-1115', 'alexandre.dias@email.com', 'Auxiliar de Manutenção',
     '(11) 99999-1116', 'priscila.dias@email.com', 'Auxiliar de Secretaria',
     'Rua dos Carijós, 802', 'Pinheiros', 'Franca', 'SP', '14400-020', '2016-01-25', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 5' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Cesar Monteiro', 'Aline Monteiro', '(11) 99999-2225', 'cesar.monteiro@email.com', 'Auxiliar de Produção',
     '(11) 99999-2226', 'aline.monteiro@email.com', 'Auxiliar de Vendas',
     'Rua dos Tamoios, 913', 'Pinheiros', 'Franca', 'SP', '14400-021', '2018-07-11', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 5' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Hugo Alves', 'Cristina Alves', '(11) 99999-3335', 'hugo.alves@email.com', 'Auxiliar de Logística',
     '(11) 99999-3336', 'cristina.alves@email.com', 'Auxiliar de RH',
     'Rua dos Aimorés, 024', 'Pinheiros', 'Franca', 'SP', '14400-022', '2015-11-08', 'esposo', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 5' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Igor Ribeiro', 'Elaine Ribeiro', '(11) 99999-4445', 'igor.ribeiro@email.com', 'Auxiliar de Almoxarifado',
     '(11) 99999-4446', 'elaine.ribeiro@email.com', 'Auxiliar de Contabilidade',
     'Rua dos Tupiniquins, 135', 'Pinheiros', 'Franca', 'SP', '14400-023', '2017-05-19', 'esposa', 'active'),
    
    ((SELECT id FROM tents WHERE name = 'TENDA 5' AND parish_id = (SELECT id FROM parishes WHERE name = 'Santa Gianna Beretta Molla') LIMIT 1), 
     gen_random_uuid(), 
     'Jorge Campos', 'Fabiana Campos', '(11) 99999-5555', 'jorge.campos@email.com', 'Auxiliar de Qualidade',
     '(11) 99999-5556', 'fabiana.campos@email.com', 'Auxiliar de Marketing',
     'Rua dos Tupinambás, 246', 'Pinheiros', 'Franca', 'SP', '14400-024', '2019-02-13', 'esposo', 'active');

-- Inserir alguns filhos para as famílias das TENDAs (dados de exemplo)
-- Filhos para as primeiras 10 famílias (aproximadamente 30 filhos)

-- Filhos da Família 1 (João Silva)
INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Pedro Silva',
    '2016-03-15',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'João Silva' AND tf.esposa_nome = 'Maria Silva'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Ana Silva',
    '2019-07-22',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'João Silva' AND tf.esposa_nome = 'Maria Silva'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Lucas Silva',
    '2021-11-08',
    false,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'João Silva' AND tf.esposa_nome = 'Maria Silva'
LIMIT 1;

-- Filhos da Família 2 (Pedro Santos)
INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Gabriel Santos',
    '2014-05-10',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Pedro Santos' AND tf.esposa_nome = 'Ana Santos'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Sofia Santos',
    '2017-09-18',
    true,
    'Intolerante à lactose',
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Pedro Santos' AND tf.esposa_nome = 'Ana Santos'
LIMIT 1;

-- Filhos da Família 3 (Carlos Oliveira)
INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Matheus Oliveira',
    '2012-12-03',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Carlos Oliveira' AND tf.esposa_nome = 'Lucia Oliveira'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Julia Oliveira',
    '2015-04-25',
    true,
    'Vegetariana',
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Carlos Oliveira' AND tf.esposa_nome = 'Lucia Oliveira'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Rafael Oliveira',
    '2018-08-14',
    true,
    NULL,
    'Asma'
FROM tent_families tf
WHERE tf.esposo_nome = 'Carlos Oliveira' AND tf.esposa_nome = 'Lucia Oliveira'
LIMIT 1;

-- Filhos da Família 4 (Roberto Costa)
INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Enzo Costa',
    '2013-06-12',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Roberto Costa' AND tf.esposa_nome = 'Fernanda Costa'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Valentina Costa',
    '2016-10-05',
    true,
    'Alérgica a amendoim',
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Roberto Costa' AND tf.esposa_nome = 'Fernanda Costa'
LIMIT 1;

-- Filhos da Família 5 (Marcos Ferreira)
INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Davi Ferreira',
    '2011-02-28',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Marcos Ferreira' AND tf.esposa_nome = 'Patricia Ferreira'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Maria Clara Ferreira',
    '2014-11-15',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Marcos Ferreira' AND tf.esposa_nome = 'Patricia Ferreira'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'João Pedro Ferreira',
    '2017-03-07',
    true,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Marcos Ferreira' AND tf.esposa_nome = 'Patricia Ferreira'
LIMIT 1;

INSERT INTO tent_children (tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs)
SELECT 
    tf.id,
    'Helena Ferreira',
    '2019-07-20',
    false,
    NULL,
    NULL
FROM tent_families tf
WHERE tf.esposo_nome = 'Marcos Ferreira' AND tf.esposa_nome = 'Patricia Ferreira'
LIMIT 1; 