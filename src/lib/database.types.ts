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
      profiles: {
        Row: {
          id: string;
          callsign: string;
          role_archetype: string | null;
          role_other_detail: string | null;
          era_affiliation: string | null;
          tags: string[];
          language: string | null;
          region_hint: string | null;
          timezone_window: string | null;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          callsign?: string;
          role_archetype?: string | null;
          role_other_detail?: string | null;
          era_affiliation?: string | null;
          tags?: string[];
          language?: string | null;
          region_hint?: string | null;
          timezone_window?: string | null;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
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
          message_encryption_key: string | null;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          topic: string;
          status?: string;
          created_at?: string;
          expires_at: string;
          message_encryption_key?: string | null;
          archived_at?: string | null;
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
          payload_ciphertext: string;
          sent_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          squad_id?: string | null;
          sender_id?: string | null;
          payload_ciphertext: string;
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
      match_queue: {
        Row: {
          id: string;
          user_id: string;
          pool_key: string;
          side: string;
          status: string;
          squad_id: string | null;
          enqueued_at: string;
          matched_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pool_key: string;
          side: string;
          status: string;
          squad_id?: string | null;
          enqueued_at?: string;
          matched_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['match_queue']['Insert']>;
        Relationships: [];
      };
      moderators: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moderators']['Insert']>;
        Relationships: [];
      };
      moderation_audit_log: {
        Row: {
          id: string;
          actor_user_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['moderation_audit_log']['Insert']>;
        Relationships: [];
      };
      ledger_proposals: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          consensus_items: Json;
          tags: string[];
          status: string;
          published_at: string | null;
          squad_id: string | null;
          ledger_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary: string;
          consensus_items?: Json;
          tags?: string[];
          status?: string;
          published_at?: string | null;
          squad_id?: string | null;
          ledger_ref?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ledger_proposals']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      waitlist_signup_count: {
        Args: Record<string, never>;
        Returns: number;
      };
      matchmaking_enqueue_and_try: {
        Args: { p_pool_key: string; p_side: string };
        Returns: Json;
      };
      matchmaking_pool_snapshot: {
        Args: { p_pool_key: string };
        Returns: Json;
      };
      matchmaking_cancel_waiting: {
        Args: { p_pool_key: string };
        Returns: undefined;
      };
      messages_latest_window: {
        Args: { p_squad_id: string; p_limit: number };
        Returns: Database['public']['Tables']['messages']['Row'][];
      };
      messages_older_than: {
        Args: { p_squad_id: string; p_sent_at: string; p_id: string; p_limit: number };
        Returns: Database['public']['Tables']['messages']['Row'][];
      };
      moderator_flag_message: {
        Args: { p_message_id: string; p_reason: string };
        Returns: undefined;
      };
      moderator_archive_squad: {
        Args: { p_squad_id: string };
        Returns: undefined;
      };
      get_squad_peer_profiles: {
        Args: { p_squad_id: string };
        Returns: {
          user_id: string;
          callsign: string;
          role_archetype: string | null;
          tags: string[];
          region_hint: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
