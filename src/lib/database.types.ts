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
export type IncidentRoomStatus = 'active' | 'paused' | 'archived' | 'closed';
export type IncidentSeverityTier = 'monitoring' | 'escalating' | 'critical' | 'de-escalating';
export type IncidentLane =
  | 'verified_evidence'
  | 'disputed_claims'
  | 'unverified_leads'
  | 'community_impact'
  | 'official_responses';
export type IncidentVerificationStatus =
  | 'pending_review'
  | 'corroborated'
  | 'disputed'
  | 'unverified'
  | 'retracted';
export type IncidentModerationState = 'pending' | 'approved' | 'flagged' | 'removed';
export type IncidentSourceType =
  | 'document'
  | 'statement'
  | 'news'
  | 'social'
  | 'official'
  | 'other';
export type IncidentThreadStatus = 'open' | 'paused' | 'resolved';
export type IncidentParticipantRole = 'participant' | 'facilitator' | 'moderator' | 'observer';
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
          /** Invite-only columns (20260704 reconcile); optional until migration applied. */
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          status?: string | null;
          primary_role?: string | null;
          onboarding_completed?: boolean | null;
          last_dashboard?: string | null;
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
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          status?: string | null;
          primary_role?: string | null;
          onboarding_completed?: boolean | null;
          last_dashboard?: string | null;
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
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          proof_commitment: string;
          nullifier_hash: string;
          attribute_scope: string;
          created_at?: string;
          expires_at?: string;
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
      incident_rooms: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          status: IncidentRoomStatus;
          severity_tier: IncidentSeverityTier;
          facilitator_id: string;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          status?: IncidentRoomStatus;
          severity_tier?: IncidentSeverityTier;
          facilitator_id: string;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['incident_rooms']['Insert']>;
        Relationships: [];
      };
      incident_items: {
        Row: {
          id: string;
          room_id: string;
          lane: IncidentLane;
          verification_status: IncidentVerificationStatus;
          moderation_state: IncidentModerationState;
          title: string;
          body: string;
          source_url: string | null;
          source_type: IncidentSourceType;
          content_warning: string | null;
          author_id: string;
          moderator_id: string | null;
          moderation_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          lane: IncidentLane;
          verification_status?: IncidentVerificationStatus;
          moderation_state?: IncidentModerationState;
          title: string;
          body: string;
          source_url?: string | null;
          source_type?: IncidentSourceType;
          content_warning?: string | null;
          author_id: string;
          moderator_id?: string | null;
          moderation_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['incident_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'incident_items_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_threads: {
        Row: {
          id: string;
          room_id: string;
          item_id: string | null;
          topic: string;
          status: IncidentThreadStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          item_id?: string | null;
          topic: string;
          status?: IncidentThreadStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['incident_threads']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'incident_threads_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_messages: {
        Row: {
          id: string;
          thread_id: string;
          author_id: string;
          body: string;
          moderation_state: IncidentModerationState;
          is_facilitator: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          author_id: string;
          body: string;
          moderation_state?: IncidentModerationState;
          is_facilitator?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['incident_messages']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'incident_messages_thread_id_fkey';
            columns: ['thread_id'];
            referencedRelation: 'incident_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_room_participants: {
        Row: {
          room_id: string;
          user_id: string;
          role: IncidentParticipantRole;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          role?: IncidentParticipantRole;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['incident_room_participants']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'incident_room_participants_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      // ── v2 facilitator platform (20260618+) ──
      sessions: {
        Row: {
          id: string;
          facilitator_id: string;
          title: string;
          conflict_type: string;
          language: string;
          max_participants: number;
          eligibility_notes: string | null;
          identity_verification_required: boolean;
          outcome_public: boolean;
          status: 'setup' | 'open' | 'live' | 'paused' | 'ended' | 'released';
          created_at: string;
          updated_at: string;
          template_id: string | null;
          setup_config: Json;
        };
        Insert: {
          facilitator_id: string;
          title: string;
          conflict_type: string;
          language?: string;
          max_participants?: number;
          eligibility_notes?: string | null;
          identity_verification_required?: boolean;
          outcome_public?: boolean;
          status?: 'setup' | 'open' | 'live' | 'paused' | 'ended' | 'released';
          template_id?: string | null;
          setup_config?: Json;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      participants: {
        Row: {
          id: string;
          session_id: string;
          codename: string;
          invite_token: string;
          invite_used: boolean;
          email_hash: string | null;
          verification_status: 'pending' | 'verified' | 'denied';
          document_submitted: boolean;
          consented_at: string | null;
          admitted_at: string | null;
          left_at: string | null;
          created_at: string;
        };
        Insert: {
          session_id: string;
          codename: string;
          invite_token: string;
          invite_used?: boolean;
          email_hash?: string | null;
          verification_status?: 'pending' | 'verified' | 'denied';
          document_submitted?: boolean;
          consented_at?: string | null;
          admitted_at?: string | null;
          left_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['participants']['Insert']>;
        Relationships: [];
      };
      verification_requests: {
        Row: {
          id: string;
          participant_id: string;
          document_type: string | null;
          storage_path: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          participant_id: string;
          document_type?: string | null;
          storage_path?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['verification_requests']['Insert']>;
        Relationships: [];
      };
      outcome_records: {
        Row: {
          id: string;
          session_id: string;
          summary: string;
          agreed_terms: string | null;
          pending_items: string | null;
          facilitator_notes: string | null;
          status: 'draft' | 'pending_approval' | 'approved' | 'published';
          published_at: string | null;
          ledger_sha: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          summary: string;
          agreed_terms?: string | null;
          pending_items?: string | null;
          facilitator_notes?: string | null;
          status?: 'draft' | 'pending_approval' | 'approved' | 'published';
          published_at?: string | null;
          ledger_sha?: string | null;
        };
        Update: Partial<Database['public']['Tables']['outcome_records']['Insert']> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      outcome_approvals: {
        Row: {
          id: string;
          outcome_id: string;
          approver_label: string;
          status: 'pending' | 'approved' | 'rejected';
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          outcome_id: string;
          approver_label: string;
          status?: 'pending' | 'approved' | 'rejected';
          approved_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['outcome_approvals']['Insert']>;
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          full_name: string;
          organisation: string | null;
          email: string;
          use_case: string;
          description: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          full_name: string;
          organisation?: string | null;
          email: string;
          use_case: string;
          description: string;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: Partial<Database['public']['Tables']['access_requests']['Insert']>;
        Relationships: [];
      };
      session_messages: {
        Row: {
          id: string;
          session_id: string;
          sender_label: string;
          sender_role: 'facilitator' | 'participant';
          body: string;
          sent_at: string;
        };
        Insert: {
          session_id: string;
          sender_label: string;
          sender_role: 'facilitator' | 'participant';
          body: string;
        };
        Update: never;
        Relationships: [];
      };
      session_resolution_items: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          description: string | null;
          owner_org: string | null;
          target_days: number | null;
          support_count: number;
          rank_order: number | null;
          status: 'proposed' | 'shortlisted' | 'archived';
          proposed_by_label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          title: string;
          description?: string | null;
          owner_org?: string | null;
          target_days?: number | null;
          support_count?: number;
          rank_order?: number | null;
          status?: 'proposed' | 'shortlisted' | 'archived';
          proposed_by_label?: string | null;
        };
        Update: Partial<Database['public']['Tables']['session_resolution_items']['Insert']> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      session_resolution_supports: {
        Row: {
          id: string;
          item_id: string;
          participant_id: string;
          created_at: string;
        };
        Insert: {
          item_id: string;
          participant_id: string;
        };
        Update: never;
        Relationships: [];
      };
      session_audit_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          actor_role: string | null;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          session_id: string;
          event_type: string;
          actor_role?: string | null;
          actor_id?: string | null;
          metadata?: Json;
        };
        Update: never;
        Relationships: [];
      };
      workflow_notifications: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          event_type: string;
          title: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          session_id?: string | null;
          event_type: string;
          title: string;
          body: string;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
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
      moderator_flag_and_archive: {
        Args: { p_target_type: string; p_target_id: string; p_reason: string };
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
      auth_user_is_moderator: {
        Args: Record<string, never>;
        Returns: boolean;
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
