import { GraduationCap, HeartPulse, ShieldCheck, ShoppingBag } from 'lucide-react';

export const INDUSTRIES = [
  { slug: 'retail', name: 'Retail', icon: ShoppingBag, description: 'From first enquiry to the next visit.', cn: '零售', hk: '零售' },
  { slug: 'healthcare', name: 'Healthcare', icon: HeartPulse, description: 'The right care starts with connection.', cn: '医疗', hk: '醫療' },
  { slug: 'insurance', name: 'Insurance', icon: ShieldCheck, description: 'Clear answers. Confident decisions.', cn: '保险', hk: '保險' },
  { slug: 'education', name: 'Education', icon: GraduationCap, description: 'Keep everyone on the same timetable.', cn: '教育', hk: '教育' },
] as const;

export type IndustrySlug = (typeof INDUSTRIES)[number]['slug'];
