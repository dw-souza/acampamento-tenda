-- Converter todos os dados existentes para uppercase
UPDATE families SET
    esposo_nome = UPPER(esposo_nome),
    esposa_nome = UPPER(esposa_nome),
    address = UPPER(address),
    bairro = UPPER(bairro),
    city = UPPER(city),
    state = UPPER(state),
    zip_code = UPPER(zip_code);

UPDATE family_children SET
    name = UPPER(name);

UPDATE camps SET
    name = UPPER(name);

UPDATE stages SET
    name = UPPER(name);

UPDATE parishes SET
    name = UPPER(name); 