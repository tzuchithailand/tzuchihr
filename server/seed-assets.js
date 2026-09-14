const fs = require('fs');
const path = require('path');
const { db } = require('./database');

const uploadsDir = path.join(__dirname, 'uploads');
const checkinDir = path.join(uploadsDir, 'checkin');
const docsDir = path.join(uploadsDir, 'docs');

[uploadsDir, checkinDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create SVG representations for demo assets
const sampleCheckinSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky)"/>
  <rect x="50" y="80" width="700" height="350" rx="16" fill="#ffffff" opacity="0.95"/>
  <text x="400" y="140" font-family="sans-serif" font-size="28" font-weight="bold" fill="#0f766e" text-anchor="middle">🏥 BUMRUNGRAD INTERNATIONAL HOSPITAL</text>
  <text x="400" y="180" font-family="sans-serif" font-size="20" fill="#334155" text-anchor="middle">โรงพยาบาลบำรุงราษฎร์ - ประตูทางเข้าหลัก (Main Lobby)</text>
  <line x1="100" y1="210" x2="700" y2="210" stroke="#cbd5e1" stroke-width="2"/>
  <text x="400" y="260" font-family="sans-serif" font-size="22" font-weight="bold" fill="#1e293b" text-anchor="middle">ภาพถ่ายเช็คอินยืนยันตัวตนล่ามหน้างาน</text>
  <text x="400" y="300" font-family="sans-serif" font-size="16" fill="#64748b" text-anchor="middle">พิกัด GPS: 13.746618, 100.553047 (ความแม่นยำ 8 เมตร)</text>
  <rect x="250" y="330" width="300" height="50" rx="25" fill="#10b981"/>
  <text x="400" y="362" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">✓ CHECKED-IN VERIFIED</text>
</svg>`;

const sampleCertSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="950" viewBox="0 0 700 950">
  <rect width="700" height="950" fill="#f8fafc"/>
  <rect x="30" y="30" width="640" height="890" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
  <rect x="40" y="40" width="620" height="870" rx="8" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6 4"/>
  
  <text x="350" y="100" font-family="sans-serif" font-size="26" font-weight="bold" fill="#0f766e" text-anchor="middle">ใบรับรองแพทย์ (MEDICAL CERTIFICATE)</text>
  <text x="350" y="130" font-family="sans-serif" font-size="16" fill="#475569" text-anchor="middle">โรงพยาบาลบำรุงราษฎร์ อินเตอร์เนชั่นแนล กรุงเทพฯ</text>
  
  <line x1="80" y1="160" x2="620" y2="160" stroke="#0f766e" stroke-width="2"/>
  
  <text x="80" y="210" font-family="sans-serif" font-size="15" fill="#1e293b">ชื่อ-นามสกุลผู้ป่วย (Patient Name): <tspan font-weight="bold">Mr. Kenji Takahashi</tspan></text>
  <text x="80" y="245" font-family="sans-serif" font-size="15" fill="#1e293b">เลขประจำตัวผู้ป่วย (HN): <tspan font-weight="bold">HN-982341</tspan> | สัญชาติ: ญี่ปุ่น</text>
  <text x="80" y="280" font-family="sans-serif" font-size="15" fill="#1e293b">วันที่ตรวจรักษา (Date): <tspan font-weight="bold">วันนี้ (Today)</tspan></text>
  
  <rect x="80" y="320" width="540" height="180" rx="8" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="100" y="355" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f766e">ผลการวินิจฉัย (Diagnosis):</text>
  <text x="100" y="390" font-family="sans-serif" font-size="15" fill="#334155">Acute Gastroenteritis (กระเพาะอาหารและลำไส้อักเสบเฉียบพลัน)</text>
  <text x="100" y="425" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f766e">ความเห็นแพทย์ (Medical Advice):</text>
  <text x="100" y="460" font-family="sans-serif" font-size="15" fill="#334155">สมควรให้หยุดพักผ่อนและปฏิบัติงานที่บ้านเป็นเวลา 3 วัน</text>
  
  <text x="80" y="550" font-family="sans-serif" font-size="15" fill="#1e293b">รายการยาที่สั่ง (Medications):</text>
  <text x="100" y="585" font-family="sans-serif" font-size="14" fill="#475569">1. Omeprazole 20mg รับประทานก่อนอาหารเช้า 1 เม็ด</text>
  <text x="100" y="615" font-family="sans-serif" font-size="14" fill="#475569">2. Hyoscine-N-butylbromide 10mg รับประทานเมื่อมีอาการปวดเกร็ง</text>
  <text x="100" y="645" font-family="sans-serif" font-size="14" fill="#475569">3. ORS ผงเกลือแร่ ดื่มทดแทนการสูญเสียน้ำ</text>
  
  <!-- Stamp & Signature -->
  <circle cx="500" cy="780" r="55" fill="none" stroke="#dc2626" stroke-width="3" opacity="0.85"/>
  <text x="500" y="775" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">HOSPITAL MEDICAL</text>
  <text x="500" y="795" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626" text-anchor="middle">VERIFIED STAMP</text>
  
  <line x1="100" y1="800" x2="320" y2="800" stroke="#475569" stroke-width="1"/>
  <text x="210" y="825" font-family="sans-serif" font-size="14" fill="#475569" text-anchor="middle">นพ. ธนกฤต วชิรเวช (ว. 45892)</text>
  <text x="210" y="845" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">แพทย์ผู้ตรวจรักษา</text>
</svg>`;

const checkinFilePath = path.join(checkinDir, 'sample-checkin-1.svg');
const docFilePath = path.join(docsDir, 'sample-medical-cert-1.svg');

fs.writeFileSync(checkinFilePath, sampleCheckinSvg);
fs.writeFileSync(docFilePath, sampleCertSvg);

// Check if job-demo-1 already has sample doc
const existingDoc = db.prepare('SELECT id FROM medical_docs WHERE job_id = ?').get('job-demo-1');
if (!existingDoc) {
  db.prepare(`
    INSERT INTO medical_docs (id, job_id, doc_type, file_path, original_name, file_size, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'doc-sample-1',
    'job-demo-1',
    'ใบรับรองแพทย์ (Medical Certificate)',
    '/uploads/docs/sample-medical-cert-1.svg',
    'ใบรับรองแพทย์_Mr_Kenji.svg',
    10240,
    'แพทย์ให้พักงาน 3 วัน เนื่องจากกระเพาะอาหารอักเสบเฉียบพลัน',
    new Date().toISOString()
  );
  console.log('Sample medical certificate document added to job-demo-1');
}

console.log('Seed assets created successfully!');
