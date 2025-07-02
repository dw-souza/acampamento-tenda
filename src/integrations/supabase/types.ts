export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      camp_family_assignments: {
        Row: {
          camp_id: string
          created_at: string
          family_id: string
          id: string
          is_coordinator: boolean | null
          notes: string | null
          updated_at: string
          work_team_id: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          family_id: string
          id?: string
          is_coordinator?: boolean | null
          notes?: string | null
          updated_at?: string
          work_team_id: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          family_id?: string
          id?: string
          is_coordinator?: boolean | null
          notes?: string | null
          updated_at?: string
          work_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_family_assignments_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_family_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "tent_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_family_assignments_work_team_id_fkey"
            columns: ["work_team_id"]
            isOneToOne: false
            referencedRelation: "work_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_parishes: {
        Row: {
          camp_id: string
          created_at: string
          id: string
          parish_id: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          id?: string
          parish_id: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          id?: string
          parish_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_parishes_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_parishes_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_registrations: {
        Row: {
          camp_id: string
          created_at: string
          family_id: string
          id: string
          is_paid: boolean
          notes: string | null
          payment_method: string | null
          registration_date: string
          status: string
          updated_at: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          family_id: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_method?: string | null
          registration_date?: string
          status: string
          updated_at?: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          family_id?: string
          id?: string
          is_paid?: boolean
          notes?: string | null
          payment_method?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_registrations_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_registrations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_tents: {
        Row: {
          camp_id: string
          created_at: string
          id: string
          tent_id: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          id?: string
          tent_id: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          id?: string
          tent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_tents_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_tents_tent_id_fkey"
            columns: ["tent_id"]
            isOneToOne: false
            referencedRelation: "tents"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_work_assignments: {
        Row: {
          camp_id: string
          coordinator_family_id: string | null
          created_at: string
          id: string
          notes: string | null
          tent_id: string
          updated_at: string
          work_team_id: string
        }
        Insert: {
          camp_id: string
          coordinator_family_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tent_id: string
          updated_at?: string
          work_team_id: string
        }
        Update: {
          camp_id?: string
          coordinator_family_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          tent_id?: string
          updated_at?: string
          work_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_work_assignments_camp_id_fkey"
            columns: ["camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_work_assignments_coordinator_family_id_fkey"
            columns: ["coordinator_family_id"]
            isOneToOne: false
            referencedRelation: "tent_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_work_assignments_tent_id_fkey"
            columns: ["tent_id"]
            isOneToOne: false
            referencedRelation: "tents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "camp_work_assignments_work_team_id_fkey"
            columns: ["work_team_id"]
            isOneToOne: false
            referencedRelation: "work_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      camps: {
        Row: {
          child_price: number
          couple_price: number
          created_at: string | null
          end_date: string
          id: string
          max_families: number
          name: string
          registration_end_date: string | null
          registration_start_date: string | null
          stage_id: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          child_price?: number
          couple_price?: number
          created_at?: string | null
          end_date: string
          id?: string
          max_families?: number
          name: string
          registration_end_date?: string | null
          registration_start_date?: string | null
          stage_id: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          child_price?: number
          couple_price?: number
          created_at?: string | null
          end_date?: string
          id?: string
          max_families?: number
          name?: string
          registration_end_date?: string | null
          registration_start_date?: string | null
          stage_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camps_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          address: string | null
          bairro: string | null
          city: string | null
          contato_principal: string
          created_at: string | null
          data_casamento: string | null
          esposa_email: string | null
          esposa_nome: string
          esposa_phone: string | null
          esposa_profissao: string | null
          esposo_email: string | null
          esposo_nome: string
          esposo_phone: string | null
          esposo_profissao: string | null
          forma_pagamento: string | null
          id: string
          needs_pajem: boolean | null
          notes: string | null
          payment_proof_url: string | null
          payment_status: string | null
          phone_esposa: string | null
          phone_esposo: string | null
          profissao_esposa: string | null
          profissao_esposo: string | null
          registration_status: string | null
          state: string | null
          total_amount: number | null
          updated_at: string | null
          valor_casal: number | null
          valor_filhos: number | null
          valor_pago: number | null
          valor_pajem: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bairro?: string | null
          city?: string | null
          contato_principal: string
          created_at?: string | null
          data_casamento?: string | null
          esposa_email?: string | null
          esposa_nome: string
          esposa_phone?: string | null
          esposa_profissao?: string | null
          esposo_email?: string | null
          esposo_nome: string
          esposo_phone?: string | null
          esposo_profissao?: string | null
          forma_pagamento?: string | null
          id?: string
          needs_pajem?: boolean | null
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone_esposa?: string | null
          phone_esposo?: string | null
          profissao_esposa?: string | null
          profissao_esposo?: string | null
          registration_status?: string | null
          state?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valor_casal?: number | null
          valor_filhos?: number | null
          valor_pago?: number | null
          valor_pajem?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bairro?: string | null
          city?: string | null
          contato_principal?: string
          created_at?: string | null
          data_casamento?: string | null
          esposa_email?: string | null
          esposa_nome?: string
          esposa_phone?: string | null
          esposa_profissao?: string | null
          esposo_email?: string | null
          esposo_nome?: string
          esposo_phone?: string | null
          esposo_profissao?: string | null
          forma_pagamento?: string | null
          id?: string
          needs_pajem?: boolean | null
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone_esposa?: string | null
          phone_esposo?: string | null
          profissao_esposa?: string | null
          profissao_esposo?: string | null
          registration_status?: string | null
          state?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valor_casal?: number | null
          valor_filhos?: number | null
          valor_pago?: number | null
          valor_pajem?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      family_children: {
        Row: {
          birth_date: string | null
          created_at: string
          dietary_restrictions: string | null
          family_id: string
          full_name: string
          id: string
          special_needs: string | null
          updated_at: string
          vai_acampamento: boolean | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          family_id: string
          full_name: string
          id?: string
          special_needs?: string | null
          updated_at?: string
          vai_acampamento?: boolean | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          family_id?: string
          full_name?: string
          id?: string
          special_needs?: string | null
          updated_at?: string
          vai_acampamento?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "family_children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      parishes: {
        Row: {
          address: string | null
          city: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          responsible_name: string | null
          responsible_phone: string | null
          state: string
          status: Database["public"]["Enums"]["parish_status"] | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          state: string
          status?: Database["public"]["Enums"]["parish_status"] | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          state?: string
          status?: Database["public"]["Enums"]["parish_status"] | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      stages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_camp: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_camp?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_camp?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tent_children: {
        Row: {
          birth_date: string | null
          created_at: string
          dietary_restrictions: string | null
          full_name: string
          id: string
          special_needs: string | null
          tent_family_id: string
          updated_at: string
          vai_encontros: boolean | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          full_name: string
          id?: string
          special_needs?: string | null
          tent_family_id: string
          updated_at?: string
          vai_encontros?: boolean | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          full_name?: string
          id?: string
          special_needs?: string | null
          tent_family_id?: string
          updated_at?: string
          vai_encontros?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tent_children_tent_family_id_fkey"
            columns: ["tent_family_id"]
            isOneToOne: false
            referencedRelation: "tent_families"
            referencedColumns: ["id"]
          },
        ]
      }
      tent_families: {
        Row: {
          address: string | null
          bairro: string | null
          city: string | null
          contato_principal: string
          created_at: string
          data_casamento: string | null
          esposa_email: string | null
          esposa_nome: string
          esposa_phone: string | null
          esposa_profissao: string | null
          esposo_email: string | null
          esposo_nome: string
          esposo_phone: string | null
          esposo_profissao: string | null
          family_id: string | null
          id: string
          joined_date: string | null
          state: string | null
          status: string
          tent_id: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          bairro?: string | null
          city?: string | null
          contato_principal: string
          created_at?: string
          data_casamento?: string | null
          esposa_email?: string | null
          esposa_nome: string
          esposa_phone?: string | null
          esposa_profissao?: string | null
          esposo_email?: string | null
          esposo_nome: string
          esposo_phone?: string | null
          esposo_profissao?: string | null
          family_id?: string | null
          id?: string
          joined_date?: string | null
          state?: string | null
          status?: string
          tent_id: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          bairro?: string | null
          city?: string | null
          contato_principal?: string
          created_at?: string
          data_casamento?: string | null
          esposa_email?: string | null
          esposa_nome?: string
          esposa_phone?: string | null
          esposa_profissao?: string | null
          esposo_email?: string | null
          esposo_nome?: string
          esposo_phone?: string | null
          esposo_profissao?: string | null
          family_id?: string | null
          id?: string
          joined_date?: string | null
          state?: string | null
          status?: string
          tent_id?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tent_families_tent_id_fkey"
            columns: ["tent_id"]
            isOneToOne: false
            referencedRelation: "tents"
            referencedColumns: ["id"]
          },
        ]
      }
      tents: {
        Row: {
          created_at: string
          formation_date: string
          guardian_husband_name: string
          guardian_wife_name: string
          id: string
          meeting_date: string | null
          meeting_location: string | null
          name: string
          parish_id: string
          stage_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation_date: string
          guardian_husband_name: string
          guardian_wife_name: string
          id?: string
          meeting_date?: string | null
          meeting_location?: string | null
          name: string
          parish_id: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation_date?: string
          guardian_husband_name?: string
          guardian_wife_name?: string
          id?: string
          meeting_date?: string | null
          meeting_location?: string | null
          name?: string
          parish_id?: string
          stage_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tents_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tents_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      work_teams: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_special_team: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_special_team?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_special_team?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
    }
    Enums: {
      marital_status: "solteiro" | "casado" | "divorciado" | "viuvo" | "outro"
      parish_status: "active" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      marital_status: ["solteiro", "casado", "divorciado", "viuvo", "outro"],
      parish_status: ["active", "inactive"],
    },
  },
} as const
