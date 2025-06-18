-- Create stages table
CREATE TABLE stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON stages
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON stages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON stages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON stages
    FOR DELETE USING (auth.role() = 'authenticated'); 