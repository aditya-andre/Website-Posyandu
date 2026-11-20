-- ========================================
-- Posyandu Digital — Supabase Schema
-- ========================================

-- 1. BALITA (data anak)
CREATE TABLE balita (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  tglahir DATE NOT NULL,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('L', 'P')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PENGUKURAN (riwayat pengukuran BB/TB)
CREATE TABLE pengukuran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balita_id UUID REFERENCES balita(id) ON DELETE CASCADE NOT NULL,
  tgl_ukur DATE NOT NULL,
  berat_kg NUMERIC(5,1) NOT NULL,
  tinggi_cm NUMERIC(5,1) NOT NULL,
  umur_bulan INTEGER NOT NULL,
  zscore_tb_u NUMERIC(5,2),
  status_gizi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_balita_created ON balita(created_at DESC);
CREATE INDEX idx_pengukuran_balita ON pengukuran(balita_id, tgl_ukur ASC);

-- ========================================
-- Sample data (opsional — hapas jika production)
-- ========================================
INSERT INTO balita (nama, tglahir, jenis_kelamin) VALUES
  ('Budi', '2024-01-15', 'L'),
  ('Siti', '2024-03-20', 'P'),
  ('Andi', '2024-06-10', 'L'),
  ('Dewi', '2024-08-05', 'P');