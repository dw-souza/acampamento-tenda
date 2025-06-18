-- Create tents table
CREATE TABLE tents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parish_id UUID REFERENCES parishes(id) NOT NULL,
    number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    formation_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parish_id, number)
);

-- Create tent_families table
CREATE TABLE tent_families (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tent_id UUID REFERENCES tents(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tent_id, family_id)
);

-- Add RLS policies for tents
ALTER TABLE tents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON tents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add RLS policies for tent_families
ALTER TABLE tent_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON tent_families
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON tent_families
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON tent_families
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON tent_families
    FOR DELETE USING (auth.role() = 'authenticated'); 