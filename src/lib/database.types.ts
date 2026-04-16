export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          status: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      zk_proof_submissions: {
        Row: {
          id: string;
          user_id: string;
          proof_commitment: string;
          nullifier_hash: string;
          attribute_scope: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          proof_commitment: string;
          nullifier_hash: string;
          attribute_scope: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['zk_proof_submissions']['Insert']>;
        Relationships: [];
      };
      verified_attributes: {
        Row: {
          id: string;
          user_id: string | null;
          attribute_type: string;
          attribute_value: string;
          verified_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          attribute_type: string;
          attribute_value: string;
          verified_at?: string;
        };
        Update: Partial<Database['public']['Tables']['verified_attributes']['Insert']>;
        Relationships: [];
      };
      squads: {
        Row: {
          id: string;
          topic: string;
          status: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          topic: string;
          status?: string;
          created_at?: string;
          expires_at: string;
        };
        Update: Partial<Database['public']['Tables']['squads']['Insert']>;
        Relationships: [];
      };
      squad_members: {
        Row: {
          squad_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          squad_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['squad_members']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          squad_id: string | null;
          sender_id: string | null;
          encrypted_content: string;
          sent_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          squad_id?: string | null;
          sender_id?: string | null;
          encrypted_content: string;
          sent_at?: string;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      sentiment_metrics: {
        Row: {
          id: string;
          squad_id: string | null;
          tension_level: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          squad_id?: string | null;
          tension_level: number;
          recorded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sentiment_metrics']['Insert']>;
        Relationships: [];
      };
      interventions: {
        Row: {
          id: string;
          squad_id: string | null;
          intervention_type: string;
          triggered_at: string;
        };
        Insert: {
          id?: string;
          squad_id?: string | null;
          intervention_type: string;
          triggered_at?: string;
        };
        Update: Partial<Database['public']['Tables']['interventions']['Insert']>;
        Relationships: [];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['waitlist_signups']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      waitlist_signup_count: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
