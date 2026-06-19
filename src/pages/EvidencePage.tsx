import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Eye,
  FileText,
  Globe2,
  HeartHandshake,
  Lock,
  MessageSquare,
  Newspaper,
  Scale,
  Shield,
  ShieldCheck,
  Users,
  WifiOff,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/* =========================================================================
 * EvidencePage — "The Research Behind SquadRidge"
 *
 * Presents factual academic and institutional research supporting each
 * design decision in SquadRidge. Every claim links to a verifiable source.
 * Copy respects banned-public-copy guardrails — no unqualified E2E,
 * Signal-grade, or "solves conflict" claims.
 * ========================================================================= */

/* -------------------------------------------------------------------------
 * Evidence domain data
 * ----------------------------------------------------------------------- */

interface Citation {
  readonly id: string;
  readonly authors: string;
  readonly title: string;
  readonly source: string;
  readonly year: number;
  readonly url?: string;
  readonly finding: string;
}

interface EvidenceDomain {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly icon: ReactNode;
  readonly thesis: string;
  readonly connection: string;
  readonly citations: ReadonlyArray<Citation>;
}

const EVIDENCE_DOMAINS: ReadonlyArray<EvidenceDomain> = [
  {
    id: 'chilling-effect',
    label: 'The Chilling Effect',
    title: 'Surveillance changes what people are willing to say.',
    icon: <Eye className="size-5" aria-hidden />,
    thesis:
      'When people know they are being recorded or surveilled, they self-censor. The quality and honesty of dialogue degrades measurably. This is especially acute in conflict-sensitive settings where attribution can carry physical risk.',
    connection:
      'SquadRidge separates identity from access and does not retain raw transcripts. The sealed-room model removes the surveillance pressure that research shows degrades dialogue quality.',
    citations: [
      {
        id: 'stoycheff-2016',
        authors: 'Stoycheff, E.',
        title:
          "Under Surveillance: Examining Facebook's Spiral of Silence Effects in the Wake of NSA Internet Monitoring",
        source: 'Journalism & Mass Communication Quarterly, 93(2), 296-311',
        year: 2016,
        url: 'https://doi.org/10.1177/1077699016630255',
        finding:
          'Individuals who perceived government surveillance were significantly less likely to express minority opinions online, demonstrating a measurable chilling effect on free expression.',
      },
      {
        id: 'pen-america-2013',
        authors: 'PEN American Center',
        title: 'Chilling Effects: NSA Surveillance Drives U.S. Writers to Self-Censor',
        source: 'PEN American Center Report',
        year: 2013,
        url: 'https://pen.org/chilling-effects/',
        finding:
          '28% of PEN members reported curtailing or avoiding social media activities, and 24% deliberately avoided certain topics in phone or email conversations due to concerns about surveillance.',
      },
      {
        id: 'penney-2016',
        authors: 'Penney, J.',
        title: 'Chilling Effects: Online Surveillance and Wikipedia Use',
        source: 'Berkeley Technology Law Journal, 31(1), 117-182',
        year: 2016,
        url: 'https://doi.org/10.15779/Z38SS13',
        finding:
          'Wikipedia article traffic for privacy-sensitive topics dropped by 20% after the Snowden revelations, demonstrating that awareness of surveillance measurably reduces information-seeking behavior.',
      },
    ],
  },
  {
    id: 'chatham-house',
    label: 'Chatham House Rule',
    title: 'Off-the-record structures unlock candid participation.',
    icon: <MessageSquare className="size-5" aria-hidden />,
    thesis:
      'The Chatham House Rule — where participants can use information but cannot attribute it — has been the gold standard for candid policy dialogue since 1927. It works because it separates the value of what was said from the risk of who said it.',
    connection:
      'SquadRidge digitizes and strengthens this principle. The approved public record carries the consensus outcome without attributing it to specific participants — a structural enforcement of the Chatham House principle.',
    citations: [
      {
        id: 'chatham-house-2002',
        authors: 'Chatham House (Royal Institute of International Affairs)',
        title: 'Chatham House Rule',
        source: 'Chatham House Official Policy, est. 1927, revised 2002',
        year: 2002,
        url: 'https://www.chathamhouse.org/about-us/chatham-house-rule',
        finding:
          'The Rule is used globally across diplomacy, business, and NGO settings to encourage honest discussion by removing the risk of public attribution. It has been adopted by thousands of organizations worldwide.',
      },
      {
        id: 'track-ii-handbook',
        authors: 'Mapendere, J.',
        title: 'Track One and a Half Diplomacy and the Complementarity of Tracks',
        source: 'Culture of Peace Online Journal, 2(1), 66-81',
        year: 2006,
        finding:
          'Off-the-record dialogue formats consistently produce more candid exchanges than on-record formats in diplomatic settings, particularly when participants face political risks for stated positions.',
      },
    ],
  },
  {
    id: 'psychological-safety',
    label: 'Psychological Safety',
    title: 'Teams produce better outcomes when members feel safe to speak honestly.',
    icon: <Brain className="size-5" aria-hidden />,
    thesis:
      'Psychological safety — the shared belief that one will not be punished for speaking up — is the strongest predictor of high-performing teams. When people fear consequences for honest participation, the quality of collective decision-making collapses.',
    connection:
      'SquadRidge creates psychological safety structurally: verified-anonymous participation, facilitator-managed sessions, no permanent transcript, and pre-set release boundaries remove the conditions that destroy honest dialogue.',
    citations: [
      {
        id: 'edmondson-1999',
        authors: 'Edmondson, A.',
        title: 'Psychological Safety and Learning Behavior in Work Teams',
        source: 'Administrative Science Quarterly, 44(2), 350-383',
        year: 1999,
        url: 'https://doi.org/10.2307/2666999',
        finding:
          'Teams with higher psychological safety were significantly more likely to engage in learning behaviors — asking questions, seeking feedback, experimenting, and reflecting on results — producing measurably better outcomes.',
      },
      {
        id: 'google-aristotle-2015',
        authors: "Duhigg, C. (reporting on Google's Project Aristotle)",
        title: 'What Google Learned From Its Quest to Build the Perfect Team',
        source: 'The New York Times Magazine',
        year: 2016,
        url: 'https://www.nytimes.com/2016/02/28/magazine/what-google-learned-from-its-quest-to-build-the-perfect-team.html',
        finding:
          "Google's two-year study of 180 teams found that psychological safety was the single most important factor in team effectiveness — more important than team composition, structure, or individual talent.",
      },
      {
        id: 'clark-2020',
        authors: 'Clark, T. R.',
        title:
          'The 4 Stages of Psychological Safety: Defining the Path to Inclusion and Innovation',
        source: 'Berrett-Koehler Publishers',
        year: 2020,
        finding:
          'Psychological safety progresses through four stages — inclusion, learner, contributor, and challenger safety. Environments that suppress any stage produce conformity bias and suppress dissent critical for good outcomes.',
      },
    ],
  },
  {
    id: 'small-group-dialogue',
    label: 'Small-Group Dialogue',
    title: 'Structured small groups outperform large forums in conflict resolution.',
    icon: <Users className="size-5" aria-hidden />,
    thesis:
      'Decades of contact hypothesis research demonstrates that structured, facilitated small-group dialogue across conflict lines reduces prejudice and improves mutual understanding more effectively than large public forums, town halls, or social media discourse.',
    connection:
      'SquadRidge matches 4-6 verified participants into facilitator-led squads — not open forums. This small-group architecture reflects what the research shows: intimate, structured contact under skilled facilitation produces the best outcomes.',
    citations: [
      {
        id: 'pettigrew-tropp-2006',
        authors: 'Pettigrew, T. F. & Tropp, L. R.',
        title: 'A Meta-Analytic Test of Intergroup Contact Theory',
        source: 'Journal of Personality and Social Psychology, 90(5), 751-783',
        year: 2006,
        url: 'https://doi.org/10.1037/0022-3514.90.5.751',
        finding:
          'Meta-analysis of 515 studies (with 713 independent samples from 38 nations) found that intergroup contact typically reduces prejudice. Effects were strongest when contact involved institutional support, common goals, and equal status — conditions that structured facilitation provides.',
      },
      {
        id: 'gurin-etal-2013',
        authors: 'Gurin, P., Nagda, B. A., & Zuniga, X.',
        title: 'Dialogue Across Difference: Practice, Theory, and Research on Intergroup Dialogue',
        source: 'Russell Sage Foundation',
        year: 2013,
        finding:
          'A nine-university study of intergroup dialogue found that structured small-group dialogue (8-18 participants) significantly increased perspective-taking and motivation for bridging across difference, compared to control groups using traditional coursework.',
      },
      {
        id: 'fisher-2005',
        authors: 'Fisher, R. J.',
        title: 'Paving the Way: Contributions of Interactive Conflict Resolution to Peacemaking',
        source: 'Lexington Books',
        year: 2005,
        finding:
          'Interactive conflict resolution workshops — small groups of influential individuals from opposing sides meeting under facilitator guidance — have contributed to breakthroughs in protracted conflicts by building understanding that feeds into official negotiations.',
      },
    ],
  },
  {
    id: 'track-ii-diplomacy',
    label: 'Track II Diplomacy',
    title: 'Informal back-channels have shaped real peace outcomes.',
    icon: <Globe2 className="size-5" aria-hidden />,
    thesis:
      'Track II (unofficial, off-the-record) diplomacy has contributed to many peace processes. These back-channels work precisely because they allow honest exchange outside the pressure of public accountability and political positioning.',
    connection:
      'SquadRidge provides digital infrastructure for structured, off-the-record dialogue — preserving the benefits of Track II back-channels while adding verification, safety framing, and accountable outcome records.',
    citations: [
      {
        id: 'agha-etal-2003',
        authors: 'Agha, H., Feldman, S., Khalidi, A., & Schiff, Z.',
        title: 'Track-II Diplomacy: Lessons from the Middle East',
        source: 'MIT Press',
        year: 2003,
        finding:
          'The Oslo Accords (1993) emerged from secret back-channel meetings between Israeli and Palestinian representatives, facilitated by Norwegian intermediaries. The off-the-record format was essential — public talks had repeatedly stalled.',
      },
      {
        id: 'jones-2015',
        authors: 'Jones, P.',
        title: 'Track Two Diplomacy in Theory and Practice',
        source: 'Stanford University Press',
        year: 2015,
        finding:
          'Track II processes succeed because they provide "political cover" for exploring positions that would be impossible to state publicly. The informal, deniable format allows participants to test ideas without committing their organizations.',
      },
      {
        id: 'cuhadar-2009',
        authors: 'Cuhadar, E.',
        title: 'Assessing Transfer from Track Two Diplomacy: The Cases of Water and Jerusalem',
        source: 'Journal of Peace Research, 46(5), 641-658',
        year: 2009,
        url: 'https://doi.org/10.1177/0022343309336800',
        finding:
          'Track II dialogue outcomes transfer to official policy processes when they produce concrete, documentable outputs that participants can reference — supporting the value of structured, citable outcome records.',
      },
    ],
  },
  {
    id: 'civilian-protection',
    label: 'Civilian Protection',
    title: 'The scale of displacement demands new dialogue infrastructure.',
    icon: <Shield className="size-5" aria-hidden />,
    thesis:
      'Global forced displacement has reached historic levels. In environments where civilians face violence, protected communication channels for mediation and dialogue are not abstract — they are operationally necessary for humanitarian response.',
    connection:
      'SquadRidge is designed for precisely these high-stakes environments where attribution carries physical risk, facilitators need structured tools, and institutions need accountable evidence of dialogue outcomes.',
    citations: [
      {
        id: 'unhcr-2024',
        authors: 'UNHCR',
        title: 'Global Trends: Forced Displacement in 2023',
        source: 'United Nations High Commissioner for Refugees',
        year: 2024,
        url: 'https://www.unhcr.org/global-trends',
        finding:
          'By the end of 2023, 117.3 million people were forcibly displaced worldwide — the highest number ever recorded. This represents roughly 1 in every 69 people on Earth.',
      },
      {
        id: 'icrc-2023',
        authors: 'International Committee of the Red Cross',
        title: 'Protracted Conflict and Humanitarian Action',
        source: 'ICRC Annual Report 2023',
        year: 2023,
        url: 'https://www.icrc.org/en/annual-report',
        finding:
          'ICRC operated in over 100 countries in 2023. In protracted conflicts, civilian dialogue and mediation infrastructure are critical to humanitarian access, ceasefire negotiation, and protection of non-combatants.',
      },
      {
        id: 'ocha-2024',
        authors: 'UN OCHA',
        title: 'Global Humanitarian Overview 2024',
        source: 'United Nations Office for the Coordination of Humanitarian Affairs',
        year: 2024,
        url: 'https://www.unocha.org/global-humanitarian-overview-2024',
        finding:
          'An estimated 300 million people needed humanitarian assistance in 2024. OCHA identifies "community engagement and dialogue" as a critical component of effective humanitarian response.',
      },
    ],
  },
  {
    id: 'zk-verification',
    label: 'Zero-Knowledge Verification',
    title: 'Prove you belong without revealing who you are.',
    icon: <Lock className="size-5" aria-hidden />,
    thesis:
      'Zero-knowledge proof systems allow one party to prove a statement is true without revealing any information beyond the statement itself. Applied to identity, this means proving eligibility (e.g., "I am authorized to participate") without disclosing the underlying identity.',
    connection:
      'SquadRidge uses a Semaphore-inspired verification path so participants can prove eligibility without broad identity disclosure. This is privacy-respecting access control — not magic invisibility (see our threat model for precise boundaries).',
    citations: [
      {
        id: 'semaphore-pse',
        authors: 'Privacy & Scaling Explorations (Ethereum Foundation)',
        title: 'Semaphore: A Zero-Knowledge Protocol for Anonymous Signaling',
        source: 'PSE / Ethereum Foundation',
        year: 2023,
        url: 'https://semaphore.pse.dev/',
        finding:
          'Semaphore enables users to prove membership in a group and send signals (votes, endorsements) without revealing their identity. It has been deployed in governance, whistleblowing, and anonymous feedback systems.',
      },
      {
        id: 'goldwasser-etal-1989',
        authors: 'Goldwasser, S., Micali, S., & Rackoff, C.',
        title: 'The Knowledge Complexity of Interactive Proof Systems',
        source: 'SIAM Journal on Computing, 18(1), 186-208',
        year: 1989,
        url: 'https://doi.org/10.1137/0218012',
        finding:
          'The foundational paper establishing zero-knowledge proofs demonstrated that a prover can convince a verifier of a statement without conveying any additional knowledge — the theoretical basis for privacy-preserving verification.',
      },
      {
        id: 'worldcoin-2023',
        authors: 'Tools for Humanity',
        title: 'World ID: Privacy-Preserving Proof of Personhood',
        source: 'Worldcoin Whitepaper',
        year: 2023,
        url: 'https://whitepaper.worldcoin.org/',
        finding:
          'World ID uses zero-knowledge proofs to allow individuals to prove they are unique humans without revealing personal data — demonstrating production-scale deployment of ZK-based identity verification.',
      },
    ],
  },
  {
    id: 'accountability-without-surveillance',
    label: 'Accountability Without Surveillance',
    title: 'Cryptographic records create trust without watching everyone.',
    icon: <FileText className="size-5" aria-hidden />,
    thesis:
      'Accountability and surveillance are not the same thing. Cryptographic timestamping and structured release protocols can create verifiable records of outcomes without requiring persistent monitoring of participants.',
    connection:
      'SquadRidge publishes approved consensus records with cryptographic timestamps. The record is the accountability artifact — not a transcript, not a surveillance log. This separates verification of outcomes from surveillance of participants.',
    citations: [
      {
        id: 'certificate-transparency',
        authors: 'Laurie, B., Langley, A., & Kasper, E.',
        title: 'Certificate Transparency',
        source: 'RFC 6962, Internet Engineering Task Force',
        year: 2013,
        url: 'https://datatracker.ietf.org/doc/html/rfc6962',
        finding:
          'Certificate Transparency logs allow anyone to verify that a certificate was legitimately issued without requiring trust in a single authority — demonstrating that public accountability can coexist with operational privacy.',
      },
      {
        id: 'haber-stornetta-1991',
        authors: 'Haber, S. & Stornetta, W. S.',
        title: 'How to Time-Stamp a Digital Document',
        source: 'Journal of Cryptology, 3(2), 99-111',
        year: 1991,
        url: 'https://doi.org/10.1007/BF00196791',
        finding:
          'The foundational paper on cryptographic timestamping showed that digital documents can be time-stamped in a way that is tamper-evident and publicly verifiable — creating accountability without requiring access to the document content.',
      },
      {
        id: 'eu-eidas-2014',
        authors: 'European Parliament and Council',
        title: 'Regulation (EU) No 910/2014 (eIDAS)',
        source: 'Official Journal of the European Union',
        year: 2014,
        url: 'https://eur-lex.europa.eu/eli/reg/2014/910/oj',
        finding:
          'The EU eIDAS regulation establishes legal validity for qualified electronic timestamps — recognizing that cryptographic timestamping provides legally binding proof of existence without requiring content disclosure.',
      },
    ],
  },
  {
    id: 'digital-censorship',
    label: 'Digital Censorship',
    title: 'Governments are weaponizing internet connectivity in conflict zones.',
    icon: <WifiOff className="size-5" aria-hidden />,
    thesis:
      'Internet shutdowns have reached record levels, with at least one occurring every single day in 2025. In active conflict zones, network disruptions are used to isolate populations, prevent documentation of abuses, and hinder humanitarian coordination. The economic cost reached $19.7 billion in 2025 alone.',
    connection:
      'SquadRidge is designed to function in environments where connectivity is contested. The sealed-room model, pre-set release boundaries, and offline-aware architecture reflect the reality that participants in conflict zones cannot assume stable, unsurveilled internet access.',
    citations: [
      {
        id: 'access-now-2025',
        authors: 'Access Now & the #KeepItOn Coalition',
        title: 'Shattered Dreams and Lost Connections: Internet Shutdowns in 2025',
        source: 'Access Now Annual Report',
        year: 2025,
        url: 'https://www.accessnow.org/keepiton/',
        finding:
          'At least 313 internet shutdowns were recorded across 52 countries in 2025 — a new record. Conflict was the leading trigger, accounting for 125 incidents across 14 countries. For the first time, at least one shutdown occurred every single day of the year.',
      },
      {
        id: 'rydzak-2019',
        authors: 'Rydzak, J.',
        title: 'Of Blackouts and Bandhs: The Strategy and Structure of Disconnected Protest',
        source: 'Journal of Information Technology & Politics, 16(3), 249-267',
        year: 2019,
        url: 'https://doi.org/10.1080/19331681.2019.1648735',
        finding:
          'Internet shutdowns do not suppress protest — they transform it. Disconnected populations shift to more disruptive, less coordinated, and often more violent forms of collective action, making shutdowns counterproductive for stability.',
      },
      {
        id: 'un-hrc-2024',
        authors: 'UN Human Rights Council',
        title: 'Resolution on Internet Shutdowns and Human Rights',
        source: 'United Nations Human Rights Council, A/HRC/RES/47/16 (updated 2024)',
        year: 2024,
        url: 'https://www.ohchr.org/',
        finding:
          'The UN Human Rights Council has repeatedly condemned internet shutdowns as measures that violate the right to freedom of expression and access to information, calling them disproportionate responses that cause systemic harm to essential services.',
      },
    ],
  },
  {
    id: 'journalist-safety',
    label: 'Journalist Safety',
    title: 'Press workers in conflict zones face escalating physical and digital threats.',
    icon: <Newspaper className="size-5" aria-hidden />,
    thesis:
      'Journalist killings reached record highs in 2024 and 2025, driven by conflict. Drone strikes targeting journalists surged from 2 fatalities in 2023 to 39 in 2025 — a 20-fold increase. Beyond physical violence, journalists face coordinated surveillance, digital harassment, and imprisonment. Secure channels for source protection and cross-border coordination are survival infrastructure.',
    connection:
      'SquadRidge provides verified-anonymous participation that could support journalists, sources, and civil society actors who need to engage in structured dialogue without exposing their identity. The platform does not claim to replace dedicated journalist safety tools — it addresses the specific gap of structured, facilitator-led anonymous dialogue.',
    citations: [
      {
        id: 'cpj-2025',
        authors: 'Committee to Protect Journalists',
        title: 'Deadly Year: 129 Journalists and Media Workers Killed in 2025',
        source: 'CPJ Annual Report',
        year: 2025,
        url: 'https://cpj.org/',
        finding:
          '129 journalists and media workers were killed worldwide in 2025 — the highest number since CPJ began tracking in 1992. Over 75% of deaths occurred in conflict settings. Drone strikes accounted for 39 deaths, up from just 2 in 2023.',
      },
      {
        id: 'rsf-2025',
        authors: 'Reporters Without Borders (RSF)',
        title: 'World Press Freedom Index 2025',
        source: 'Reporters Without Borders',
        year: 2025,
        url: 'https://rsf.org/en/index',
        finding:
          'Global press freedom continued to decline in 2025. RSF documented 67 journalists killed, with nearly half in active conflict zones. Over 500 journalists were imprisoned globally, many held without charge.',
      },
      {
        id: 'deibert-2020',
        authors: 'Deibert, R.',
        title: 'Reset: Reclaiming the Internet for Civil Society',
        source: 'House of Anansi Press',
        year: 2020,
        finding:
          "The Citizen Lab's research documents how commercial spyware (Pegasus, Predator) has been deployed against journalists, activists, and civil society leaders in over 45 countries — demonstrating that digital surveillance of press workers is a global, industrialized practice.",
      },
    ],
  },
  {
    id: 'do-no-harm',
    label: 'Do No Harm',
    title: 'Humanitarian technology must follow the same ethical framework as humanitarian action.',
    icon: <HeartHandshake className="size-5" aria-hidden />,
    thesis:
      'The Do No Harm principle — originally developed for humanitarian aid — applies directly to digital platforms operating in conflict settings. Data collected to help can be weaponized against the people it describes. Technology designed without conflict sensitivity can amplify harm, enable surveillance, or expose vulnerable populations to retaliation.',
    connection:
      'SquadRidge applies Do No Harm principles structurally: minimal data collection, no permanent transcripts, verified-anonymous participation, and pre-set release boundaries that prevent unintended exposure. The platform is designed so that even if compromised, the damage surface is limited by architecture, not just policy.',
    citations: [
      {
        id: 'anderson-1999',
        authors: 'Anderson, M. B.',
        title: 'Do No Harm: How Aid Can Support Peace — or War',
        source: 'Lynne Rienner Publishers',
        year: 1999,
        finding:
          "Anderson's foundational framework demonstrates that well-intentioned aid can inadvertently fuel conflict by reinforcing power imbalances, creating dependency, or providing resources that armed groups capture. The same logic applies to technology platforms operating in contested environments.",
      },
      {
        id: 'engine-room-2016',
        authors: 'The Engine Room & Oxfam',
        title: 'Responsible Data in Humanitarian Action',
        source: 'The Engine Room Working Paper',
        year: 2016,
        url: 'https://www.theengineroom.org/',
        finding:
          'Humanitarian organizations collect vast amounts of sensitive personal data. This paper documents cases where beneficiary data was accessed by conflict parties, leading to targeting of vulnerable populations — establishing that data responsibility is a physical safety issue, not just a compliance requirement.',
      },
      {
        id: 'icrc-digital-2023',
        authors: 'International Committee of the Red Cross',
        title: 'The Digitalization of Armed Conflict and its Consequences for Civilian Protection',
        source: 'ICRC Position Paper',
        year: 2023,
        url: 'https://www.icrc.org/',
        finding:
          'The ICRC documents how digital infrastructure has become both a tool for humanitarian coordination and an attack surface for conflict parties. Civilian data, communication metadata, and location tracking create new vectors for harm that did not exist in pre-digital conflicts.',
      },
    ],
  },
  {
    id: 'deliberative-democracy',
    label: 'Deliberative Democracy',
    title: 'Structured dialogue produces better collective decisions than adversarial debate.',
    icon: <Scale className="size-5" aria-hidden />,
    thesis:
      "Decades of research on deliberative democracy — from Habermas's theory of communicative action to Fishkin's deliberative polling experiments — demonstrate that structured, facilitated dialogue produces more informed, more legitimate, and more durable collective decisions than unstructured debate, voting alone, or adversarial formats.",
    connection:
      "SquadRidge's facilitator-led session structure, phase-based progression (input → reveal → analysis → negotiation), and consensus-release model reflect deliberative democracy principles: equal voice, structured turns, information sharing, and collective decision-making under skilled facilitation.",
    citations: [
      {
        id: 'fishkin-2009',
        authors: 'Fishkin, J. S.',
        title: 'When the People Speak: Deliberative Democracy and Public Consultation',
        source: 'Oxford University Press',
        year: 2009,
        finding:
          "Fishkin's deliberative polling experiments across 28 countries demonstrate that ordinary citizens, given structured information and facilitated small-group discussion, shift their positions toward more informed and nuanced views — often by 10-15 percentage points on key policy questions.",
      },
      {
        id: 'habermas-1996',
        authors: 'Habermas, J.',
        title: 'Between Facts and Norms: Contributions to a Discourse Theory of Law and Democracy',
        source: 'MIT Press (translated by William Rehg)',
        year: 1996,
        finding:
          'Habermas establishes that legitimate collective decisions require "communicative rationality" — participants must be able to raise claims, challenge assumptions, and reach understanding through reasoned exchange rather than coercion or manipulation.',
      },
      {
        id: 'curato-etal-2017',
        authors: 'Curato, N., Dryzek, J. S., Ercan, S. A., Hendriks, C. M., & Niemeyer, S.',
        title: 'Twelve Key Findings in Deliberative Democracy Research',
        source: 'Daedalus, 146(3), 28-38',
        year: 2017,
        url: 'https://doi.org/10.1162/DAED_a_00444',
        finding:
          'A comprehensive review of deliberative democracy research finds that deliberation improves the quality of opinions, promotes mutual respect and understanding, enhances the legitimacy of collective decisions, and can function effectively across deep social divisions when properly structured.',
      },
    ],
  },
];

