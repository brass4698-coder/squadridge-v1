export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string;
          description: string;
          email: string;
          full_name: string;
          id: string;
          organisation: string | null;
          organization: string | null;
          review_notes: string | null;
          reviewed_by: string | null;
          role_requested: string | null;
          status: string;
          updated_at: string | null;
          use_case: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          email: string;
          full_name: string;
          id?: string;
          organisation?: string | null;
          organization?: string | null;
          review_notes?: string | null;
          reviewed_by?: string | null;
          role_requested?: string | null;
          status?: string;
          updated_at?: string | null;
          use_case: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          email?: string;
          full_name?: string;
          id?: string;
          organisation?: string | null;
          organization?: string | null;
          review_notes?: string | null;
          reviewed_by?: string | null;
          role_requested?: string | null;
          status?: string;
          updated_at?: string | null;
          use_case?: string;
        };
        Relationships: [];
      };
      app_preferences: {
        Row: {
          created_at: string;
          density: string | null;
          last_dashboard: string | null;
          theme: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          density?: string | null;
          last_dashboard?: string | null;
          theme?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          density?: string | null;
          last_dashboard?: string | null;
          theme?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'app_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_events: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          event_type: string;
          id: string;
          metadata: Json;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          event_type: string;
          id?: string;
          metadata?: Json;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_events_actor_user_id_fkey';
            columns: ['actor_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
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
      deck_access_grants: {
        Row: {
          audience_scopes: string[];
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invite_token: string;
          issued_by: string | null;
          label: string | null;
          metadata: Json;
          redeemed_at: string | null;
          revoked_at: string | null;
          user_id: string | null;
        };
        Insert: {
          audience_scopes?: string[];
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          invite_token: string;
          issued_by?: string | null;
          label?: string | null;
          metadata?: Json;
          redeemed_at?: string | null;
          revoked_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          audience_scopes?: string[];
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invite_token?: string;
          issued_by?: string | null;
          label?: string | null;
          metadata?: Json;
          redeemed_at?: string | null;
          revoked_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'deck_access_grants_issued_by_fkey';
            columns: ['issued_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deck_access_grants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
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
      incident_items: {
        Row: {
          author_id: string;
          body: string;
          content_warning: string | null;
          created_at: string;
          id: string;
          lane: string;
          moderation_note: string | null;
          moderation_state: string;
          moderator_id: string | null;
          room_id: string;
          source_type: string;
          source_url: string | null;
          title: string;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          author_id: string;
          body: string;
          content_warning?: string | null;
          created_at?: string;
          id?: string;
          lane: string;
          moderation_note?: string | null;
          moderation_state?: string;
          moderator_id?: string | null;
          room_id: string;
          source_type?: string;
          source_url?: string | null;
          title: string;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          content_warning?: string | null;
          created_at?: string;
          id?: string;
          lane?: string;
          moderation_note?: string | null;
          moderation_state?: string;
          moderator_id?: string | null;
          room_id?: string;
          source_type?: string;
          source_url?: string | null;
          title?: string;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_items_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_messages: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          id: string;
          is_facilitator: boolean;
          moderation_state: string;
          thread_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          id?: string;
          is_facilitator?: boolean;
          moderation_state?: string;
          thread_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          is_facilitator?: boolean;
          moderation_state?: string;
          thread_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_messages_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'incident_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_room_participants: {
        Row: {
          joined_at: string;
          role: string;
          room_id: string;
          user_id: string;
        };
        Insert: {
          joined_at?: string;
          role?: string;
          room_id: string;
          user_id: string;
        };
        Update: {
          joined_at?: string;
          role?: string;
          room_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_room_participants_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      incident_rooms: {
        Row: {
          closed_at: string | null;
          created_at: string;
          description: string;
          facilitator_id: string;
          id: string;
          severity_tier: string;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string;
          description?: string;
          facilitator_id: string;
          id?: string;
          severity_tier?: string;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string;
          description?: string;
          facilitator_id?: string;
          id?: string;
          severity_tier?: string;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      incident_threads: {
        Row: {
          created_at: string;
          id: string;
          item_id: string | null;
          room_id: string;
          status: string;
          topic: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id?: string | null;
          room_id: string;
          status?: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string | null;
          room_id?: string;
          status?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incident_threads_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'incident_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'incident_threads_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'incident_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      institutions: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
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
      invites: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          institution_id: string | null;
          invite_type: string;
          issued_by: string | null;
          metadata: Json;
          revoked_at: string | null;
          role_key: string;
          token: string;
          used_at: string | null;
          workspace_id: string | null;
        };
        Insert: {
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          institution_id?: string | null;
          invite_type: string;
          issued_by?: string | null;
          metadata?: Json;
          revoked_at?: string | null;
          role_key: string;
          token: string;
          used_at?: string | null;
          workspace_id?: string | null;
        };
        Update: {
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          institution_id?: string | null;
          invite_type?: string;
          issued_by?: string | null;
          metadata?: Json;
          revoked_at?: string | null;
          role_key?: string;
          token?: string;
          used_at?: string | null;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invites_auth_user_id_fkey';
            columns: ['auth_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invites_institution_id_fkey';
            columns: ['institution_id'];
            isOneToOne: false;
            referencedRelation: 'institutions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invites_issued_by_fkey';
            columns: ['issued_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invites_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
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
          actor_user_id: string | null;
          created_at: string;
          id: string;
          metadata: Json;
          target_id: string | null;
          target_type: string | null;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
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
      outcome_approvals: {
        Row: {
          approval_source: string;
          approved_at: string | null;
          approver_label: string;
          created_at: string;
          dispute_note: string | null;
          id: string;
          outcome_id: string;
          participant_id: string | null;
          status: string;
        };
        Insert: {
          approval_source?: string;
          approved_at?: string | null;
          approver_label: string;
          created_at?: string;
          dispute_note?: string | null;
          id?: string;
          outcome_id: string;
          participant_id?: string | null;
          status?: string;
        };
        Update: {
          approval_source?: string;
          approved_at?: string | null;
          approver_label?: string;
          created_at?: string;
          dispute_note?: string | null;
          id?: string;
          outcome_id?: string;
          participant_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'outcome_approvals_outcome_id_fkey';
            columns: ['outcome_id'];
            isOneToOne: false;
            referencedRelation: 'outcome_records';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'outcome_approvals_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
      outcome_records: {
        Row: {
          agreed_terms: string | null;
          created_at: string;
          facilitator_notes: string | null;
          id: string;
          ledger_sha: string | null;
          pending_items: string | null;
          published_at: string | null;
          session_id: string;
          status: string;
          summary: string;
          timestamp_authority: string | null;
          timestamp_status: string | null;
          timestamp_token: string | null;
          timestamped_at: string | null;
          updated_at: string;
        };
        Insert: {
          agreed_terms?: string | null;
          created_at?: string;
          facilitator_notes?: string | null;
          id?: string;
          ledger_sha?: string | null;
          pending_items?: string | null;
          published_at?: string | null;
          session_id: string;
          status?: string;
          summary: string;
          timestamp_authority?: string | null;
          timestamp_status?: string | null;
          timestamp_token?: string | null;
          timestamped_at?: string | null;
          updated_at?: string;
        };
        Update: {
          agreed_terms?: string | null;
          created_at?: string;
          facilitator_notes?: string | null;
          id?: string;
          ledger_sha?: string | null;
          pending_items?: string | null;
          published_at?: string | null;
          session_id?: string;
          status?: string;
          summary?: string;
          timestamp_authority?: string | null;
          timestamp_status?: string | null;
          timestamp_token?: string | null;
          timestamped_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'outcome_records_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      participant_pacing: {
        Row: {
          acknowledge_required: boolean;
          acknowledged_at: string | null;
          participant_id: string;
          posting_blocked_until: string | null;
          updated_at: string;
          warning_level: string;
          warning_message: string | null;
        };
        Insert: {
          acknowledge_required?: boolean;
          acknowledged_at?: string | null;
          participant_id: string;
          posting_blocked_until?: string | null;
          updated_at?: string;
          warning_level?: string;
          warning_message?: string | null;
        };
        Update: {
          acknowledge_required?: boolean;
          acknowledged_at?: string | null;
          participant_id?: string;
          posting_blocked_until?: string | null;
          updated_at?: string;
          warning_level?: string;
          warning_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'participant_pacing_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: true;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
      participants: {
        Row: {
          admitted_at: string | null;
          codename: string;
          consented_at: string | null;
          created_at: string;
          document_submitted: boolean;
          email_hash: string | null;
          id: string;
          invite_expires_at: string;
          invite_token: string;
          invite_used: boolean;
          left_at: string | null;
          participation_reason: string | null;
          session_id: string;
          updated_at: string;
          verification_status: string;
        };
        Insert: {
          admitted_at?: string | null;
          codename: string;
          consented_at?: string | null;
          created_at?: string;
          document_submitted?: boolean;
          email_hash?: string | null;
          id?: string;
          invite_expires_at?: string;
          invite_token: string;
          invite_used?: boolean;
          left_at?: string | null;
          participation_reason?: string | null;
          session_id: string;
          updated_at?: string;
          verification_status?: string;
        };
        Update: {
          admitted_at?: string | null;
          codename?: string;
          consented_at?: string | null;
          created_at?: string;
          document_submitted?: boolean;
          email_hash?: string | null;
          id?: string;
          invite_expires_at?: string;
          invite_token?: string;
          invite_used?: boolean;
          left_at?: string | null;
          participation_reason?: string | null;
          session_id?: string;
          updated_at?: string;
          verification_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          callsign: string;
          created_at: string;
          display_name: string | null;
          email: string | null;
          era_affiliation: string | null;
          id: string;
          language: string | null;
          last_dashboard: string | null;
          onboarding_completed: boolean | null;
          onboarding_completed_at: string | null;
          primary_role: string | null;
          region_hint: string | null;
          role_archetype: string | null;
          role_other_detail: string | null;
          status: string | null;
          tags: string[];
          timezone_window: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          callsign?: string;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
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
          avatar_url?: string | null;
          callsign?: string;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
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
      roles: {
        Row: {
          description: string | null;
          id: string;
          key: string;
          label: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          key: string;
          label: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          key?: string;
          label?: string;
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
      session_analysis: {
        Row: {
          analysis_json: Json;
          created_at: string | null;
          id: string;
          ranked_proposals: Json;
          squad_id: string;
        };
        Insert: {
          analysis_json?: Json;
          created_at?: string | null;
          id?: string;
          ranked_proposals?: Json;
          squad_id: string;
        };
        Update: {
          analysis_json?: Json;
          created_at?: string | null;
          id?: string;
          ranked_proposals?: Json;
          squad_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_analysis_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: true;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
        ];
      };
      session_audit_events: {
        Row: {
          actor_id: string | null;
          actor_role: string | null;
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json;
          session_id: string;
        };
        Insert: {
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          session_id: string;
        };
        Update: {
          actor_id?: string | null;
          actor_role?: string | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_audit_events_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      session_inputs: {
        Row: {
          encrypted_content: string;
          id: string;
          is_final: boolean | null;
          squad_id: string;
          submitted_at: string | null;
          user_id: string;
        };
        Insert: {
          encrypted_content: string;
          id?: string;
          is_final?: boolean | null;
          squad_id: string;
          submitted_at?: string | null;
          user_id: string;
        };
        Update: {
          encrypted_content?: string;
          id?: string;
          is_final?: boolean | null;
          squad_id?: string;
          submitted_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_inputs_squad_id_fkey';
            columns: ['squad_id'];
            isOneToOne: false;
            referencedRelation: 'squads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_inputs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      session_messages: {
        Row: {
          body: string;
          id: string;
          sender_label: string;
          sender_role: string;
          sent_at: string;
          session_id: string;
        };
        Insert: {
          body: string;
          id?: string;
          sender_label: string;
          sender_role: string;
          sent_at?: string;
          session_id: string;
        };
        Update: {
          body?: string;
          id?: string;
          sender_label?: string;
          sender_role?: string;
          sent_at?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_messages_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      session_resolution_items: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          owner_org: string | null;
          proposed_by_label: string | null;
          rank_order: number | null;
          session_id: string;
          status: string;
          support_count: number;
          target_days: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          owner_org?: string | null;
          proposed_by_label?: string | null;
          rank_order?: number | null;
          session_id: string;
          status?: string;
          support_count?: number;
          target_days?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          owner_org?: string | null;
          proposed_by_label?: string | null;
          rank_order?: number | null;
          session_id?: string;
          status?: string;
          support_count?: number;
          target_days?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_resolution_items_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      session_resolution_supports: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          participant_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          participant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          participant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_resolution_supports_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'session_resolution_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_resolution_supports_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
      };
      session_room_pacing: {
        Row: {
          pacing_mode: string;
          posting_restricted_until: string | null;
          session_id: string;
          updated_at: string;
          updated_by: string | null;
          warning_message: string | null;
        };
        Insert: {
          pacing_mode?: string;
          posting_restricted_until?: string | null;
          session_id: string;
          updated_at?: string;
          updated_by?: string | null;
          warning_message?: string | null;
        };
        Update: {
          pacing_mode?: string;
          posting_restricted_until?: string | null;
          session_id?: string;
          updated_at?: string;
          updated_by?: string | null;
          warning_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'session_room_pacing_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: true;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_room_pacing_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      sessions: {
        Row: {
          conflict_type: string;
          created_at: string;
          dialogue_stage: string;
          disclosure_boundaries: string | null;
          eligibility_notes: string | null;
          facilitator_id: string;
          id: string;
          identity_verification_required: boolean;
          issue_goal: string | null;
          language: string;
          max_participants: number;
          outcome_public: boolean;
          risk_notes: string | null;
          setup_config: Json;
          status: string;
          template_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          conflict_type: string;
          created_at?: string;
          dialogue_stage?: string;
          disclosure_boundaries?: string | null;
          eligibility_notes?: string | null;
          facilitator_id: string;
          id?: string;
          identity_verification_required?: boolean;
          issue_goal?: string | null;
          language?: string;
          max_participants?: number;
          outcome_public?: boolean;
          risk_notes?: string | null;
          setup_config?: Json;
          status?: string;
          template_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          conflict_type?: string;
          created_at?: string;
          dialogue_stage?: string;
          disclosure_boundaries?: string | null;
          eligibility_notes?: string | null;
          facilitator_id?: string;
          id?: string;
          identity_verification_required?: boolean;
          issue_goal?: string | null;
          language?: string;
          max_participants?: number;
          outcome_public?: boolean;
          risk_notes?: string | null;
          setup_config?: Json;
          status?: string;
          template_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          current_phase: string | null;
          expires_at: string;
          id: string;
          input_duration_ms: number | null;
          max_participants: number | null;
          message_encryption_key: string | null;
          min_participants: number | null;
          negotiation_duration_ms: number | null;
          phase_started_at: string | null;
          session_question: string | null;
          status: string | null;
          topic: string;
        };
        Insert: {
          archived_at?: string | null;
          archived_encryption_key_snapshot?: string | null;
          created_at?: string;
          current_phase?: string | null;
          expires_at: string;
          id?: string;
          input_duration_ms?: number | null;
          max_participants?: number | null;
          message_encryption_key?: string | null;
          min_participants?: number | null;
          negotiation_duration_ms?: number | null;
          phase_started_at?: string | null;
          session_question?: string | null;
          status?: string | null;
          topic: string;
        };
        Update: {
          archived_at?: string | null;
          archived_encryption_key_snapshot?: string | null;
          created_at?: string;
          current_phase?: string | null;
          expires_at?: string;
          id?: string;
          input_duration_ms?: number | null;
          max_participants?: number | null;
          message_encryption_key?: string | null;
          min_participants?: number | null;
          negotiation_duration_ms?: number | null;
          phase_started_at?: string | null;
          session_question?: string | null;
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
        Relationships: [
          {
            foreignKeyName: 'user_roles_granted_by_fkey';
            columns: ['granted_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_role_key_fkey';
            columns: ['role_key'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['key'];
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
      verification_requests: {
        Row: {
          document_type: string | null;
          id: string;
          participant_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          storage_path: string | null;
          submitted_at: string;
        };
        Insert: {
          document_type?: string | null;
          id?: string;
          participant_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          storage_path?: string | null;
          submitted_at?: string;
        };
        Update: {
          document_type?: string | null;
          id?: string;
          participant_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          storage_path?: string | null;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'verification_requests_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          },
        ];
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
      workflow_notifications: {
        Row: {
          body: string;
          created_at: string;
          event_type: string;
          id: string;
          read_at: string | null;
          session_id: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          event_type: string;
          id?: string;
          read_at?: string | null;
          session_id?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          event_type?: string;
          id?: string;
          read_at?: string | null;
          session_id?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_notifications_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          institution_id: string;
          name: string;
          slug: string;
          status: string;
          type: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          institution_id: string;
          name: string;
          slug: string;
          status?: string;
          type?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          institution_id?: string;
          name?: string;
          slug?: string;
          status?: string;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workspaces_institution_id_fkey';
            columns: ['institution_id'];
            isOneToOne: false;
            referencedRelation: 'institutions';
            referencedColumns: ['id'];
          },
        ];
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
          expires_at: string;
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
      _log_session_audit_event_internal: {
        Args: {
          p_actor_id?: string;
          p_actor_role?: string;
          p_event_type: string;
          p_metadata?: Json;
          p_session_id: string;
        };
        Returns: undefined;
      };
      _participant_room_gate: {
        Args: { p_require_live?: boolean; p_token: string };
        Returns: Json;
      };
      accept_invite: {
        Args: { p_display_name: string; p_token: string; p_user_id: string };
        Returns: Json;
      };
      advance_session_phase: {
        Args: { p_next_phase: string; p_squad_id: string };
        Returns: undefined;
      };
      approve_access_request_and_issue_invite: {
        Args: {
          p_institution_id?: string;
          p_request_id: string;
          p_review_notes?: string;
          p_role_key: string;
          p_workspace_id?: string;
        };
        Returns: Json;
      };
      auth_user_has_role_keys: {
        Args: { p_role_keys: string[] };
        Returns: boolean;
      };
      auth_user_is_incident_room_moderator: {
        Args: { p_room_id: string };
        Returns: boolean;
      };
      auth_user_is_incident_room_participant: {
        Args: { p_room_id: string };
        Returns: boolean;
      };
      auth_user_is_incident_room_staff: {
        Args: { p_room_id: string };
        Returns: boolean;
      };
      auth_user_is_moderator: { Args: never; Returns: boolean };
      auth_user_is_platform_moderator: { Args: never; Returns: boolean };
      auth_user_is_squad_member: {
        Args: { p_squad_id: string };
        Returns: boolean;
      };
      cleanup_expired_messages: { Args: never; Returns: number };
      cleanup_expired_squads: { Args: never; Returns: number };
      cleanup_expired_zk_proofs: { Args: never; Returns: number };
      count_final_inputs: { Args: { p_squad_id: string }; Returns: number };
      create_demo_session_claim: { Args: never; Returns: string };
      create_demo_squad: { Args: never; Returns: string };
      create_invite: {
        Args: {
          p_email: string;
          p_expires_hours?: number;
          p_institution_id?: string;
          p_invite_type: string;
          p_metadata?: Json;
          p_role_key: string;
          p_workspace_id?: string;
        };
        Returns: Json;
      };
      dialogue_stage_allows_participant_post: {
        Args: { p_stage: string };
        Returns: boolean;
      };
      dialogue_stage_rank: { Args: { p_stage: string }; Returns: number };
      export_session_audit_trail: {
        Args: { p_session_id: string };
        Returns: Json;
      };
      facilitator_advance_dialogue_stage: {
        Args: { p_session_id: string; p_stage: string };
        Returns: Json;
      };
      facilitator_seed_outcome_approvals: {
        Args: { p_outcome_id: string };
        Returns: Json;
      };
      facilitator_set_approval_status: {
        Args: { p_approval_id: string; p_status: string };
        Returns: Json;
      };
      facilitator_set_participant_verification: {
        Args: { p_participant_id: string; p_status: string };
        Returns: Json;
      };
      facilitator_set_room_pacing: {
        Args: {
          p_message?: string;
          p_mode: string;
          p_restrict_minutes?: number;
          p_session_id: string;
        };
        Returns: Json;
      };
      finalize_demo_session_claim: {
        Args: { p_claim_code: string; p_consent_token: string };
        Returns: Json;
      };
      get_default_dashboard_for_user: {
        Args: { p_user_id?: string };
        Returns: string;
      };
      get_effective_user_roles: {
        Args: { p_user_id?: string };
        Returns: {
          granted_at: string;
          institution_id: string;
          role_key: string;
          workspace_id: string;
        }[];
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
      get_waitlist_count: { Args: never; Returns: number };
      grant_role_to_user: {
        Args: {
          p_institution_id?: string;
          p_role_key: string;
          p_target_user_id: string;
          p_workspace_id?: string;
        };
        Returns: Json;
      };
      has_deck_access: { Args: never; Returns: boolean };
      incident_text_contains_contact_info: {
        Args: { p_text: string };
        Returns: boolean;
      };
      issue_deck_invite: {
        Args: {
          p_audience_scopes?: string[];
          p_email: string;
          p_expires_hours?: number;
          p_label?: string;
        };
        Returns: Json;
      };
      issue_demo_claim_consent: {
        Args: { p_claim_code: string };
        Returns: Json;
      };
      list_session_resolutions_for_participant: {
        Args: { p_token: string };
        Returns: Json;
      };
      list_users_with_roles: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: {
          created_at: string;
          display_name: string;
          email: string;
          onboarding_completed: boolean;
          primary_role: string;
          roles: Json;
          status: string;
          user_id: string;
        }[];
      };
      log_session_audit_event: {
        Args: {
          p_actor_role?: string;
          p_event_type: string;
          p_metadata?: Json;
          p_session_id: string;
        };
        Returns: undefined;
      };
      log_ttl_purge: {
        Args: {
          p_deleted_count: number;
          p_metadata?: Json;
          p_target_type: string;
        };
        Returns: undefined;
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
        Args: { p_reason: string; p_target_id: string; p_target_type: string };
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
      notify_facilitator_workflow: {
        Args: {
          p_body: string;
          p_event_type: string;
          p_session_id: string;
          p_title: string;
        };
        Returns: undefined;
      };
      outcome_anchor_payload: {
        Args: {
          p_outcome: Database['public']['Tables']['outcome_records']['Row'];
        };
        Returns: string;
      };
      outcome_contains_verbatim_room_content: {
        Args: { p_outcome_id: string };
        Returns: boolean;
      };
      participant_acknowledge_pause: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_get_outcome_review: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_get_pacing: { Args: { p_token: string }; Returns: Json };
      participant_list_messages: { Args: { p_token: string }; Returns: Json };
      participant_mark_document_submitted: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_record_contact_hash: {
        Args: { p_email: string; p_token: string };
        Returns: Json;
      };
      participant_register_verification_document: {
        Args: {
          p_byte_size: number;
          p_document_type: string;
          p_storage_path: string;
          p_token: string;
        };
        Returns: Json;
      };
      participant_request_slow_down: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_review_outcome: {
        Args: { p_decision: string; p_dispute_note?: string; p_token: string };
        Returns: Json;
      };
      participant_send_message: {
        Args: { p_body: string; p_token: string };
        Returns: Json;
      };
      participant_support_resolution: {
        Args: { p_item_id: string; p_token: string };
        Returns: Json;
      };
      record_participant_consent: { Args: { p_token: string }; Returns: Json };
      record_participant_reason: {
        Args: { p_reason: string; p_token: string };
        Returns: Json;
      };
      redeem_deck_invite: { Args: { p_token: string }; Returns: Json };
      release_outcome: { Args: { p_outcome_id: string }; Returns: Json };
      revoke_invite: { Args: { p_invite_id: string }; Returns: Json };
      revoke_role_from_user: {
        Args: {
          p_institution_id?: string;
          p_role_key: string;
          p_target_user_id: string;
          p_workspace_id?: string;
        };
        Returns: Json;
      };
      run_expired_data_cleanup: {
        Args: never;
        Returns: {
          duration_ms: number;
          id: number;
          match_queue_deleted: number;
          messages_deleted: number;
          ran_at: string;
          squads_deleted: number;
          zk_proofs_deleted: number;
        };
        SetofOptions: {
          from: '*';
          to: 'retention_cleanup_runs';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_access_request: {
        Args: {
          p_description: string;
          p_email: string;
          p_full_name: string;
          p_organisation?: string;
          p_use_case: string;
        };
        Returns: Json;
      };
      sweep_matchmaking_queue: { Args: never; Returns: number };
      transition_session_status: {
        Args: { p_session_id: string; p_status: string };
        Returns: Json;
      };
      uuid_generate_v4: { Args: never; Returns: string };
      validate_invite_token: { Args: { p_token: string }; Returns: Json };
      validate_participant_token: { Args: { p_token: string }; Returns: Json };
      verify_outcome_anchor: { Args: { p_outcome_id: string }; Returns: Json };
      waitlist_signup_count: { Args: never; Returns: number };
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
