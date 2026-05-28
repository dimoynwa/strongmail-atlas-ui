import { apiFetch } from './client';
import type { TemplateListItem } from '../types';

interface TemplateListResponse {
  templates: TemplateListItem[];
  total: number;
}

interface LocalesResponse {
  locales: string[];
}

interface BrandsResponse {
  brands: string[];
}

export async function getTemplates(): Promise<TemplateListItem[]> {
  const response = await apiFetch<TemplateListResponse>('/templates');
  return response.templates.map((template) => ({
    ...template,
    description: template.summary ?? template.description,
  }));
}

export async function getLocales(): Promise<string[]> {
  const response = await apiFetch<LocalesResponse>('/templates/locales');
  return response.locales;
}

export async function getBrands(): Promise<string[]> {
  const response = await apiFetch<BrandsResponse>('/templates/brands');
  return response.brands;
}
