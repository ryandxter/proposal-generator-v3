-- Insert default templates and sample data

-- Default Company Profile Template
INSERT INTO company_profile_templates (name, content, is_default) VALUES 
('Template Profil Perusahaan Default', 
'<h2>Profil Perusahaan</h2>
<p>Kami adalah perusahaan yang bergerak di bidang teknologi informasi dengan pengalaman lebih dari 10 tahun dalam memberikan solusi digital terbaik untuk klien kami.</p>
<h3>Visi</h3>
<p>Menjadi perusahaan teknologi terdepan yang memberikan solusi inovatif dan berkualitas tinggi.</p>
<h3>Misi</h3>
<ul>
<li>Memberikan layanan teknologi terbaik kepada klien</li>
<li>Mengembangkan solusi yang efisien dan efektif</li>
<li>Membangun hubungan jangka panjang dengan mitra bisnis</li>
</ul>', 
true);

-- Default Service Benefits Template
INSERT INTO service_benefit_templates (name, content, is_default) VALUES 
('Template Keuntungan Layanan Default',
'<h2>Keuntungan Layanan Kami</h2>
<ul>
<li><strong>Kualitas Terjamin:</strong> Tim profesional dengan sertifikasi internasional</li>
<li><strong>Harga Kompetitif:</strong> Penawaran harga terbaik di kelasnya</li>
<li><strong>Support 24/7:</strong> Dukungan teknis sepanjang waktu</li>
<li><strong>Garansi Layanan:</strong> Jaminan kualitas dan kepuasan pelanggan</li>
<li><strong>Pengalaman Terpercaya:</strong> Telah melayani 500+ klien di berbagai industri</li>
</ul>',
true);

-- Default Terms & Conditions Template
INSERT INTO terms_condition_templates (name, content, is_default) VALUES 
('Template Syarat & Ketentuan Default',
'<h2>Syarat dan Ketentuan</h2>
<h3>1. Pembayaran</h3>
<ul>
<li>Pembayaran dilakukan dalam 2 tahap: 50% di awal, 50% setelah selesai</li>
<li>Pembayaran dapat dilakukan melalui transfer bank</li>
</ul>
<h3>2. Waktu Pengerjaan</h3>
<ul>
<li>Estimasi waktu pengerjaan sesuai dengan scope yang disepakati</li>
<li>Perubahan scope dapat mempengaruhi timeline</li>
</ul>
<h3>3. Revisi</h3>
<ul>
<li>Maksimal 3x revisi minor tanpa biaya tambahan</li>
<li>Revisi major akan dikenakan biaya sesuai kesepakatan</li>
</ul>
<h3>4. Hak Cipta</h3>
<ul>
<li>Hak cipta hasil kerja menjadi milik klien setelah pelunasan</li>
<li>Source code dan dokumentasi diserahkan setelah pembayaran lunas</li>
</ul>',
true);

-- Sample Products
INSERT INTO products (name, description, price, cogs, category) VALUES 
('Website Company Profile', 'Pembuatan website company profile responsive dengan CMS', 15000000, 8000000, 'Web Development'),
('E-Commerce Website', 'Pembuatan website e-commerce lengkap dengan payment gateway', 25000000, 15000000, 'Web Development'),
('Mobile App Development', 'Pengembangan aplikasi mobile Android dan iOS', 35000000, 20000000, 'Mobile Development'),
('Digital Marketing Package', 'Paket digital marketing lengkap selama 6 bulan', 12000000, 6000000, 'Digital Marketing'),
('SEO Optimization', 'Optimasi SEO website untuk meningkatkan ranking Google', 8000000, 4000000, 'Digital Marketing');
