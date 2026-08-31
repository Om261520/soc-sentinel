export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  created_at: string;
}

export interface SecurityLog {
  id: number;
  timestamp: string;
  source_ip?: string;
  destination_ip?: string;
  source_port?: number;
  destination_port?: number;
  protocol?: string;
  event_type: string;
  username?: string;
  hostname?: string;
  action?: string;
  status?: string;
  message?: string;
  raw_log?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
}

export interface RiskFactor {
  factor: string;
  points: number;
}

export interface Alert {
  id: number;
  alert_id: string;
  timestamp: string;
  title: string;
  description: string;
  rule_name: string;
  source_ip?: string;
  destination_ip?: string;
  username?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  risk_factors?: RiskFactor[];
  status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
  category: string;
  mitre_technique?: string;
  mitre_name?: string;
  trigger_log_ids?: number[];
  incident_id?: number;
  created_at: string;
  updated_at: string;
}

export interface IncidentNote {
  id: number;
  incident_id: number;
  author: string;
  content: string;
  created_at: string;
}

export interface Incident {
  id: number;
  incident_id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Open' | 'Investigating' | 'Contained' | 'Resolved' | 'Closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  alerts: Alert[];
  notes: IncidentNote[];
}

export interface DetectionRule {
  id: number;
  rule_id: string;
  name: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  threshold: number;
  time_window: number;
  mitre_technique?: string;
  mitre_name?: string;
  logic_type: string;
  created_at: string;
}

export interface ThreatIntel {
  id: number;
  indicator: string;
  type: 'IP' | 'Domain' | 'Hash' | 'URL';
  reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
  confidence: number;
  first_seen: string;
  last_seen: string;
  category: string;
  description?: string;
}

export interface DashboardStats {
  total_events: number;
  critical_alerts: number;
  high_alerts: number;
  open_incidents: number;
  threats_detected: number;
  active_investigations: number;
}

export interface DashboardCharts {
  severity_distribution: Array<{ name: string; value: number; color: string }>;
  attack_categories: Array<{ category: string; count: number }>;
  top_source_ips: Array<{ ip: string; alerts: number; severity: string }>;
  alerts_over_time: Array<{ time: string; Critical: number; High: number; Medium: number; Low: number }>;
}

export interface AIAnalysis {
  alert_id: string;
  threat_summary: string;
  attack_type: string;
  suspicious_indicators: string[];
  mitre_context: string;
  recommended_steps: string[];
  containment_recommendation: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  services: {
    api: { status: string; latency_ms: number };
    database: { status: string; engine: string };
    detection_engine: { status: string; active_rules: number };
    log_pipeline: { status: string; ingestion_mode: string };
    ai_analyzer: { status: string; mode: string };
  };
}
