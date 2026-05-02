import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

export default async function handler(req, res) {
  const { id } = req.query; // الكود من الرابط /v/xyz
  
  const { data: link } = await supabase.from('links').select('*').eq('id', id).single();

  if (!link || new Date() > new Date(link.expires_at)) {
    // الرابط منتهي أو غير موجود -> تحويل للموقع الحقيقي (مثل جوجل)
    return res.redirect('https://google.com'); 
  }

  // الرابط لسه شغال -> اعرض القالب المطلوب بدون تغيير الرابط
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!-- استدعاء ملف index.html للقالب من المجلدات -->`);
}
