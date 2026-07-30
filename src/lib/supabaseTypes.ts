// Auto-generated Supabase types for MENDguild v2.
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
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['participants']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['outcome_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['outcome_records']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['access_requests']['Row'], 'id' | 'created_at' | 'status'>;
        Update: Partial<Database['public']['Tables']['access_requests']['Insert']>;
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
        Insert: Omit<Database['public']['Tables']['session_messages']['Row'], 'id' | 'sent_at'>;
        Update: never;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Session = Database['public']['Tables']['sessions']['Row'];
export type Participant = Database['public']['Tables']['participants']['Row'];
export type OutcomeRecord = Database['public']['Tables']['outcome_records']['Row'];
export type OutcomeApproval = Database['public']['Tables']['outcome_approvals']['Row'];
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
export type SessionMessage = Database['public']['Tables']['session_messages']['Row'];
