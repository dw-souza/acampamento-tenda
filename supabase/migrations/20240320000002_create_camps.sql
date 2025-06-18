-- Create camp_status type
CREATE TYPE camp_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

-- Create camps table
CREATE TABLE camps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stage_id UUID REFERENCES stages(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    capacity INTEGER,
    status camp_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create camp_tents table
CREATE TABLE camp_tents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
    tent_id UUID REFERENCES tents(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(camp_id, tent_id, role)
);

-- Add RLS policies for camps
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON camps
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camps
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camps
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camps
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add RLS policies for camp_tents
ALTER TABLE camp_tents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON camp_tents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON camp_tents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON camp_tents
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON camp_tents
    FOR DELETE USING (auth.role() = 'authenticated'); 