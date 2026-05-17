export type UserRole = "fund_raiser" | "donator" | "hospital" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_verified: boolean;
  created_at?: string;
};

export type CampaignUrgency = "critical" | "high" | "medium";
export type CampaignStatus =
  | "draft"
  | "pending_verification"
  | "active"
  | "rejected"
  | "completed";

export type VerificationState = "pending_hospital" | "pending_admin" | "approved" | "rejected";

export type Campaign = {
  id: string;
  user_id: string | null;
  patient_name: string;
  hospital_name: string;
  title: string;
  description: string | null;
  diagnosis?: string | null;
  story?: string | null;
  qr_code_url?: string | null;
  medical_proof_url: string | null;
  target_amount: number;
  raised_amount: number;
  urgency: CampaignUrgency;
  status: CampaignStatus;
  verification_status: VerificationState;
  fraud_score: number;
  trust_score: number;
  donor_count: number;
  created_at?: string;
  updated_at?: string;
};

export type Donation = {
  id: string;
  campaign_id: string;
  donor_id: string | null;
  amount: number;
  status: string;
  payment_ref: string | null;
  payment_method?: string | null;
  transaction_reference?: string | null;
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at?: string;
};

export type Transaction = {
  id: string;
  wallet_id: string;
  type: "inflow" | "outflow";
  amount: number;
  description: string | null;
  campaign_id: string | null;
  created_at: string;
  /** Ledger running balance after posting (bank feed) */
  running_balance?: number | null;
  /** Bank reference / core banking id */
  bank_reference?: string | null;
  /** bank = core banking API; ledger = app-local */
  source?: "bank" | "ledger";
};

export type VerificationRecord = {
  id: string;
  campaign_id: string;
  reviewer_id: string | null;
  risk_score?: number;
  status: "approved" | "rejected";
  notes: string | null;
  created_at: string;
};

export type AiRiskScore = {
  id: string;
  campaign_id: string;
  risk_score: number;
  signals: string[];
  created_at: string;
};
