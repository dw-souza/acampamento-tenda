export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
      families: {
        Row: {
          id: string
          esposo_nome: string
          esposa_nome: string
          contato_principal: "esposo" | "esposa"
          address: string | null
          bairro: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          data_casamento: string | null
          esposo_phone: string | null
          esposo_email: string | null
          esposo_profissao: string | null
          esposa_phone: string | null
          esposa_email: string | null
          esposa_profissao: string | null
          needs_pajem: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          esposo_nome: string
          esposa_nome: string
          contato_principal: "esposo" | "esposa"
          address?: string | null
          bairro?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          data_casamento?: string | null
          esposo_phone?: string | null
          esposo_email?: string | null
          esposo_profissao?: string | null
          esposa_phone?: string | null
          esposa_email?: string | null
          esposa_profissao?: string | null
          needs_pajem?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          esposo_nome?: string
          esposa_nome?: string
          contato_principal?: "esposo" | "esposa"
          address?: string | null
          bairro?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          data_casamento?: string | null
          esposo_phone?: string | null
          esposo_email?: string | null
          esposo_profissao?: string | null
          esposa_phone?: string | null
          esposa_email?: string | null
          esposa_profissao?: string | null
          needs_pajem?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_children: {
        Row: {
          id: string
          family_id: string
          full_name: string
          birth_date: string | null
          vai_acampamento: boolean
          dietary_restrictions: string | null
          special_needs: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          full_name: string
          birth_date?: string | null
          vai_acampamento?: boolean
          dietary_restrictions?: string | null
          special_needs?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          full_name?: string
          birth_date?: string | null
          vai_acampamento?: boolean
          dietary_restrictions?: string | null
          special_needs?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      tent_children: {
        Row: {
          id: string
          tent_family_id: string
          family_child_id: string | null
          full_name: string
          birth_date: string | null
          vai_encontros: boolean
          dietary_restrictions: string | null
          special_needs: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tent_family_id: string
          family_child_id?: string | null
          full_name: string
          birth_date?: string | null
          vai_encontros?: boolean
          dietary_restrictions?: string | null
          special_needs?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tent_family_id?: string
          family_child_id?: string | null
          full_name?: string
          birth_date?: string | null
          vai_encontros?: boolean
          dietary_restrictions?: string | null
          special_needs?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tent_children_tent_family_id_fkey"
            columns: ["tent_family_id"]
            isOneToOne: false
            referencedRelation: "tent_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tent_children_family_child_id_fkey"
            columns: ["family_child_id"]
            isOneToOne: false
            referencedRelation: "family_children"
            referencedColumns: ["id"]
          }
        ]
      }
      tents: {
        Row: {
          id: string
          name: string
          formation_date: string
          guardian_husband_name: string
          guardian_wife_name: string
          parish_id: string
          meeting_date: string | null
          meeting_location: string | null
          status: "active" | "inactive" | "disbanded"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          formation_date: string
          guardian_husband_name: string
          guardian_wife_name: string
          parish_id: string
          meeting_date?: string | null
          meeting_location?: string | null
          status?: "active" | "inactive" | "disbanded"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          formation_date?: string
          guardian_husband_name?: string
          guardian_wife_name?: string
          parish_id?: string
          meeting_date?: string | null
          meeting_location?: string | null
          status?: "active" | "inactive" | "disbanded"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tents_parish_id_fkey"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          }
        ]
      }
      tent_families: {
        Row: {
          id: string
          tent_id: string
          family_id: string
          esposo_nome: string
          esposa_nome: string
          esposo_phone: string | null
          esposo_email: string | null
          esposo_profissao: string | null
          esposa_phone: string | null
          esposa_email: string | null
          esposa_profissao: string | null
          address: string | null
          bairro: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          data_casamento: string | null
          contato_principal: "esposo" | "esposa"
          joined_date: string
          status: "active" | "inactive" | "left"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tent_id: string
          family_id: string
          esposo_nome: string
          esposa_nome: string
          esposo_phone?: string | null
          esposo_email?: string | null
          esposo_profissao?: string | null
          esposa_phone?: string | null
          esposa_email?: string | null
          esposa_profissao?: string | null
          address?: string | null
          bairro?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          data_casamento?: string | null
          contato_principal: "esposo" | "esposa"
          joined_date?: string
          status?: "active" | "inactive" | "left"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tent_id?: string
          family_id?: string
          esposo_nome?: string
          esposa_nome?: string
          esposo_phone?: string | null
          esposo_email?: string | null
          esposo_profissao?: string | null
          esposa_phone?: string | null
          esposa_email?: string | null
          esposa_profissao?: string | null
          address?: string | null
          bairro?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          data_casamento?: string | null
          contato_principal?: "esposo" | "esposa"
          joined_date?: string
          status?: "active" | "inactive" | "left"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tent_families_tent_id_fkey"
            columns: ["tent_id"]
            isOneToOne: false
            referencedRelation: "tents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tent_families_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          }
        ]
      }
      parishes: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string
          state: string
          zip_code: string | null
          phone: string | null
          email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          status: "active" | "inactive"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city: string
          state: string
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          status?: "active" | "inactive"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string
          state?: string
          zip_code?: string | null
          phone?: string | null
          email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          status?: "active" | "inactive"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stages: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      camps: {
        Row: {
          id: string
          name: string
          stage_id: string
          parish_id: string
          start_date: string
          end_date: string
          max_families: number
          registration_start_date: string
          registration_end_date: string
          status: "draft" | "open" | "closed" | "in_progress" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          stage_id: string
          parish_id: string
          start_date: string
          end_date: string
          max_families?: number
          registration_start_date: string
          registration_end_date: string
          status?: "draft" | "open" | "closed" | "in_progress" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          stage_id?: string
          parish_id?: string
          start_date?: string
          end_date?: string
          max_families?: number
          registration_start_date?: string
          registration_end_date?: string
          status?: "draft" | "open" | "closed" | "in_progress" | "completed"
          created_at?: string
          updated_at?: string
        }
      }
      camp_registrations: {
        Row: {
          id: string
          camp_id: string
          family_id: string
          status: "pending" | "confirmed" | "waitlist" | "cancelled"
          registration_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          camp_id: string
          family_id: string
          status?: "pending" | "confirmed" | "waitlist" | "cancelled"
          registration_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          camp_id?: string
          family_id?: string
          status?: "pending" | "confirmed" | "waitlist" | "cancelled"
          registration_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tent_members: {
        Row: {
          id: string
          tent_id: string
          family_id: string
          role: "leader" | "member"
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tent_id: string
          family_id: string
          role: "leader" | "member"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tent_id?: string
          family_id?: string
          role?: "leader" | "member"
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      marital_status: "solteiro" | "casado" | "divorciado" | "viuvo" | "outro"
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
    },
  },
} as const
