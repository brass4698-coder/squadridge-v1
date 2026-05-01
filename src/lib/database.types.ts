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

export type LedgerProposalVote = 'approve' | 'reject' | 'abstain';
export type ParticipantReportType = 'room' | 'participant' | 'message';
export type ParticipantReportReason =
  | 'harassment'
  | 'threat'
  | 'doxxing'
  | 'spam'
  | 'facilitator_help'
  | 'other';
export type ParticipantReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type CrisisAlertReasonCode = 'immediate_danger' | 'request_pause' | 'request_facilitator';
export type ParticipantBlockReason =
  | 'self_protection'
  | 'harassment'
  | 'threat'
  | 'doxxing'
  | 'spam'
  | 'other';
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
          issuer_group_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          proof_commitment: string;
          nullifier_hash: string;
          attribute_scope: string;
          issuer_group_id?: string | null;
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
      crisis_alerts: {
        Row: {
          id: string;
          actor_user_id: string;
          squad_id: string;
          reason_code: CrisisAlertReasonCode;
          created_at: string;
          acknowledged_at: string | null;
          acknowledged_by: string | null;
        };
        Insert: {
          id?: string;
          actor_user_id: string;
          squad_id: string;
          reason_code: CrisisAlertReasonCode;
          created_at?: string;
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['crisis_alerts']['Insert']>;
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
      ledger_proposal_votes: {
        Row: {
          id: string;
          proposal_id: string;
          squad_id: string;
          user_id: string;
          vote: LedgerProposalVote;
          voted_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          squad_id: string;
          user_id: string;
          vote: LedgerProposalVote;
          voted_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ledger_proposal_votes']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'ledger_proposal_votes_proposal_id_fkey';
            columns: ['proposal_id'];
            isOneToOne: false;
            referencedRelation: 'ledger_proposals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ledger_proposal_votes_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      user_notification_prefs: {
        Row: {
          user_id: string;
          in_app_session_alerts: boolean;
          in_app_publish_alerts: boolean;
          email_pilot_updates: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          in_app_session_alerts?: boolean;
          in_app_publish_alerts?: boolean;
          email_pilot_updates?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_notification_prefs']['Insert']>;
        Relationships: [];
      };
      issuer_groups: {
        Row: {
          group_id: string;
          manifest_url: string;
          signing_key_ed25519: string;
          current_root: string;
          current_root_expires_at: string;
          tree_depth: number;
          enrolled_at: string;
          last_refreshed_at: string;
        };
        Insert: {
          group_id: string;
          manifest_url: string;
          signing_key_ed25519: string;
          current_root: string;
          current_root_expires_at: string;
          tree_depth: number;
          enrolled_at?: string;
          last_refreshed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['issuer_groups']['Insert']>;
        Relationships: [];
      };
      retention_cleanup_runs: {
        Row: {
          id: number;
          ran_at: string;
          messages_deleted: number;
          match_queue_deleted: number;
          squads_deleted: number;
          duration_ms: number;
        };
        Insert: {
          id?: number;
          ran_at?: string;
          messages_deleted?: number;
          match_queue_deleted?: number;
          squads_deleted?: number;
          duration_ms?: number;
        };
        Update: Partial<Database['public']['Tables']['retention_cleanup_runs']['Insert']>;
        Relationships: [];
      };
      invite_codes: {
        Row: {
          id: string;
          code_hash: string;
          label: string;
          cohort_key: string | null;
          max_redemptions: number;
          redeemed_count: number;
          expires_at: string | null;
          disabled_at: string | null;
          created_at: string;
          created_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          code_hash: string;
          label: string;
          cohort_key?: string | null;
          max_redemptions?: number;
          redeemed_count?: number;
          expires_at?: string | null;
          disabled_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['invite_codes']['Insert']>;
        Relationships: [];
      };
      invite_redemptions: {
        Row: {
          id: string;
          invite_id: string;
          user_id: string;
          redeemed_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          invite_id: string;
          user_id: string;
          redeemed_at?: string;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['invite_redemptions']['Insert']>;
        Relationships: [];
      };
      participant_reports: {
        Row: {
          id: string;
          reporter_user_id: string;
          squad_id: string;
          target_user_id: string | null;
          target_message_id: string | null;
          report_type: ParticipantReportType;
          reason_code: ParticipantReportReason;
          context_note: string | null;
          status: ParticipantReportStatus;
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          moderator_note: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          reporter_user_id: string;
          squad_id: string;
          target_user_id?: string | null;
          target_message_id?: string | null;
          report_type: ParticipantReportType;
          reason_code: ParticipantReportReason;
          context_note?: string | null;
          status?: ParticipantReportStatus;
          created_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          moderator_note?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['participant_reports']['Insert']>;
        Relationships: [];
      };
      participant_blocks: {
        Row: {
          id: string;
          blocker_user_id: string;
          blocked_user_id: string;
          squad_id: string;
          reason_code: ParticipantBlockReason;
          active: boolean;
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          blocker_user_id: string;
          blocked_user_id: string;
          squad_id: string;
          reason_code?: ParticipantBlockReason;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
          metadata?: Json;
        };
        Update: Partial<Database['public']['Tables']['participant_blocks']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      ledger_proposal_vote_summary: {
        Row: {
          proposal_id: string;
          squad_id: string | null;
          status: LedgerProposalStatus;
          approve_count: number;
          reject_count: number;
          abstain_count: number;
          total_eligible: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      waitlist_signup_count: {
        Args: Record<string, never>;
        Returns: number;
      };
      redeem_invite_code: {
        Args: { p_code: string };
        Returns: Json;
      };
      get_my_active_invite: {
        Args: Record<string, never>;
        Returns: Json;
      };
      moderator_update_participant_report: {
        Args: { p_report_id: string; p_status: string; p_moderator_note?: string | null };
        Returns: Database['public']['Tables']['participant_reports']['Row'];
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
      create_demo_squad: {
        Args: Record<string, never>;
        Returns: string;
      };
      finalize_demo_session_claim: {
        Args: { p_claim_code: string; p_consent_token: string };
        Returns: Json;
      };
      issue_demo_claim_consent: {
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
      get_my_messages_review_status: {
        Args: { p_message_ids: string[] };
        Returns: {
          message_id: string;
          reviewed_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
