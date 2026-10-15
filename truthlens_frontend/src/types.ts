export interface VerifiedFact {
  category: string;
  fact: string;
  status: string;
}

export interface ForensicEstimate {
  layer: string;
  estimate: string;
  interpretation: string;
  confidence: string;
}

export interface CandidateMatch {
  id: string;
  title: string;
  source_url: string;
  source_domain: string;
  publish_date: string;
  category: string;
  notes: string;
  thumbnail_url: string;
  similarity_percentage: number;
  phash_distance: number;
  ssim: number;
  feature_matches: number;
  relationship: string;
  diff_artifact_rel_path: string | null;
  match_method: string;
}

export interface ElaSummary {
  quality_evaluated: number;
  scale_factor: number;
  mean_error: number;
  std_error: number;
  max_error: number;
  block_variance: number;
  high_residual_percentage: number;
  ela_anomaly_score: number;
  ela_artifact_rel_path: string;
  heatmap_artifact_rel_path: string;
  suspicious_regions_detected: boolean;
}

export interface FftSummary {
  fft_artifact_rel_path: string;
  ac_mean_energy: number;
  ac_spectral_variance: number;
  spectral_spikes_detected: number;
  periodic_lattice_detected: boolean;
  fft_anomaly_score: number;
  finding_summary: string;
}

export interface NoiseSummary {
  noise_artifact_rel_path: string;
  mean_sensor_noise_var: number;
  noise_variance_std: number;
  coefficient_of_variation: number;
  noise_inconsistency_score: number;
  splicing_detected: boolean;
  finding_summary: string;
}

export interface GradientSummary {
  gradient_artifact_rel_path: string;
  mean_gradient_magnitude: number;
  gradient_dispersion: number;
  sharp_edge_ratio: number;
  finding_summary: string;
}

export interface MetadataSummary {
  format: string | null;
  width: number;
  height: number;
  color_mode: string | null;
  has_exif: boolean;
  camera_make: string | null;
  camera_model: string | null;
  lens_model: string | null;
  software: string | null;
  datetime_original: string | null;
  exposure_time: string | null;
  f_number: string | null;
  iso_speed: string | null;
  focal_length: string | null;
  gps: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    maps_link: string;
  } | null;
  editing_software_detected: boolean;
  editing_software_name: string | null;
  metadata_stripped: boolean;
  raw_tags: Record<string, string>;
}

export interface C2paSummary {
  c2pa_present: boolean;
  status: string;
  validation_state: string;
  claim_generator: string | null;
  title: string | null;
  format: string | null;
  issuer: string | null;
  time: string | null;
  actions: Array<{
    action: string;
    softwareAgent?: string;
    parameters?: any;
  }>;
  assertions: Array<{
    label: string;
    data: any;
  }>;
  verified_fact_note: string;
}

export interface ForensicResult {
  evidence_id: string;
  case_id: string;
  sha256_hash: string;
  file_name: string;
  file_size: number;
  storage_rel_path: string;
  risk_score: number;
  risk_level: string;
  risk_color: string;
  summary_verdict: string;
  verified_facts: VerifiedFact[];
  estimates: ForensicEstimate[];
  red_flags: string[];
  confidence_rating: string;
  legal_disclaimer: string;
  metadata_summary: MetadataSummary;
  c2pa_summary: C2paSummary;
  ela_summary: ElaSummary;
  fft_summary: FftSummary;
  noise_summary: NoiseSummary;
  gradient_summary: GradientSummary;
  candidate_matches: CandidateMatch[];
}

export interface EvidenceItem {
  id: string;
  case_id: string;
  file_name: string;
  file_size: number;
  sha256_hash: string;
  mime_type: string;
  storage_rel_path: string;
  uploaded_at: string;
}

export interface CustodyLog {
  id: string;
  case_id: string;
  evidence_id: string | null;
  action: string;
  actor: string;
  timestamp: string;
  hash_verified: number | boolean;
  details: string;
}

export interface Case {
  id: string;
  case_number: string;
  title: string;
  examiner: string;
  priority: string;
  status: string;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  evidence_count?: number;
  latest_risk_score?: number;
  latest_risk_level?: string;
  evidence?: EvidenceItem[];
  forensic_results?: ForensicResult[];
  custody_logs?: CustodyLog[];
}
