import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

function createClient(token) {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return instance;
}

function normalizeError(err) {
  if (axios.isAxiosError(err)) {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Request failed';
    return new Error(message);
  }
  return err instanceof Error ? err : new Error('Unknown error');
}

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Login user and return {access_token, user}. */
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function register(full_name, email, password) {
  /** Register user and return {access_token, user}. */
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { full_name, email, password });
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getMe(token) {
  /** Get current user details. */
  try {
    const client = createClient(token);
    const res = await client.get('/auth/me');
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function uploadResume(token, file) {
  /**
   * Upload resume file. Returns ResumeUpload: {id, filename, file_path, uploaded_at, status}
   * Backend expects multipart/form-data with key "file".
   */
  try {
    const client = createClient(token);
    const formData = new FormData();
    formData.append('file', file);

    const res = await client.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function triggerAnalysis(token, resumeId) {
  /** Trigger analysis: POST /analysis/trigger { resume_id }. */
  try {
    const client = createClient(token);
    const res = await client.post('/analysis/trigger', { resume_id: resumeId });
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getAnalysisByResumeId(token, resumeId) {
  /** Get analysis results for a resume: GET /analysis/{resume_id}. */
  try {
    const client = createClient(token);
    const res = await client.get(`/analysis/${resumeId}`);
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}

// PUBLIC_INTERFACE
export async function getFeedbackSummary(token) {
  /** Get feedback summary across all resumes: GET /feedback/summary. */
  try {
    const client = createClient(token);
    const res = await client.get('/feedback/summary');
    return res.data;
  } catch (e) {
    throw normalizeError(e);
  }
}
