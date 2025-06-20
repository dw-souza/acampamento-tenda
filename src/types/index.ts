export interface Stage {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Parish {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyChild {
  id: string;
  family_id: string;
  name: string;
  age: number;
  vai_acampamento: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkTeam {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_special_team?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampWorkAssignment {
  id: string;
  camp_id: string;
  tent_id: string;
  work_team_id: string;
  coordinator_family_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  work_team?: WorkTeam;
  tent?: Tent;
  coordinator_family?: TentFamily;
}

export interface CampFamilyAssignment {
  id: string;
  camp_id: string;
  family_id: string;
  work_team_id: string;
  is_coordinator?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  work_team?: WorkTeam;
  family?: TentFamily;
}

export interface Camp {
  id: string;
  name: string;
  stage_id: string;
  parish_id: string;
  start_date: string;
  end_date: string;
  max_families: number;
  registration_start_date: string;
  registration_end_date: string;
  status: "draft" | "open" | "closed" | "completed";
  couple_price: number;
  child_price: number;
  created_at: string;
  updated_at: string;
  stage?: Stage;
  parish?: Parish;
}

export interface Family {
  id: string;
  esposo_nome: string;
  esposa_nome: string;
  contato_principal: "esposo" | "esposa";
  address: string;
  bairro: string;
  city: string;
  state: string;
  zip_code: string;
  data_casamento: string;
  created_at: string;
  updated_at: string;
  family_children?: FamilyChild[];
}

export interface Tent {
  id: string;
  name: string;
  parish_id: string;
  meeting_date: string;
  created_at: string;
  updated_at: string;
  parish?: Parish;
  _count?: {
    active_families?: number;
  };
}

export interface TentFamily {
  id: string;
  tent_id: string;
  family_id: string;
  esposo_nome: string;
  esposa_nome: string;
  esposo_phone?: string;
  esposo_email?: string;
  esposo_profissao?: string;
  esposa_phone?: string;
  esposa_email?: string;
  esposa_profissao?: string;
  address?: string;
  bairro?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  data_casamento?: string;
  contato_principal: "esposo" | "esposa";
  joined_date: string;
  status: "active" | "inactive" | "left";
  created_at: string;
  updated_at: string;
} 