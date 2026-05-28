import { apiFetch } from './client';

export interface CreateSessionRequest {
  template_name: string;
  lang_local: string;
  param_cust_brand: string;
}

export interface CreateSessionResponse {
  session_id: string;
}

export function createSession(
  payload: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  return apiFetch<CreateSessionResponse>('/session', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
