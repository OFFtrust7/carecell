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
      caregiver_links: {
        Row: {
          accepted_at: string | null
          access_scope: string
          caregiver_email: string
          caregiver_id: string | null
          created_at: string
          id: string
          invite_code: string | null
          patient_id: string
          relationship: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          access_scope?: string
          caregiver_email: string
          caregiver_id?: string | null
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_id: string
          relationship?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          access_scope?: string
          caregiver_email?: string
          caregiver_id?: string | null
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_id?: string
          relationship?: string | null
          status?: string
        }
        Relationships: []
      }
      donor_eligibility: {
        Row: {
          created_at: string
          id: string
          ineligibility_reason: string | null
          is_eligible: boolean
          next_eligible_date: string | null
          on_medication: boolean
          recent_illness: boolean
          recent_travel: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ineligibility_reason?: string | null
          is_eligible?: boolean
          next_eligible_date?: string | null
          on_medication?: boolean
          recent_illness?: boolean
          recent_travel?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ineligibility_reason?: string | null
          is_eligible?: boolean
          next_eligible_date?: string | null
          on_medication?: boolean
          recent_illness?: boolean
          recent_travel?: boolean
          updated_at?: string
          user_id?: string
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
      emergency_requests: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string | null
          contact_phone: string
          created_at: string
          hospital_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          patient_id: string
          patient_name: string
          reason: string
          resolved_at: string | null
          status: string
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone: string
          created_at?: string
          hospital_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          patient_id: string
          patient_name: string
          reason: string
          resolved_at?: string | null
          status?: string
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          city?: string | null
          contact_phone?: string
          created_at?: string
          hospital_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          patient_id?: string
          patient_name?: string
          reason?: string
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          created_at: string
          doc_type: string
          document_date: string | null
          file_path: string
          file_size_kb: number | null
          id: string
          mime_type: string | null
          notes: string | null
          patient_id: string
          title: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          document_date?: string | null
          file_path: string
          file_size_kb?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id: string
          title: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          document_date?: string | null
          file_path?: string
          file_size_kb?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id?: string
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepts_emergency_calls: boolean
          allergies: string | null
          avatar_url: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage: string | null
          cancer_type: string | null
          chronic_conditions: string | null
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
          last_health_check: string | null
          latitude: number | null
          longitude: number | null
          medications: string | null
          phone: string | null
          pin_code: string | null
          platelet_donor: boolean
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          accepts_emergency_calls?: boolean
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage?: string | null
          cancer_type?: string | null
          chronic_conditions?: string | null
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
          last_health_check?: string | null
          latitude?: number | null
          longitude?: number | null
          medications?: string | null
          phone?: string | null
          pin_code?: string | null
          platelet_donor?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          accepts_emergency_calls?: boolean
          allergies?: string | null
          avatar_url?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          cancer_stage?: string | null
          cancer_type?: string | null
          chronic_conditions?: string | null
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
          last_health_check?: string | null
          latitude?: number | null
          longitude?: number | null
          medications?: string | null
          phone?: string | null
          pin_code?: string | null
          platelet_donor?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      request_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_events: {
        Row: {
          created_at: string
          description: string | null
          doctor_name: string | null
          event_date: string
          event_type: string
          hospital_name: string | null
          id: string
          patient_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          event_date: string
          event_type: string
          hospital_name?: string | null
          id?: string
          patient_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          event_date?: string
          event_type?: string
          hospital_name?: string | null
          id?: string
          patient_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_caregiver_invite: {
        Args: { p_invite_code: string }
        Returns: Json
      }
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
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      is_active_caregiver: {
        Args: { p_caregiver: string; p_patient: string }
        Returns: boolean
      }
      is_active_caregiver_with_edit: {
        Args: { p_caregiver: string; p_patient: string }
        Returns: boolean
      }
      list_active_blood_requests: {
        Args: never
        Returns: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          created_at: string
          donation_type: Database["public"]["Enums"]["donation_type"]
          expires_at: string
          fulfilled_at: string
          hospital_address: string
          hospital_name: string
          id: string
          latitude: number
          longitude: number
          notes: string
          patient_id: string
          state: string
          status: Database["public"]["Enums"]["request_status"]
          units_needed: number
          updated_at: string
          urgency: Database["public"]["Enums"]["request_urgency"]
        }[]
      }
      match_donors: {
        Args: { p_blood_group: string; p_city?: string; p_limit?: number }
        Returns: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          donation_count: number
          donor_score: number
          full_name: string
          is_available: boolean
          last_donation_date: string
          match_score: number
          next_eligible_date: string
          state: string
          user_id: string
        }[]
      }
      match_donors_v2: {
        Args: {
          p_blood_group: string
          p_city?: string
          p_emergency?: boolean
          p_lat?: number
          p_limit?: number
          p_lng?: number
        }
        Returns: {
          accepts_emergency_calls: boolean
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          distance_km: number
          donation_count: number
          donor_score: number
          full_name: string
          is_available: boolean
          last_donation_date: string
          match_label: string
          match_score: number
          next_eligible_date: string
          state: string
          user_id: string
        }[]
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
