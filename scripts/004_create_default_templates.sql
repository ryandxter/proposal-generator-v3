-- Function to create default templates for new users
-- This will be called when a new user signs up

CREATE OR REPLACE FUNCTION create_default_templates_for_user(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Create default company profile template
    INSERT INTO company_profile_templates (user_id, name, content, is_default, created_at, updated_at)
    VALUES (
        user_id,
        'Template Default',
        'PT. [NAMA PERUSAHAAN]

Alamat: [ALAMAT LENGKAP]
Telepon: [NOMOR TELEPON]
Email: [EMAIL PERUSAHAAN]
Website: [WEBSITE]

PROFIL PERUSAHAAN

[NAMA PERUSAHAAN] adalah perusahaan yang bergerak di bidang [BIDANG USAHA] yang telah berpengalaman selama [TAHUN] tahun dalam memberikan solusi terbaik bagi klien-klien kami.

VISI
[VISI PERUSAHAAN]

MISI
[MISI PERUSAHAAN]

KEUNGGULAN KAMI
- [KEUNGGULAN 1]
- [KEUNGGULAN 2]
- [KEUNGGULAN 3]

Tim profesional kami siap memberikan layanan terbaik untuk memenuhi kebutuhan Anda.',
        true,
        NOW(),
        NOW()
    );

    -- Create default service benefits template
    INSERT INTO service_benefit_templates (user_id, name, content, is_default, created_at, updated_at)
    VALUES (
        user_id,
        'Template Default',
        'MANFAAT LAYANAN KAMI

1. KUALITAS TERJAMIN
   - Menggunakan standar kualitas internasional
   - Tim berpengalaman dan tersertifikasi
   - Proses quality control yang ketat

2. HARGA KOMPETITIF
   - Harga yang sesuai dengan kualitas
   - Tidak ada biaya tersembunyi
   - Paket layanan yang fleksibel

3. LAYANAN PROFESIONAL
   - Konsultasi gratis
   - Support 24/7
   - Garansi layanan

4. PENGALAMAN TERPERCAYA
   - Telah melayani [JUMLAH] klien
   - Portfolio project yang beragam
   - Testimoni positif dari klien

5. TEKNOLOGI TERDEPAN
   - Menggunakan teknologi terbaru
   - Sistem yang terintegrasi
   - Update berkala sesuai perkembangan',
        true,
        NOW(),
        NOW()
    );

    -- Create default terms and conditions template
    INSERT INTO terms_condition_templates (user_id, name, content, is_default, created_at, updated_at)
    VALUES (
        user_id,
        'Template Default',
        'SYARAT DAN KETENTUAN

1. PEMBAYARAN
   - Down Payment (DP) sebesar 50% dari total nilai kontrak
   - Pelunasan dilakukan setelah pekerjaan selesai 100%
   - Pembayaran dapat dilakukan melalui transfer bank
   - Bukti pembayaran harap dikirimkan via email/WhatsApp

2. WAKTU PENGERJAAN
   - Waktu pengerjaan sesuai dengan timeline yang disepakati
   - Keterlambatan dari pihak klien dapat mempengaruhi jadwal
   - Revisi major akan menambah waktu pengerjaan

3. REVISI
   - Revisi minor: maksimal 3x tanpa biaya tambahan
   - Revisi major: dikenakan biaya tambahan sesuai kesepakatan
   - Revisi diluar scope pekerjaan dikenakan biaya terpisah

4. HAK CIPTA
   - Hak cipta hasil pekerjaan menjadi milik klien setelah pelunasan
   - [NAMA PERUSAHAAN] berhak menggunakan untuk portfolio
   - Klien tidak diperkenankan mengklaim sebagai karya sendiri

5. FORCE MAJEURE
   - Kedua belah pihak tidak dapat dituntut atas kejadian force majeure
   - Termasuk bencana alam, pandemi, kebijakan pemerintah, dll
   - Timeline dapat disesuaikan sesuai kondisi

6. PEMBATALAN
   - Pembatalan dari klien: DP tidak dapat dikembalikan
   - Pembatalan dari penyedia: DP dikembalikan 100%
   - Pekerjaan yang sudah berjalan akan diselesaikan sesuai progres',
        true,
        NOW(),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create default templates for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    PERFORM create_default_templates_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users table (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
