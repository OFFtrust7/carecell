export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          created_at: string
          description: string | null
          doctor_name: string | null
          id: string
          location: string | null
          notes: string | null
          reminder_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_type?: string
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          reminder_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          reminder_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string | null
          contact_phone: string | null
          created_at: string
          donation_type: Database["public"]["Enums"]["donation_type"]
          expires_at: string
          fulfilled_at: string | null
          hospital_address: string | null
          hospital_name: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          patient_id: string
          patient_name: string
          state: string | null
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          updated_at: string
          urgency: Database["public"]["Enums"]["request_urgency"]
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          donation_type?: Database["public"]["Enums"]["donation_type"]
          expires_at: string
          fulfilled_at?: string | null
          hospital_address?: string | null
          hospital_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          patient_id: string
          patient_name: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          donation_type?: Database["public"]["Enums"]["donation_type"]
          expires_at?: string
          fulfilled_at?: string | null
          hospital_address?: string | null
          hospital_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          patient_id?: string
          patient_name?: string
          state?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          units_needed?: number
          updated_at?: string
          urgency?: Database["public"]["Enums"]["request_urgency"]
        }
        Relationships: []
      }
      donor_responses: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          message: string | null
          request_id: string
          status: Database["public"]["Enums"]["donor_response_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          message?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["donor_response_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          message?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["donor_response_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: string | null
          avatar_url: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage: string | null
          cancer_type: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          doctor_name: string | null
          donation_count: number
          donor_score: number
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          hospital_name: string | null
          id: string
          is_available: boolean
          last_donation_date: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          pin_code: string | null
          platelet_donor: boolean
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage?: string | null
          cancer_type?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          doctor_name?: string | null
          donation_count?: number
          donor_score?: number
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          pin_code?: string | null
          platelet_donor?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage?: string | null
          cancer_type?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          doctor_name?: string | null
          donation_count?: number
          donor_score?: number
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_available?: boolean
          last_donation_date?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          pin_code?: string | null
          platelet_donor?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_donor_profiles: {
        Args: { p_blood_group?: string; p_city?: string }
        Returns: {
          avatar_url: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          donation_count: number
          donor_score: number
          full_name: string
          id: string
          is_available: boolean
          last_donation_date: string
          platelet_donor: boolean
          state: string
          user_id: string
        }[]
      }
      get_request_contact_phone: {
        Args: { p_request_id: string }
        Returns: string
      }
    }
    Enums: {
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      donation_type: "whole_blood" | "platelets" | "plasma"
      donor_response_status: "offered" | "accepted" | "declined" | "confirmed"
      request_status: "active" | "fulfilled" | "expired" | "cancelled"
      request_urgency: "critical" | "urgent" | "normal"
      user_role: "patient" | "donor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      donation_type: ["whole_blood", "platelets", "plasma"],
      donor_response_status: ["offered", "accepted", "declined", "confirmed"],
      request_status: ["active", "fulfilled", "expired", "cancelled"],
      request_urgency: ["critical", "urgent", "normal"],
      user_role: ["patient", "donor"],
    },
  },
} as const
