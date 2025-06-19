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
  created_at: string;
  updated_at: string;
}

export interface CampWorkAssignment {
  id: string;
  camp_id: string;
  tent_id: string;
  work_team_id: string;
  role: "leader" | "member" | "assistant";
  notes?: string;
  created_at: string;
  updated_at: string;
  work_team?: WorkTeam;
  tent?: Tent;
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