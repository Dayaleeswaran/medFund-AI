import type { AiRiskScore, Campaign, Transaction, Wallet } from "@/types";

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-emma-01",
    user_id: "demo-patient",
    patient_name: "Emma Collins",
    hospital_name: "Metro General ICU",
    title: "Emergency cardiac surgery fund",
    description:
      "Emma needs immediate coronary bypass after a critical episode. Funds cover surgery, ICU recovery, and medication.",
    medical_proof_url: "/placeholder-proof",
    target_amount: 85000,
    raised_amount: 41200,
    urgency: "critical",
    status: "active",
    verification_status: "verified",
    fraud_score: 12,
    trust_score: 94,
    donor_count: 842,
    created_at: new Date().toISOString(),
  },
  {
    id: "cmp-ryan-02",
    user_id: "demo-patient-2",
    patient_name: "Ryan Okonkwo",
    hospital_name: "Pacific Children’s",
    title: "Pediatric leukemia treatment sprint",
    description:
      "Ryan’s care team approved an accelerated immunotherapy plan. Your donation bridges what insurance won’t cover for 90 days.",
    medical_proof_url: "/placeholder-proof",
    target_amount: 120000,
    raised_amount: 67800,
    urgency: "high",
    status: "active",
    verification_status: "verified",
    fraud_score: 8,
    trust_score: 97,
    donor_count: 1204,
    created_at: new Date().toISOString(),
  },
  {
    id: "cmp-sophie-03",
    user_id: "demo-patient-3",
    patient_name: "Sophie Kim",
    hospital_name: "Northside Trauma Center",
    title: "Neurosurgery & rehab after accident",
    description:
      "Sophie is stable but needs two-stage neurosurgery and 6 months of inpatient rehab. Every hour counts for optimal outcomes.",
    medical_proof_url: "/placeholder-proof",
    target_amount: 200000,
    raised_amount: 55100,
    urgency: "critical",
    status: "pending_verification",
    verification_status: "pending",
    fraud_score: 34,
    trust_score: 71,
    donor_count: 210,
    created_at: new Date().toISOString(),
  },
  {
    id: "cmp-luis-04",
    user_id: "demo-patient-4",
    patient_name: "Luis Fernández",
    hospital_name: "Riverside Oncology",
    title: "Immunotherapy bridge fund",
    description:
      "Bridge funding between employer coverage loss and new ACA window. Hospital finance desk verified ledger shortfall.",
    medical_proof_url: "/placeholder-proof",
    target_amount: 45000,
    raised_amount: 38900,
    urgency: "medium",
    status: "active",
    verification_status: "verified",
    fraud_score: 15,
    trust_score: 88,
    donor_count: 630,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_WALLET: Wallet = {
  id: "wlt-demo",
  user_id: "demo-user",
  balance: 12480,
  currency: "USD",
  updated_at: new Date().toISOString(),
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    wallet_id: "wlt-demo",
    type: "inflow",
    amount: 500,
    description: "Donation — Emma Collins campaign",
    campaign_id: "cmp-emma-01",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "tx-2",
    wallet_id: "wlt-demo",
    type: "inflow",
    amount: 2500,
    description: "Employer matching — Ryan Okonkwo",
    campaign_id: "cmp-ryan-02",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "tx-3",
    wallet_id: "wlt-demo",
    type: "outflow",
    amount: 12000,
    description: "Hospital disbursement — Metro General",
    campaign_id: "cmp-emma-01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "tx-4",
    wallet_id: "wlt-demo",
    type: "inflow",
    amount: 100,
    description: "Micro-donation batch settlement",
    campaign_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export const MOCK_RISK_BY_CAMPAIGN: Record<string, AiRiskScore> = {
  "cmp-emma-01": {
    id: "risk-1",
    campaign_id: "cmp-emma-01",
    risk_score: 12,
    signals: [
      "Hospital domain verified",
      "Medical record hash matched",
      "Donor velocity within normal range",
    ],
    created_at: new Date().toISOString(),
  },
  "cmp-sophie-03": {
    id: "risk-3",
    campaign_id: "cmp-sophie-03",
    risk_score: 34,
    signals: [
      "Awaiting secondary hospital attestation",
      "Unusual spike in small-first donations",
      "Proof document pending redaction review",
    ],
    created_at: new Date().toISOString(),
  },
};

export const TRUSTED_HOSPITALS = [
  { name: "Metro General", region: "NA", verified: true },
  { name: "Pacific Children’s", region: "NA", verified: true },
  { name: "Northside Trauma", region: "NA", verified: true },
  { name: "Helix International", region: "EU", verified: true },
];
