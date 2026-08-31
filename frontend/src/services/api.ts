import { 
  User, SecurityLog, Alert, Incident, DetectionRule, ThreatIntel, 
  DashboardStats, DashboardCharts, AIAnalysis, SystemHealth 
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'API request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse<{ access_token: string; role: string; username: string; email: string }>(res);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role, email: data.email }));
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<User>(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardStats>(res);
  },

  async getDashboardCharts(): Promise<DashboardCharts> {
    const res = await fetch(`${API_BASE}/dashboard/charts`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DashboardCharts>(res);
  },

  // Security Logs
  async getLogs(params?: { skip?: number; limit?: number; search?: string; event_type?: string; severity?: string; source_ip?: string }): Promise<SecurityLog[]> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.event_type) query.append('event_type', params.event_type);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.source_ip) query.append('source_ip', params.source_ip);

    const res = await fetch(`${API_BASE}/logs?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SecurityLog[]>(res);
  },

  async ingestLog(log: Partial<SecurityLog>): Promise<SecurityLog> {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(log),
    });
    return handleResponse<SecurityLog>(res);
  },

  // Alerts
  async getAlerts(params?: { skip?: number; limit?: number; severity?: string; status_filter?: string; search?: string }): Promise<Alert[]> {
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.append('skip', params.skip.toString());
    if (params?.limit !== undefined) query.append('limit', params.limit.toString());
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status_filter) query.append('status_filter', params.status_filter);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Alert[]>(res);
  },

  async getAlertById(id: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Alert>(res);
  },

  async updateAlertStatus(id: string, status: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Alert>(res);
  },

  async analyzeAlert(id: string): Promise<AIAnalysis> {
    const res = await fetch(`${API_BASE}/alerts/${id}/analyze`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<AIAnalysis>(res);
  },

  // Incidents
  async getIncidents(params?: { status_filter?: string; severity?: string }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params?.status_filter) query.append('status_filter', params.status_filter);
    if (params?.severity) query.append('severity', params.severity);

    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Incident[]>(res);
  },

  async getIncidentById(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<Incident>(res);
  },

  async createIncident(incident: { title: string; description: string; severity: string; assigned_to?: string; alert_ids?: number[] }): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(incident),
    });
    return handleResponse<Incident>(res);
  },

  async updateIncident(id: string, update: { status?: string; severity?: string; assigned_to?: string; title?: string; description?: string }): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    return handleResponse<Incident>(res);
  },

  async addIncidentNote(id: string, content: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  // Detection Rules
  async getRules(): Promise<DetectionRule[]> {
    const res = await fetch(`${API_BASE}/rules`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<DetectionRule[]>(res);
  },

  async updateRule(id: string, update: Partial<DetectionRule>): Promise<DetectionRule> {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(update),
    });
    return handleResponse<DetectionRule>(res);
  },

  // Threat Intel
  async getThreatIntel(params?: { indicator_type?: string; search?: string }): Promise<ThreatIntel[]> {
    const query = new URLSearchParams();
    if (params?.indicator_type) query.append('indicator_type', params.indicator_type);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/threat-intelligence?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<ThreatIntel[]>(res);
  },

  // Simulations
  async triggerSimulation(params: { attack_type: string; source_ip?: string; target_user?: string; count?: number }) {
    const res = await fetch(`${API_BASE}/simulations/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<SystemHealth>(res);
  }
};
