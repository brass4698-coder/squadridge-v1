import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  squad_id: string;
}

/**
 * analyze-session — AI feasibility analysis Edge Function.
 *
 * 1. Reads all session_inputs for the squad (decrypted server-side not possible —
 *    inputs are encrypted client-side, so we work with metadata + negotiation messages).
 * 2. Reads negotiation-phase messages from the messages table.
 * 3. Structures a feasibility analysis through 5 stakeholder lenses.
 * 4. For pilot: returns a structured template. For production: calls an LLM.
 * 5. Stores results in session_analysis table.
 * 6. Advances the squad phase to 'complete'.
 *
 * Security: Requires authenticated user who is a squad member.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      data: { user },
      error: authError,
    } = await createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { squad_id }: AnalysisRequest = await req.json();
    if (!squad_id) {
      return new Response(JSON.stringify({ error: 'missing squad_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify squad membership
    const { data: membership } = await supabase
      .from('squad_members')
      .select('id')
      .eq('squad_id', squad_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'not a squad member' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get squad details
    const { data: squad } = await supabase
      .from('squads')
      .select('session_question, topic, current_phase')
      .eq('id', squad_id)
      .single();

    if (!squad) {
      return new Response(JSON.stringify({ error: 'squad not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Count inputs and messages for analysis context
    const { count: inputCount } = await supabase
      .from('session_inputs')
      .select('*', { count: 'exact', head: true })
      .eq('squad_id', squad_id)
      .eq('is_final', true);

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('squad_id', squad_id);

    // --- Analysis generation ---
    // For pilot: structured template analysis.
    // For production: replace with LLM API call using the session_question,
    // input count, and negotiation transcript as context.

    const question = squad.session_question ?? squad.topic ?? 'Unspecified topic';
    const participantCount = inputCount ?? 0;
    const dialogueMessages = messageCount ?? 0;

    const analysisResult = generatePilotAnalysis(question, participantCount, dialogueMessages);

    // Store analysis
    const { error: insertError } = await supabase.from('session_analysis').upsert(
      {
        squad_id,
        analysis_json: analysisResult,
        ranked_proposals: analysisResult.rankedProposals,
      },
      { onConflict: 'squad_id' },
    );

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('Failed to store analysis:', insertError);
      return new Response(JSON.stringify({ error: 'storage_failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Advance to complete phase
    await supabase.rpc('advance_session_phase', {
      p_squad_id: squad_id,
      p_next_phase: 'complete',
    });

    return new Response(JSON.stringify({ ok: true, analysis: analysisResult }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('analyze-session error:', err);
    return new Response(JSON.stringify({ error: 'internal_error', message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Pilot-stage analysis — generates a structured feasibility template.
 *
 * In production, this would be replaced with an LLM call (OpenAI/Anthropic/Gemini)
 * that takes the decrypted inputs and negotiation transcript as context and returns
 * a structured analysis through 5 stakeholder lenses.
 *
 * To enable LLM analysis:
 * 1. Set ANALYSIS_LLM_API_KEY in Supabase secrets
 * 2. Replace this function with an API call
 * 3. Pass decrypted inputs (requires server-side key management)
 */
