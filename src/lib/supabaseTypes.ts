// Auto-generated Supabase types for SquadRidge v2.
// Regenerate with: supabase gen types typescript --project-id <id> > src/lib/supabaseTypes.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
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
          language: string;
          max_participants: number;
          eligibility_notes: string | null;
          identity_verification_required: boolean;
          outcome_public: boolean;
          status: 'setup' | 'open' | 'live' | 'paused' | 'ended' | 'released';
          template_id?: string | null;
          setup_config?: Json;
        };
        Update: {
          status?: 'setup' | 'open' | 'live' | 'paused' | 'ended' | 'released';
          updated_at?: string;
          template_id?: string | null;
          setup_config?: Json;
        };
      };
      participants: {
        Row: {
          id: string;
          session_id: string;
          codename: string;
          invite_token: string;
          invite_used: boolean;
          invite_expires_at: string;
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
        Update: {
          verification_status?: 'pending' | 'verified' | 'denied';
          invite_used?: boolean;
          admitted_at?: string | null;
          left_at?: string | null;
        };
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
          status: 'draft' | 'pending_approval' | 'approved' | 'published';
          published_at?: string | null;
          ledger_sha?: string | null;
        };
        Update: {
          summary?: string;
          agreed_terms?: string | null;
          pending_items?: string | null;
          facilitator_notes?: string | null;
          status?: 'draft' | 'pending_approval' | 'approved' | 'published';
          published_at?: string | null;
          ledger_sha?: string | null;
          updated_at?: string;
        };
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
        Insert: Omit<Database['public']['Tables']['outcome_approvals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['outcome_approvals']['Insert']>;
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
        };
        Update: Partial<Database['public']['Tables']['access_requests']['Insert']>;
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
        Update: {
          title?: string;
          description?: string | null;
          owner_org?: string | null;
          target_days?: number | null;
          support_count?: number;
          rank_order?: number | null;
          status?: 'proposed' | 'shortlisted' | 'archived';
          proposed_by_label?: string | null;
          updated_at?: string;
        };
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
      };
    };
    Views: Record<string, never>;
    Functions: {
      validate_participant_token: {
        Args: { p_token: string };
        Returns: Json;
      };
      record_participant_consent: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_mark_document_submitted: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_record_contact_hash: {
        Args: { p_token: string; p_email: string };
        Returns: Json;
      };
      submit_access_request: {
        Args: {
          p_full_name: string;
          p_email: string;
          p_use_case: string;
          p_description: string;
          p_organisation?: string | null;
        };
        Returns: Json;
      };
      participant_send_message: {
        Args: { p_token: string; p_body: string };
        Returns: Json;
      };
      participant_list_messages: {
        Args: { p_token: string };
        Returns: Json;
      };
      release_outcome: {
        Args: { p_outcome_id: string };
        Returns: Json;
      };
      transition_session_status: {
        Args: { p_session_id: string; p_status: string };
        Returns: Json;
      };
      list_session_resolutions_for_participant: {
        Args: { p_token: string };
        Returns: Json;
      };
      participant_support_resolution: {
        Args: { p_token: string; p_item_id: string };
        Returns: Json;
      };
      outcome_contains_verbatim_room_content: {
        Args: { p_outcome_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Session = Database['public']['Tables']['sessions']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type OutcomeRecord = Database['public']['Tables']['outcome_records']['Row'];
export type OutcomeApproval = Database['public']['Tables']['outcome_approvals']['Row'];
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
export type SessionMessage = Database['public']['Tables']['session_messages']['Row'];