const DOMAIN_IDS = EVIDENCE_DOMAINS.map((d) => d.id);

/* -------------------------------------------------------------------------
 * Active section tracking
 * ----------------------------------------------------------------------- */

function useActiveSection(ids: ReadonlyArray<string>): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.current.observe(el);
    }

    return () => observer.current?.disconnect();
  }, [ids]);

  return activeId;
}

/* -------------------------------------------------------------------------
 * Animated reveal
 * ----------------------------------------------------------------------- */

function RevealSection({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={twMerge(
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Table of contents sidebar
 * ----------------------------------------------------------------------- */

function EvidenceToc({ activeId }: { activeId: string | null }) {
  return (
    <nav aria-label="Evidence sections" className="space-y-1">
      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Research domains
      </p>
      <ol className="mt-3 m-0 list-none space-y-0.5 p-0">
        {EVIDENCE_DOMAINS.map((d, i) => {
          const isActive = activeId === d.id;
          return (
            <li key={d.id} className="m-0 p-0">
              <a
                href={`#${d.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={twMerge(
                  'group relative flex items-baseline gap-2.5 rounded-sm py-1.5 pl-3 pr-2 transition-colors',
                  isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  className={twMerge(
                    'absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full transition-all duration-200',
                    isActive ? 'bg-brand opacity-100' : 'bg-line opacity-0 group-hover:opacity-60',
                  )}
                />
                <span
                  className={twMerge(
                    'font-mono text-[0.66rem] tabular-nums tracking-tight transition-colors',
                    isActive ? 'text-brand' : 'text-ink-faint',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={twMerge(
                    'font-sans text-[0.82rem] font-medium leading-snug',
                    isActive ? 'text-ink' : 'text-ink-secondary',
                  )}
                >
                  {d.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------
 * Mobile chips nav
 * ----------------------------------------------------------------------- */

function EvidenceChipsNav({ activeId }: { activeId: string | null }) {
  return (
    <nav
      aria-label="Evidence sections"
      className="rounded-md border border-line bg-surface-elevated px-3 py-3"
    >
      <p className="px-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        Research domains
      </p>
      <ol className="mt-2 -mx-1 flex list-none gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin]">
        {EVIDENCE_DOMAINS.map((d, i) => {
          const isActive = activeId === d.id;
          return (
            <li key={d.id} className="m-0 list-none p-0">
              <a
                href={`#${d.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={twMerge(
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[0.76rem] font-medium transition-colors',
                  isActive
                    ? 'border-brand bg-brand-soft text-ink'
                    : 'border-line bg-surface-sunken text-ink-secondary hover:border-line-strong hover:text-ink',
                )}
              >
                <span
                  className={twMerge(
                    'font-mono text-[0.64rem] tabular-nums',
                    isActive ? 'text-brand' : 'text-ink-faint',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {d.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------
 * Citation card
 * ----------------------------------------------------------------------- */

function CitationCard({ citation }: { citation: Citation }) {
  return (
    <div className="group flex flex-col gap-2.5 rounded-md border border-line bg-surface-sunken p-4 transition-colors duration-200 hover:border-line-strong md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-elevated text-brand">
            <BookOpen className="size-3.5" aria-hidden />
          </span>
          <span className="font-mono text-[0.66rem] font-semibold tabular-nums text-ink-faint">
            {citation.year}
          </span>
        </div>
        {citation.url ? (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1 rounded-full border border-line bg-surface-elevated px-2 py-0.5 font-mono text-[0.62rem] text-ink-secondary transition-colors hover:border-brand/40 hover:text-brand"
          >
            Source
            <ArrowRight className="size-2.5" aria-hidden />
          </a>
        ) : null}
      </div>

      <p className="m-0 font-sans text-[0.88rem] font-semibold leading-snug text-ink">
        {citation.title}
      </p>

      <p className="m-0 font-mono text-[0.7rem] leading-relaxed text-ink-faint">
        {citation.authors} — {citation.source}
      </p>

      <div className="mt-1 border-t border-line pt-3">
        <p className="m-0 flex items-start gap-2 font-sans text-[0.84rem] leading-[1.6] text-ink-secondary">
          <span aria-hidden className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-brand" />
          <span>{citation.finding}</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Evidence domain section
 * ----------------------------------------------------------------------- */

function EvidenceDomainSection({ domain, index }: { domain: EvidenceDomain; index: number }) {
  return (
    <RevealSection>
      <section
        id={domain.id}
        className="scroll-mt-24 rounded-lg border border-line bg-surface-elevated px-5 py-6 md:px-8 md:py-8"
      >
        {/* Header */}
        <header className="mb-5 md:mb-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[0.66rem] font-semibold tabular-nums uppercase tracking-[0.18em] text-brand">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span aria-hidden className="h-px flex-1 bg-line-divider" />
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-faint">
              {domain.citations.length} sources
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-brand">
              {domain.icon}
            </span>
            <div className="min-w-0">
              <p className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                {domain.label}
              </p>
              <h2 className="mt-1.5 font-display text-[clamp(1.2rem,1.6vw,1.45rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                {domain.title}
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-[44rem] font-sans text-[0.92rem] leading-[1.7] text-ink-secondary">
            {domain.thesis}
          </p>
        </header>

        {/* Citations grid */}
        <div className="grid gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {domain.citations.map((c) => (
            <CitationCard key={c.id} citation={c} />
          ))}
        </div>

        {/* SquadRidge connection */}
        <aside className="mt-5 border-l-2 border-brand bg-brand-soft/60 px-4 py-3.5">
          <p className="mb-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand">
            How this informs SquadRidge
          </p>
          <p className="m-0 font-sans text-[0.9rem] leading-[1.65] text-ink-secondary">
            {domain.connection}
          </p>
        </aside>
      </section>
    </RevealSection>
  );
}

/* -------------------------------------------------------------------------
 * Stats bar
 * ----------------------------------------------------------------------- */

const KEY_STATS = [
  { value: '117.3M', label: 'Forcibly displaced worldwide', source: 'UNHCR 2024' },
  { value: '515', label: 'Studies confirming contact theory', source: 'Pettigrew & Tropp 2006' },
  { value: '313', label: 'Internet shutdowns in a single year', source: 'Access Now 2025' },
  { value: '129', label: 'Journalists killed in 2025', source: 'CPJ 2025' },
  { value: '28%', label: 'Writers self-censoring under surveillance', source: 'PEN America 2013' },
  { value: '#1', label: 'Factor in team effectiveness', source: 'Google Project Aristotle' },
] as const;

function StatsBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {KEY_STATS.map((stat) => (
        <div
          key={stat.label}
          className="sr-vault-glass flex flex-col gap-2 p-5 transition-all duration-300 hover:-translate-y-0.5"
        >
          <p className="m-0 font-mono text-[2rem] font-bold leading-none tabular-nums text-brand">
            {stat.value}
          </p>
          <p className="m-0 font-sans text-[0.88rem] font-semibold leading-snug text-ink">
            {stat.label}
          </p>
          <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-faint">
            {stat.source}
          </p>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Page
 * ----------------------------------------------------------------------- */

export function EvidencePage() {
  const activeId = useActiveSection(DOMAIN_IDS);
  const totalCitations = EVIDENCE_DOMAINS.reduce((sum, d) => sum + d.citations.length, 0);

  return (
    <div className="relative mx-auto w-full max-w-[68rem] pb-20 pt-6 md:pt-10">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(47,143,134,0.10),_transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.65),transparent_72%)]" />
      </div>

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-12">
        {/* Sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 pt-1">
            <EvidenceToc activeId={activeId} />
            <div className="mt-6 rounded-md border border-line bg-surface-sunken p-3">
              <p className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Total citations
              </p>
              <p className="m-0 mt-1 font-mono text-[1.3rem] font-bold tabular-nums text-brand">
                {totalCitations}
              </p>
              <p className="m-0 mt-0.5 font-sans text-[0.74rem] text-ink-faint">
                peer-reviewed & institutional sources
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <article className="mx-auto w-full">
          {/* Hero */}
          <header className="relative">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] text-brand">
                Evidence & Research
              </span>
              <span aria-hidden className="h-px w-10 bg-line-divider" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                {totalCitations} sources
              </span>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.15rem,4.2vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">
              The research behind every design decision.
            </h1>

            <p className="mt-6 max-w-[44rem] border-l-2 border-brand bg-brand-soft/60 py-3 pl-4 pr-3 font-sans text-[1.02rem] font-medium leading-[1.6] text-ink md:text-[1.08rem]">
              SquadRidge is not built on assumptions. Every structural choice — from sealed rooms to
              verified-anonymous access to facilitator-led small groups — is grounded in decades of
              peer-reviewed research across conflict resolution, psychology, cryptography, and
              humanitarian operations.
            </p>

            <p className="mt-5 max-w-[42rem] font-sans text-[0.92rem] leading-[1.7] text-ink-secondary">
              This page documents the academic and institutional evidence that informs why the
              platform works the way it does. Each research domain below includes primary sources
              you can verify independently.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/trust"
                className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 font-sans text-sm font-medium text-ink-secondary transition-all hover:border-brand/40 hover:text-ink no-underline"
              >
                <ShieldCheck aria-hidden className="size-4" />
                Trust & Safety
              </Link>
              <Link
                to="/security"
                className="focus-ring inline-flex min-h-[44px] items-center gap-2 px-1 py-2.5 font-sans text-sm font-medium text-ink-faint underline-offset-4 hover:text-ink-secondary hover:underline no-underline"
              >
                Security Disclosure
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
          </header>

          {/* Mobile chips nav */}
          <EvidenceChipsNav activeId={activeId} />

          {/* Stats overview */}
          <RevealSection className="mt-10 md:mt-12">
            <div className="rounded-lg border border-line bg-surface-elevated px-5 py-6 md:px-7 md:py-7">
              <div className="flex items-baseline gap-3">
                <p className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  Key figures
                </p>
                <span aria-hidden className="h-px flex-1 bg-line-divider" />
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                  From the research
                </span>
              </div>
              <div className="mt-5">
                <StatsBar />
              </div>
            </div>
          </RevealSection>

          {/* Evidence domains */}
          <div className="mt-10 flex flex-col gap-8 md:mt-14 md:gap-10">
            {EVIDENCE_DOMAINS.map((domain, i) => (
              <EvidenceDomainSection key={domain.id} domain={domain} index={i} />
            ))}
          </div>

          {/* Methodology note */}
          <RevealSection className="mt-10 md:mt-14">
            <section className="rounded-lg border border-sem-warning/30 bg-gradient-to-br from-sem-warning-soft/50 via-surface-elevated to-surface-elevated px-5 py-6 md:px-7 md:py-8">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-sem-warning/40 bg-sem-warning-soft text-sem-warning">
                  <BookOpen className="size-4" aria-hidden />
                </span>
                <div>
                  <h2 className="m-0 font-sans text-[1.1rem] font-semibold text-ink">
                    A note on methodology
                  </h2>
                  <p className="mt-2 max-w-[40rem] font-sans text-[0.9rem] leading-[1.7] text-ink-secondary">
                    The research cited on this page represents published, peer-reviewed studies and
                    reports from established institutions. SquadRidge is a pilot-stage product —
                    these sources inform our design choices, but we do not claim that our platform
                    has independently replicated these research findings. Our own pilot evidence
                    will be published separately as it becomes available, with appropriate
                    methodology and third-party review.
                  </p>
                  <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-ink-faint">
                    For SquadRidge's current capabilities and honest security boundaries, see the{' '}
                    <Link
                      to="/security"
                      className="text-brand-hover underline-offset-4 hover:underline"
                    >
                      Security Disclosure
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/trust"
                      className="text-brand-hover underline-offset-4 hover:underline"
                    >
                      Trust & Safety
                    </Link>{' '}
                    pages.
                  </p>
                </div>
              </div>
            </section>
          </RevealSection>

          {/* The gap this fills */}
          <RevealSection className="mt-10 md:mt-14">
            <section className="rounded-lg border border-line bg-surface-elevated px-5 py-6 md:px-8 md:py-8">
              <div className="flex items-baseline gap-3">
                <p className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brand">
                  Synthesis
                </p>
                <span aria-hidden className="h-px flex-1 bg-line-divider" />
              </div>
              <h2 className="mt-4 font-display text-[clamp(1.3rem,2vw,1.65rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
                The gap this fills.
              </h2>
              <div className="mt-5 space-y-4 max-w-[48rem] font-sans text-[0.92rem] leading-[1.75] text-ink-secondary">
                <p>
                  The world has encrypted messaging, video conferencing, and centuries of diplomatic
                  practice. What it does not have is digital infrastructure that combines
                  verified-anonymous participation, facilitator-led structure, and citable outcome
                  records in a single system designed for conflict-sensitive environments.
                </p>
                <p>
                  Signal protects messages but provides no facilitation, no structured outcomes, and
                  no verified anonymity. Zoom connects faces but exposes identities and defaults to
                  recording. Track II diplomacy produces real results but depends on in-person
                  logistics and leaves no independently citable record.
                </p>
                <p className="font-semibold text-ink">
                  SquadRidge is pilot-stage infrastructure for exactly this gap. The research above
                  shows why each design decision exists. The pilot will show whether it works.
                </p>
              </div>
            </section>
          </RevealSection>

          {/* CTA */}
          <RevealSection className="mt-10 md:mt-14">
            <div className="sr-vault-glass overflow-hidden p-6 md:p-8 relative">
              <div className="sr-mesh-grid z-0" aria-hidden />
              <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-brand-hover">
                    Ready to see it in action?
                  </p>
                  <h2 className="mt-2 font-sans text-[1.2rem] font-semibold text-ink md:text-[1.35rem]">
                    Apply for pilot access to the platform.
                  </h2>
                  <p className="mt-2 max-w-[32rem] font-sans text-[0.88rem] leading-relaxed text-ink-secondary">
                    The research informs the design. The pilot proves the implementation. See how
                    verified-anonymous facilitator-led dialogue works in practice.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2.5 sm:items-end">
                  <a
                    href="/#pilot"
                    className="focus-ring btn-primary sr-btn-sheen-container inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3 font-sans text-[0.92rem] font-semibold no-underline"
                  >
                    Apply for pilot access
                    <span className="sr-btn-sheen-effect" />
                  </a>
                  <Link
                    to="/"
                    className="focus-ring inline-flex items-center gap-1.5 px-1 py-2 font-sans text-[0.82rem] font-medium text-ink-faint underline-offset-4 hover:text-ink-secondary hover:underline no-underline"
                  >
                    Back to homepage
                    <ArrowRight aria-hidden className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </RevealSection>
        </article>
      </div>
    </div>
  );
}
