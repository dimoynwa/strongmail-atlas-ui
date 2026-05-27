import { apiFetch } from './client';
import type { TemplateListItem } from '../types';

export function getTemplates(): Promise<TemplateListItem[]> {
  return apiFetch<TemplateListItem[]>('/templates');
}

export function getLocales(): Promise<string[]> {
  return apiFetch<string[]>('/locales');
}

export function getBrands(): Promise<string[]> {
  return apiFetch<string[]>('/brands');
}
