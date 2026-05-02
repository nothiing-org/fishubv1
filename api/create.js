import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

export default async function handler(req, res) {
  const { template, hours } = req.body;
  const linkId = Math.random().toString(36).substring(2, 8); // كود عشوائي
  
  // التأكد إن المدة لا تتجاوز 72 ساعة
  const duration = Math.min(hours, 72);
  const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

  const { data, error } = await supabase.from('links').insert([
    { id: linkId, template_name: template, expires_at: expiresAt }
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ link: `/v/${linkId}`, id: linkId });
}
