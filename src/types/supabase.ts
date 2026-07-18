/**
 * Auto-generated Supabase Database types.
 * Source: linked project via `npx supabase gen types typescript --project-id <ref>`
 * Local (preferred when Docker is up): `npx supabase gen types typescript --local`
 *
 * Import:
 *   import type { Database } from '@/types/supabase'
 *
 * Do not hand-edit table shapes — regenerate after migrations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      conflict_severity_snapshots: {
        Row: {
          component_scores: Json;
          created_at: string;
          csi_score: number;
          detected_escalation: boolean;
          escalation_velocity_signal: number;
          grievance_signal: number;
          id: string;
          ingroup_outgroup_signal: number;
          message_count: number;
          period_end: string;
          period_start: string;
          region_key: string;
          resource_signal: number;
          sentiment_signal: number;
          severity_band: string;
          snapshot_at: string;
          squad_count: number;
          top_grievances: Json;
          violence_normalization_signal: number;
        };
        Insert: {
          component_scores?: Json;
          created_at?: string;
          csi_score: number;
          detected_escalation?: boolean;
          escalation_velocity_signal: number;
          grievance_signal: number;
          id?: string;
          ingroup_outgroup_signal: number;
          message_count?: number;
          period_end: string;
          period_start: string;
          region_key: string;
          resource_signal: number;
          sentiment_signal: number;
          severity_band: string;
          snapshot_at?: string;
          squad_count?: number;
          top_grievances?: Json;
          violence_normalization_signal: number;
        };
        Update: {
          component_scores?: Json;
          created_at?: string;
          csi_score?: number;
          detected_escalation?: boolean;
          escalation_velocity_signal?: number;
          grievance_signal?: number;
          id?: string;
          ingroup_outgroup_signal?: number;
          message_count?: number;
          period_end?: string;
          period_start?: string;
          region_key?: string;
          resource_signal?: number;
          sentiment_signal?: number;
          severity_band?: string;
          snapshot_at?: string;
          squad_count?: number;
          top_grievances?: Json;
          violence_normalization_signal?: number;
        };
        Relationships: [];
      };
      crisis_alerts: {
        Row: {
          acknowledged_at: string | null;
          acknowledged_by: string | null;
          actor_user_id: string;
          created_at: string;
          id: string;
          reason_code: string;
          squad_id: string;
        };
        Insert: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          actor_user_id: string;
          created_at?: string;
          id?: string;
          reason_code: string;
          squad_id: string;
        };
        Update: {
          acknowledged_at?: string | null;
          acknowledged_by?: string | null;
          actor_user_id?: string;
          created_at?: string;
          id?: string;
          reason_code?: string;
          squad_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'crisis_alerts_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      demo_session_claims: {
        Row: {
          anon_user_id: string;
          claim_code: string;
          consent_issued_at: string | null;
          consent_token: string | null;
          consent_user_id: string | null;
          consumed_at: string | null;
          created_at: string;
          verified_user_id: string | null;
        };
        Insert: {
          anon_user_id: string;
          claim_code: string;
          consent_issued_at?: string | null;
          consent_token?: string | null;
          consent_user_id?: string | null;
          consumed_at?: string | null;
          created_at?: string;
          verified_user_id?: string | null;
        };
        Update: {
          anon_user_id?: string;
          claim_code?: string;
          consent_issued_at?: string | null;
          consent_token?: string | null;
          consent_user_id?: string | null;
          consumed_at?: string | null;
          created_at?: string;
          verified_user_id?: string | null;
        };
        Relationships: [];
      };
      escalation_alerts: {
        Row: {
          created_at: string;
          csi_score: number | null;
          id: string;
          metadata: Json;
          recommended_action: string;
          region_key: string | null;
          severity_level: string;
          source_snapshot_id: string | null;
          squad_id: string;
          triggered_at: string;
        };
        Insert: {
          created_at?: string;
          csi_score?: number | null;
          id?: string;
          metadata?: Json;
          recommended_action?: string;
          region_key?: string | null;
          severity_level: string;
          source_snapshot_id?: string | null;
          squad_id: string;
          triggered_at?: string;
        };
        Update: {
          created_at?: string;
          csi_score?: number | null;
          id?: string;
          metadata?: Json;
          recommended_action?: string;
          region_key?: string | null;
          severity_level?: string;
          source_snapshot_id?: string | null;
          squad_id?: string;
          triggered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'escalation_alerts_source_snapshot_id_fkey';
            columns: ['source_snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'conflict_severity_snapshots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escalation_alerts_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      financial_projections: {
        Row: {
          arr_usd: number;
          burn_rate_usd: number | null;
          created_at: string;
          id: string;
          mau: number;
          notes: string | null;
          period_end: string;
          period_label: string;
          period_start: string;
          revenue_usd: number;
          runway_months: number | null;
          scenario: string;
          updated_at: string;
        };
        Insert: {
          arr_usd?: number;
          burn_rate_usd?: number | null;
          created_at?: string;
          id?: string;
          mau?: number;
          notes?: string | null;
          period_end: string;
          period_label: string;
          period_start: string;
          revenue_usd?: number;
          runway_months?: number | null;
          scenario: string;
          updated_at?: string;
        };
        Update: {
          arr_usd?: number;
          burn_rate_usd?: number | null;
          created_at?: string;
          id?: string;
          mau?: number;
          notes?: string | null;
          period_end?: string;
          period_label?: string;
          period_start?: string;
          revenue_usd?: number;
          runway_months?: number | null;
          scenario?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interventions: {
        Row: {
          id: string;
          intervention_type: string;
          squad_id: string | null;
          triggered_at: string;
        };
        Insert: {
          id?: string;
          intervention_type: string;
          squad_id?: string | null;
          triggered_at?: string;
        };
        Update: {
          id?: string;
          intervention_type?: string;
          squad_id?: string | null;
          triggered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interventions_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      issuer_groups: {
        Row: {
          current_root: string;
          current_root_expires_at: string;
          enrolled_at: string;
          group_id: string;
          last_refreshed_at: string;
          manifest_url: string;
          signing_key_ed25519: string;
          tree_depth: number;
        };
        Insert: {
          current_root: string;
          current_root_expires_at: string;
          enrolled_at?: string;
          group_id: string;
          last_refreshed_at?: string;
          manifest_url: string;
          signing_key_ed25519: string;
          tree_depth: number;
        };
        Update: {
          current_root?: string;
          current_root_expires_at?: string;
          enrolled_at?: string;
          group_id?: string;
          last_refreshed_at?: string;
          manifest_url?: string;
          signing_key_ed25519?: string;
          tree_depth?: number;
        };
        Relationships: [];
      };
      ledger_proposal_votes: {
        Row: {
          id: string;
          proposal_id: string;
          squad_id: string;
          user_id: string;
          vote: string;
          voted_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          squad_id: string;
          user_id: string;
          vote: string;
          voted_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          squad_id?: string;
          user_id?: string;
          vote?: string;
          voted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ledger_proposal_votes_proposal_id_fkey';
            columns: ['proposal_id'];
            isOneToOne: false;
            referencedRelation: 'ledger_proposal_vote_summary';
            referencedColumns: ['proposal_id'];
          },
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
          {
            foreignKeyName: 'ledger_proposal_votes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      ledger_proposals: {
        Row: {
          consensus_items: Json;
          created_at: string;
          id: string;
          ledger_ref: string | null;
          outcome_extras: Json;
          published_at: string | null;
          slug: string;
          squad_id: string | null;
          status: string;
          summary: string;
          tags: string[];
          title: string;
        };
        Insert: {
          consensus_items?: Json;
          created_at?: string;
          id?: string;
          ledger_ref?: string | null;
          outcome_extras?: Json;
          published_at?: string | null;
          slug: string;
          squad_id?: string | null;
          status?: string;
          summary: string;
          tags?: string[];
          title: string;
        };
        Update: {
          consensus_items?: Json;
          created_at?: string;
          id?: string;
          ledger_ref?: string | null;
          outcome_extras?: Json;
          published_at?: string | null;
          slug?: string;
          squad_id?: string | null;
          status?: string;
          summary?: string;
          tags?: string[];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ledger_proposals_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      match_queue: {
        Row: {
          enqueued_at: string;
          expires_at: string | null;
          id: string;
          matched_at: string | null;
          pool_key: string;
          side: string;
          squad_id: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          enqueued_at?: string;
          expires_at?: string | null;
          id?: string;
          matched_at?: string | null;
          pool_key: string;
          side: string;
          squad_id?: string | null;
          status: string;
          user_id: string;
        };
        Update: {
          enqueued_at?: string;
          expires_at?: string | null;
          id?: string;
          matched_at?: string | null;
          pool_key?: string;
          side?: string;
          squad_id?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'match_queue_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'match_queue_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      matchmaking_sweep_runs: {
        Row: {
          id: number;
          pool_keys_swept: number;
          ran_at: string;
        };
        Insert: {
          id?: number;
          pool_keys_swept?: number;
          ran_at?: string;
        };
        Update: {
          id?: number;
          pool_keys_swept?: number;
          ran_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          expires_at: string | null;
          id: string;
          payload_ciphertext: string;
          sender_id: string | null;
          sent_at: string;
          squad_id: string | null;
          status: string | null;
        };
        Insert: {
          expires_at?: string | null;
          id?: string;
          payload_ciphertext: string;
          sender_id?: string | null;
          sent_at?: string;
          squad_id?: string | null;
          status?: string | null;
        };
        Update: {
          expires_at?: string | null;
          id?: string;
          payload_ciphertext?: string;
          sender_id?: string | null;
          sent_at?: string;
          squad_id?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      moderation_audit_log: {
        Row: {
          action: string;
          actor_user_id: string;
          created_at: string;
          id: string;
          metadata: Json;
          target_id: string | null;
          target_type: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
        };
        Relationships: [];
      };
      moderators: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          /** Pseudonymous in-room handle (phase1). Not the invite `display_name`. */
          callsign: string;
          created_at: string;
          /** Invite-only / auth shell (20260704 reconcile). */
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          era_affiliation: string | null;
          id: string;
          language: string | null;
          last_dashboard: string | null;
          /** Invite onboarding flag (boolean). Prefer over renaming to onboarded_at. */
          onboarding_completed: boolean | null;
          /** Phase1 timestamp when operator identity onboarding finished. */
          onboarding_completed_at: string | null;
          primary_role: string | null;
          region_hint: string | null;
          /**
           * Phase1 role lane (`role_archetype`), not a column named `role`.
           * CHECK: strategist|analyst|policy|mediator|field|other
           */
          role_archetype: string | null;
          /** Required (and 8–100 chars) when role_archetype = 'other'. */
          role_other_detail: string | null;
          status: string | null;
          tags: string[];
          timezone_window: string | null;
          updated_at: string;
        };
        Insert: {
          callsign?: string;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          era_affiliation?: string | null;
          id: string;
          language?: string | null;
          last_dashboard?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          primary_role?: string | null;
          region_hint?: string | null;
          role_archetype?: string | null;
          role_other_detail?: string | null;
          status?: string | null;
          tags?: string[];
          timezone_window?: string | null;
          updated_at?: string;
        };
        Update: {
          callsign?: string;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          era_affiliation?: string | null;
          id?: string;
          language?: string | null;
          last_dashboard?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_completed_at?: string | null;
          primary_role?: string | null;
          region_hint?: string | null;
          role_archetype?: string | null;
          role_other_detail?: string | null;
          status?: string | null;
          tags?: string[];
          timezone_window?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      retention_cleanup_runs: {
        Row: {
          duration_ms: number;
          id: number;
          match_queue_deleted: number;
          messages_deleted: number;
          ran_at: string;
          squads_deleted: number;
          zk_proofs_deleted: number;
        };
        Insert: {
          duration_ms?: number;
          id?: number;
          match_queue_deleted?: number;
          messages_deleted?: number;
          ran_at?: string;
          squads_deleted?: number;
          zk_proofs_deleted?: number;
        };
        Update: {
          duration_ms?: number;
          id?: number;
          match_queue_deleted?: number;
          messages_deleted?: number;
          ran_at?: string;
          squads_deleted?: number;
          zk_proofs_deleted?: number;
        };
        Relationships: [];
      };
      sentiment_metrics: {
        Row: {
          id: string;
          recorded_at: string;
          squad_id: string | null;
          tension_level: number;
        };
        Insert: {
          id?: string;
          recorded_at?: string;
          squad_id?: string | null;
          tension_level: number;
        };
        Update: {
          id?: string;
          recorded_at?: string;
          squad_id?: string | null;
          tension_level?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'sentiment_metrics_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      squad_members: {
        Row: {
          joined_at: string;
          squad_id: string;
          user_id: string;
        };
        Insert: {
          joined_at?: string;
          squad_id: string;
          user_id: string;
        };
        Update: {
          joined_at?: string;
          squad_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'squad_members_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'squad_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      squads: {
        Row: {
          archived_at: string | null;
          archived_encryption_key_snapshot: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          message_encryption_key: string | null;
          status: string | null;
          topic: string;
        };
        Insert: {
          archived_at?: string | null;
          archived_encryption_key_snapshot?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          message_encryption_key?: string | null;
          status?: string | null;
          topic: string;
        };
        Update: {
          archived_at?: string | null;
          archived_encryption_key_snapshot?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          message_encryption_key?: string | null;
          status?: string | null;
          topic?: string;
        };
        Relationships: [];
      };
      user_notification_prefs: {
        Row: {
          email_pilot_updates: boolean;
          in_app_publish_alerts: boolean;
          in_app_session_alerts: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          email_pilot_updates?: boolean;
          in_app_publish_alerts?: boolean;
          in_app_session_alerts?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          email_pilot_updates?: boolean;
          in_app_publish_alerts?: boolean;
          in_app_session_alerts?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_notification_prefs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          id: string;
          institution_id: string | null;
          role_key: string;
          user_id: string;
          workspace_id: string | null;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          institution_id?: string | null;
          role_key: string;
          user_id: string;
          workspace_id?: string | null;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          institution_id?: string | null;
          role_key?: string;
          user_id?: string;
          workspace_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          id: string;
          status: string | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          status?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: string | null;
        };
        Relationships: [];
      };
      verified_attributes: {
        Row: {
          attribute_type: string;
          attribute_value: string;
          id: string;
          user_id: string | null;
          verified_at: string;
        };
        Insert: {
          attribute_type: string;
          attribute_value: string;
          id?: string;
          user_id?: string | null;
          verified_at?: string;
        };
        Update: {
          attribute_type?: string;
          attribute_value?: string;
          id?: string;
          user_id?: string | null;
          verified_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'verified_attributes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      waitlist_signups: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          role_hint: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          role_hint?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          role_hint?: string | null;
        };
        Relationships: [];
      };
      zk_proof_submissions: {
        Row: {
          attribute_scope: string;
          created_at: string;
          expires_at: string;
          id: string;
          issuer_group_id: string | null;
          nullifier_hash: string;
          proof_commitment: string;
          user_id: string;
        };
        Insert: {
          attribute_scope: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          issuer_group_id?: string | null;
          nullifier_hash: string;
          proof_commitment: string;
          user_id: string;
        };
        Update: {
          attribute_scope?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          issuer_group_id?: string | null;
          nullifier_hash?: string;
          proof_commitment?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'zk_proof_submissions_issuer_group_id_fkey';
            columns: ['issuer_group_id'];
            isOneToOne: false;
            referencedRelation: 'issuer_groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'zk_proof_submissions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      ledger_proposal_vote_summary: {
        Row: {
          abstain_count: number | null;
          approve_count: number | null;
          proposal_id: string | null;
          reject_count: number | null;
          squad_id: string | null;
          status: string | null;
          total_eligible: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ledger_proposals_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      pilot_claim_finalize_24h: {
        Row: {
          finalized_count: number | null;
          finalized_without_verified_user: number | null;
          pending_count: number | null;
        };
        Relationships: [];
      };
      pilot_crisis_alerts_open: {
        Row: {
          created_at: string | null;
          id: string | null;
          open_seconds: number | null;
          reason_code: string | null;
          squad_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string | null;
          open_seconds?: never;
          reason_code?: string | null;
          squad_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string | null;
          open_seconds?: never;
          reason_code?: string | null;
          squad_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'crisis_alerts_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      pilot_decrypt_audit_24h: {
        Row: {
          decrypt_count: number | null;
          distinct_moderators: number | null;
          distinct_squads: number | null;
          hour_bucket: string | null;
        };
        Relationships: [];
      };
      pilot_key_creation_events_24h: {
        Row: {
          hour_bucket: string | null;
          squads_created: number | null;
        };
        Relationships: [];
      };
      pilot_match_latency_24h: {
        Row: {
          avg_match_seconds: number | null;
          matched_count: number | null;
          max_match_seconds: number | null;
          pool_key: string | null;
        };
        Relationships: [];
      };
      pilot_match_queue_depth: {
        Row: {
          newest_enqueued_at: string | null;
          oldest_enqueued_at: string | null;
          pool_key: string | null;
          row_count: number | null;
          side: string | null;
          status: string | null;
        };
        Relationships: [];
      };
      pilot_retention_cleanup_24h: {
        Row: {
          hour_bucket: string | null;
          last_run_at: string | null;
          match_queue_deleted: number | null;
          messages_deleted: number | null;
          run_count: number | null;
          slowest_duration_ms: number | null;
          squads_deleted: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      auth_user_is_squad_member: {
        Args: { p_squad_id: string };
        Returns: boolean;
      };
      create_demo_session_claim: { Args: never; Returns: string };
      create_demo_squad: { Args: never; Returns: string };
      finalize_demo_session_claim: {
        Args: { p_claim_code: string; p_consent_token: string };
        Returns: Json;
      };
      get_my_messages_review_status: {
        Args: { p_message_ids: string[] };
        Returns: {
          message_id: string;
          reviewed_at: string;
        }[];
      };
      get_or_create_squad_message_key: {
        Args: { p_squad_id: string };
        Returns: string;
      };
      get_squad_peer_profiles: {
        Args: { p_squad_id: string };
        Returns: {
          callsign: string;
          region_hint: string;
          role_archetype: string;
          role_other_detail: string;
          tags: string[];
          user_id: string;
        }[];
      };
      issue_demo_claim_consent: {
        Args: { p_claim_code: string };
        Returns: Json;
      };
      matchmaking_cancel_waiting: {
        Args: { p_pool_key: string };
        Returns: undefined;
      };
      matchmaking_enqueue_and_try: {
        Args: { p_pool_key: string; p_side: string };
        Returns: Json;
      };
      matchmaking_pool_snapshot: { Args: { p_pool_key: string }; Returns: Json };
      matchmaking_queue_stats: { Args: never; Returns: Json };
      matchmaking_sweep_active_pools: { Args: never; Returns: undefined };
      messages_latest_window: {
        Args: { p_limit: number; p_squad_id: string };
        Returns: {
          expires_at: string | null;
          id: string;
          payload_ciphertext: string;
          sender_id: string | null;
          sent_at: string;
          squad_id: string | null;
          status: string | null;
        }[];
        SetofOptions: {
          from: '*';
          to: 'messages';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      messages_older_than: {
        Args: {
          p_id: string;
          p_limit: number;
          p_sent_at: string;
          p_squad_id: string;
        };
        Returns: {
          expires_at: string | null;
          id: string;
          payload_ciphertext: string;
          sender_id: string | null;
          sent_at: string;
          squad_id: string | null;
          status: string | null;
        }[];
        SetofOptions: {
          from: '*';
          to: 'messages';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      moderator_archive_squad: {
        Args: { p_squad_id: string };
        Returns: undefined;
      };
      moderator_flag_and_archive: {
        Args: { p_target_type: string; p_target_id: string; p_reason: string };
        Returns: undefined;
      };
      moderator_flag_message: {
        Args: { p_message_id: string; p_reason: string };
        Returns: undefined;
      };
      moderator_record_decrypt_audit: {
        Args: { p_justification: string; p_message_id: string };
        Returns: undefined;
      };
      auth_user_is_moderator: { Args: never; Returns: boolean };
      run_expired_data_cleanup: {
        Args: never;
        Returns: {
          duration_ms: number;
          id: number;
          match_queue_deleted: number;
          messages_deleted: number;
          ran_at: string;
          squads_deleted: number;
        };
        SetofOptions: {
          from: '*';
          to: 'retention_cleanup_runs';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      waitlist_signup_count: { Args: never; Returns: number };
      get_waitlist_count: { Args: never; Returns: number };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
