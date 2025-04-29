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
      families: {
        Row: {
          address: string | null
          bairro: string | null
          city: string | null
          created_at: string | null
          data_casamento: string | null
          forma_pagamento: string | null
          has_children: boolean | null
          id: string
          main_contact_email: string | null
          main_contact_name: string
          main_contact_phone: string | null
          needs_pajem: boolean | null
          notes: string | null
          payment_proof_url: string | null
          payment_status: string | null
          phone_esposa: string | null
          phone_esposo: string | null
          phone_fixo: string | null
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
          created_at?: string | null
          data_casamento?: string | null
          forma_pagamento?: string | null
          has_children?: boolean | null
          id?: string
          main_contact_email?: string | null
          main_contact_name: string
          main_contact_phone?: string | null
          needs_pajem?: boolean | null
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone_esposa?: string | null
          phone_esposo?: string | null
          phone_fixo?: string | null
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
          created_at?: string | null
          data_casamento?: string | null
          forma_pagamento?: string | null
          has_children?: boolean | null
          id?: string
          main_contact_email?: string | null
          main_contact_name?: string
          main_contact_phone?: string | null
          needs_pajem?: boolean | null
          notes?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone_esposa?: string | null
          phone_esposo?: string | null
          phone_fixo?: string | null
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
      participants: {
        Row: {
          birth_date: string | null
          created_at: string | null
          dietary_restrictions: string | null
          family_id: string | null
          full_name: string
          id: string
          is_child: boolean | null
          is_pajem: boolean | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          pajem_idade: number | null
          pajem_parentesco: string | null
          pajem_phone: string | null
          special_needs: string | null
          vai_acampamento: boolean | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          family_id?: string | null
          full_name: string
          id?: string
          is_child?: boolean | null
          is_pajem?: boolean | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          pajem_idade?: number | null
          pajem_parentesco?: string | null
          pajem_phone?: string | null
          special_needs?: string | null
          vai_acampamento?: boolean | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          family_id?: string | null
          full_name?: string
          id?: string
          is_child?: boolean | null
          is_pajem?: boolean | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          pajem_idade?: number | null
          pajem_parentesco?: string | null
          pajem_phone?: string | null
          special_needs?: string | null
          vai_acampamento?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
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
