import { plans as content } from './plan-content.js';
import { pdfAssets } from './pdf-assets.js';

export const plans = content.map(plan => ({
  ...plan,
  pdfUrl: pdfAssets[plan.id] || '',
}));