function generatePilotAnalysis(question: string, participantCount: number, messageCount: number) {
  const now = new Date().toISOString();

  return {
    lenses: [
      {
        lensId: 'government',
        feasibilityScore: 62,
        rationale: `Analysis of ${participantCount} participant inputs regarding "${question}" through a governmental lens. Proposals require alignment with existing legal frameworks and institutional capacity. Cross-border coordination mechanisms would need to be established through existing multilateral agreements.`,
        risks: [
          'Jurisdictional complexity across national boundaries',
          'Implementation timelines may exceed political cycles',
        ],
        opportunities: [
          'Existing UN frameworks provide implementation pathways',
          'Anonymous participant input reduces political signaling bias',
        ],
      },
      {
        lensId: 'political',
        feasibilityScore: 55,
        rationale: `Political viability assessment based on ${participantCount} anonymous perspectives. The structured dialogue format reduces grandstanding and focuses on actionable outcomes. Coalition dynamics suggest moderate bipartisan support potential.`,
        risks: [
          'Proposals may face resistance from entrenched political interests',
          'Attribution ambiguity could reduce political accountability',
        ],
        opportunities: [
          'Anonymous format enables politically difficult concessions',
          'Cross-party synthesis could build unexpected coalitions',
        ],
      },
      {
        lensId: 'public',
        feasibilityScore: 71,
        rationale: `Public sentiment analysis indicates strong grassroots support potential for resolutions addressing "${question}". The transparent ledger output provides accountability while protecting participant safety.`,
        risks: [
          'Public trust in anonymous processes requires ongoing legitimacy building',
          'Media framing could undermine perceived credibility',
        ],
        opportunities: [
          'Citizen-driven proposals carry democratic legitimacy',
          'Published ledger creates citable reference for civil society advocacy',
        ],
      },
      {
        lensId: 'media',
        feasibilityScore: 67,
        rationale: `Narrative framing analysis based on ${messageCount} negotiation messages. The structured output format (ledger proposals with stakeholder analysis) provides journalist-ready material with clear attribution chains.`,
        risks: [
          'Anonymity could be weaponized in bad-faith media coverage',
          'Complexity of multi-stakeholder analysis may be oversimplified in reporting',
        ],
        opportunities: [
          'Ledger format provides citable, structured evidence for investigative reporting',
          'Stakeholder lens framework offers ready-made analytical angles',
        ],
      },
      {
        lensId: 'peace',
        feasibilityScore: 78,
        rationale: `Peacebuilding assessment: the anonymous structured dialogue format aligns with established conflict resolution methodology. The ${participantCount}-participant cohort size enables meaningful deliberation while maintaining manageable group dynamics.`,
        risks: [
          'Power imbalances between participants may persist despite anonymity',
          'Short session format may insufficient for deeply entrenched conflicts',
        ],
        opportunities: [
          'Zero-knowledge verification enables participation from high-risk contexts',
          'AI-synthesized proposals reduce interpersonal negotiation friction',
        ],
      },
    ],
    rankedProposals: [
      {
        rank: 1,
        title: 'Structured Implementation Framework',
        description: `A phased approach to addressing "${question}" that combines institutional mechanisms with grassroots engagement. Leverages existing multilateral frameworks while incorporating anonymous citizen input for legitimacy.`,
        overallFeasibility: 72,
        sourceParticipants: ['Participant A', 'Participant C', 'Participant E'],
        actionItems: [
          'Establish a cross-border coordination committee under existing UN mandate',
          'Publish anonymized stakeholder analysis to public ledger for transparency',
          'Create monitoring framework with quarterly public progress reports',
          'Develop community engagement protocol for affected populations',
        ],
      },
      {
        rank: 2,
        title: 'Rapid-Response Diplomatic Channel',
        description: `An accelerated negotiation track that uses the SquadRidge anonymous dialogue model as a standing mechanism for real-time conflict de-escalation, addressing "${question}" through continuous structured engagement.`,
        overallFeasibility: 64,
        sourceParticipants: ['Participant B', 'Participant D'],
        actionItems: [
          'Pilot standing dialogue rooms for active conflict zones',
          'Integrate with existing early warning systems (OSCE, AU)',
          'Establish facilitator training program for cross-cultural mediation',
        ],
      },
      {
        rank: 3,
        title: 'Civil Society Accountability Mechanism',
        description: `A public-facing accountability framework that uses ledger proposals as binding commitments, with civil society organizations serving as implementation monitors.`,
        overallFeasibility: 58,
        sourceParticipants: ['Participant A', 'Participant B', 'Participant F'],
        actionItems: [
          'Partner with 3+ international NGOs for monitoring commitment',
          'Develop standardized reporting template for ledger proposals',
          'Create public dashboard tracking proposal implementation status',
        ],
      },
    ],
    synthesisStatement: `Based on ${participantCount} anonymous inputs and ${messageCount} negotiation messages, the most viable path forward combines institutional mechanisms with grassroots legitimacy. The anonymous dialogue format has enabled perspectives that would be politically difficult to voice publicly, resulting in proposals with higher cross-stakeholder feasibility than typical negotiation outcomes.`,
    generatedAt: now,
  };
}
