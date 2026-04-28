/**
 * `public` schema — aligned with `supabase/migrations` (hand-maintained: CHECK-backed unions
 * and `expires_at` typed where `supabase gen types` may emit plain string).
 * CI `db` job runs `supabase db reset` then `npm run check:database-types` so new tables/columns
 * from `--local` codegen are merged into this file (see `npm run gen:types:local`).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** Mirrors CHECK on public.users (initial_schema). */
export type UserStatus = 'active' | 'suspended' | 'deleted';
/** Mirrors squads_status_check (scaling_session_features). */
export type SquadStatus = 'forming' | 'active' | 'completed' | 'flagged' | 'archived';
/** Mirrors messages status CHECK. */
export type MessageStatus = 'sent' | 'retracted' | 'flagged';
export type MatchQueueSide = 'A' | 'B';
export type MatchQueueStatus = 'waiting' | 'matched' | 'cancelled';
/** Mirrors ledger_proposals_status_check. */
export type LedgerProposalStatus = 'draft' | 'published' | 'archived';
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          status: UserStatus;
        };
        Insert: {
          id: string;
          created_at?: string;
          status?: UserStatus;
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
          status: SquadStatus;
          created_at: string;
          expires_at: string;
          message_encryption_key: string | null;
          archived_at: string | null;
          archived_encryption_key_snapshot: string | null;
        };
        Insert: {
          id?: string;
          topic: string;
          status?: SquadStatus;
          created_at?: string;
          expires_at: string;
          message_encryption_key?: string | null;
          archived_at?: string | null;
          archived_encryption_key_snapshot?: string | null;
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
          status: MessageStatus;
          /** Normalized 7d TTL; see ttl_cleanup migration. */
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          squad_id?: string | null;
          sender_id?: string | null;
          payload_ciphertext: string;
          sent_at?: string;
          status?: MessageStatus;
          expires_at?: string | null;
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
          role_hint: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          role_hint?: string | null;
        };
        Update: Partial<Database['public']['Tables']['waitlist_signups']['Insert']>;
        Relationships: [];
      };
      match_queue: {
        Row: {
          id: string;
          user_id: string;
          pool_key: string;
          side: MatchQueueSide;
          status: MatchQueueStatus;
          squad_id: string | null;
          enqueued_at: string;
          matched_at: string | null;
          /** Normalized 7d TTL; see ttl_cleanup migration. */
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pool_key: string;
          side: MatchQueueSide;
          status: MatchQueueStatus;
          squad_id?: string | null;
          enqueued_at?: string;
          matched_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['match_queue']['Insert']>;
        Relationships: [];
      };
      matchmaking_sweep_runs: {
        Row: {
          id: string;
          ran_at: string;
          pool_keys_swept: number;
        };
        Insert: {
          id?: string;
          ran_at?: string;
          pool_keys_swept?: number;
        };
        Update: Partial<Database['public']['Tables']['matchmaking_sweep_runs']['Insert']>;
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
          outcome_extras: Json;
          tags: string[];
          status: LedgerProposalStatus;
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
          outcome_extras?: Json;
          tags?: string[];
          status?: LedgerProposalStatus;
          published_at?: string | null;
          squad_id?: string | null;
          ledger_ref?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ledger_proposals']['Insert']>;
        Relationships: [];
      };
      conflict_severity_snapshots: {
        Row: {
          id: string;
          region_key: string;
          period_start: string;
          period_end: string;
          snapshot_at: string;
          csi_score: number;
          severity_band: 'green' | 'yellow' | 'red';
          sentiment_signal: number;
          grievance_signal: number;
          resource_signal: number;
          ingroup_outgroup_signal: number;
          escalation_velocity_signal: number;
          violence_normalization_signal: number;
          component_scores: Json;
          top_grievances: Json;
          squad_count: number;
          message_count: number;
          detected_escalation: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          region_key: string;
          period_start: string;
          period_end: string;
          snapshot_at?: string;
          csi_score: number;
          severity_band: 'green' | 'yellow' | 'red';
          sentiment_signal: number;
          grievance_signal: number;
          resource_signal: number;
          ingroup_outgroup_signal: number;
          escalation_velocity_signal: number;
          violence_normalization_signal: number;
          component_scores?: Json;
          top_grievances?: Json;
          squad_count?: number;
          message_count?: number;
          detected_escalation?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conflict_severity_snapshots']['Insert']>;
        Relationships: [];
      };
      escalation_alerts: {
        Row: {
          id: string;
          squad_id: string;
          region_key: string | null;
          csi_score: number | null;
          severity_level: 'green' | 'yellow' | 'red';
          triggered_at: string;
          recommended_action: string;
          source_snapshot_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          squad_id: string;
          region_key?: string | null;
          csi_score?: number | null;
          severity_level: 'green' | 'yellow' | 'red';
          triggered_at?: string;
          recommended_action?: string;
          source_snapshot_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['escalation_alerts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'escalation_alerts_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escalation_alerts_source_snapshot_id_fkey';
            columns: ['source_snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'conflict_severity_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      demo_session_claims: {
        Row: {
          claim_code: string;
          anon_user_id: string;
          created_at: string;
          consumed_at: string | null;
          verified_user_id: string | null;
        };
        Insert: {
          claim_code: string;
          anon_user_id: string;
          created_at?: string;
          consumed_at?: string | null;
          verified_user_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['demo_session_claims']['Insert']>;
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
      matchmaking_sweep_active_pools: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      matchmaking_queue_stats: {
        Args: Record<string, never>;
        Returns: Json;
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
      moderator_record_decrypt_audit: {
        Args: { p_message_id: string; p_justification: string };
        Returns: undefined;
      };
      get_or_create_squad_message_key: {
        Args: { p_squad_id: string };
        Returns: string;
      };
      create_demo_session_claim: {
        Args: Record<string, never>;
        Returns: string;
      };
      finalize_demo_session_claim: {
        Args: { p_claim_code: string };
        Returns: Json;
      };
      get_squad_peer_profiles: {
        Args: { p_squad_id: string };
        Returns: {
          user_id: string;
          callsign: string;
          role_archetype: string | null;
          role_other_detail: string | null;
          tags: string[];
          region_hint: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
