const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'webappline.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initDatabase() {
  db.exec(`
    -- 1. ตารางงานล่าม รพ.
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      job_no TEXT UNIQUE,
      interpreter_id TEXT,
      interpreter_name TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      department TEXT,
      patient_name TEXT NOT NULL,
      patient_hn TEXT,
      language TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      checkin_time TEXT,
      checkin_lat REAL,
      checkin_lng REAL,
      checkin_accuracy REAL,
      checkin_address TEXT,
      checkin_photo TEXT,
      checkout_time TEXT,
      status TEXT DEFAULT 'assigned', -- assigned, checked_in, in_progress, completed
      summary_notes TEXT,
      created_at TEXT NOT NULL
    );

    -- 2. ตารางเอกสารทางการแพทย์/ใบรับรองแพทย์
    CREATE TABLE IF NOT EXISTS medical_docs (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      original_name TEXT,
      file_size INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- 3. ตารางข้อมูลเจ้าหน้าที่เมดิคอลทีม (แพทย์, พยาบาล, เจ้าหน้าที่คลินิก)
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      staff_code TEXT UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,          -- 'แพทย์', 'พยาบาลวิชาชีพ', 'ผู้ช่วยพยาบาล', 'ประสานงาน', 'เภสัชกร'
      department TEXT NOT NULL,    -- 'แผนกอายุรกรรม', 'แผนกตรวจสุขภาพ', 'ศูนย์ผู้ป่วยต่างชาติ'
      license_no TEXT,             -- เลขที่ใบอนุญาตประกอบวิชาชีพ
      phone TEXT,
      email TEXT,
      line_id TEXT,
      shift_rate REAL DEFAULT 1500, -- ค่าเวร/ค่าตอบแทนต่อกะ (บาท)
      status TEXT DEFAULT 'active', -- 'active', 'on_leave', 'inactive'
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- 4. ตารางข้อมูลทีมล่ามแปลภาษา
    CREATE TABLE IF NOT EXISTS interpreters (
      id TEXT PRIMARY KEY,
      interpreter_code TEXT UNIQUE,
      name TEXT NOT NULL,
      languages TEXT NOT NULL,     -- 'ภาษาญี่ปุ่น, ภาษาอังกฤษ'
      certification TEXT,          -- 'JLPT N1, ใบรับรองล่ามการแพทย์ระดับสูง'
      experience_years INTEGER DEFAULT 3,
      hourly_rate_clinic REAL DEFAULT 450,    -- อัตราแปลในคลินิก (บาท/ชม.)
      hourly_rate_hospital REAL DEFAULT 700,  -- อัตราแปลออก รพ. (บาท/ชม.)
      travel_allowance REAL DEFAULT 300,      -- ค่าเดินทางต่อเคส รพ. (บาท)
      phone TEXT,
      email TEXT,
      line_id TEXT,
      status TEXT DEFAULT 'available',        -- 'available', 'on_duty', 'off_duty'
      preferred_hospitals TEXT,               -- 'บำรุงราษฎร์, กรุงเทพ, สมิติเวช'
      rating REAL DEFAULT 4.9,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- 5. ตารางจัดกะทำงาน (แยก team_type: 'medical' vs 'interpreter')
    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      team_type TEXT NOT NULL,     -- 'medical' หรือ 'interpreter'
      person_id TEXT NOT NULL,     -- staff.id หรือ interpreters.id
      person_name TEXT NOT NULL,
      role_or_language TEXT,        -- ตำแหน่ง (แพทย์/พยาบาล) หรือ ภาษาที่แปล
      shift_name TEXT NOT NULL,    -- 'กะเช้า (08:00 - 16:00)', 'กะบ่าย (14:00 - 22:00)', 'กะดึก/On-Call (22:00 - 08:00)'
      shift_date TEXT NOT NULL,    -- YYYY-MM-DD
      start_time TEXT NOT NULL,    -- 08:00
      end_time TEXT NOT NULL,      -- 16:00
      workplace TEXT NOT NULL,     -- 'คลินิกหลัก แผนกอายุรกรรม' หรือ 'รพ.บำรุงราษฎร์'
      status TEXT DEFAULT 'scheduled', -- 'scheduled', 'on_duty', 'completed', 'absent'
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- 6. ตารางบันทึกเวลาจากเครื่องสแกน HIP CiF93s-VL
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      device_model TEXT DEFAULT 'HIP CiF93s-VL',
      device_ip TEXT DEFAULT '192.168.1.201',
      enroll_no TEXT NOT NULL,         -- รหัสพนักงานในเครื่องสแกน (เช่น 101, 201)
      person_id TEXT,
      person_name TEXT NOT NULL,
      person_type TEXT NOT NULL,       -- 'medical' หรือ 'interpreter'
      scan_time TEXT NOT NULL,         -- YYYY-MM-DD HH:mm:ss
      verify_mode TEXT DEFAULT 'Face', -- 'Face' (สแกนใบหน้า), 'Fingerprint', 'Card'
      punch_state TEXT DEFAULT 'Check-In', -- 'Check-In', 'Check-Out', 'OT-In', 'OT-Out'
      sync_source TEXT DEFAULT 'network_sync', -- 'network_sync', 'file_import', 'manual'
      created_at TEXT NOT NULL
    );

    -- 7. ตารางการตั้งค่าเครื่องสแกน HIP CiF93s-VL
    CREATE TABLE IF NOT EXISTS device_configs (
      id TEXT PRIMARY KEY,
      device_name TEXT NOT NULL,
      model TEXT DEFAULT 'HIP CiF93s-VL',
      ip_address TEXT NOT NULL,
      port INTEGER DEFAULT 4370,
      comm_key TEXT DEFAULT '0',
      is_active INTEGER DEFAULT 1,
      last_sync_time TEXT,
      total_records INTEGER DEFAULT 0
    );

    -- 8. ตารางบัญชีและคำนวณค่าจ้าง (payroll_records) แบ่ง 3 หมวด
    CREATE TABLE IF NOT EXISTS payroll_records (
      id TEXT PRIMARY KEY,
      payroll_no TEXT UNIQUE,
      category TEXT NOT NULL,          -- 'medical_clinic', 'interpreter_clinic', 'interpreter_hospital'
      person_id TEXT NOT NULL,
      person_name TEXT NOT NULL,
      role_or_language TEXT,
      reference_job_id TEXT,           -- เชื่อมกับ jobs.id (กรณีไป รพ.)
      work_date TEXT NOT NULL,
      hours_worked REAL DEFAULT 0,
      rate_per_unit REAL NOT NULL,     -- อัตราค่าจ้าง (บาท/ชม. หรือ บาท/กะ)
      travel_allowance REAL DEFAULT 0, -- ค่าเดินทางไป รพ.
      special_bonus REAL DEFAULT 0,    -- ค่า OT หรือเบี้ยเลี้ยงพิเศษ
      total_amount REAL NOT NULL,      -- ยอดสุทธิ
      payment_status TEXT DEFAULT 'pending', -- 'pending' (รออนุมัติ), 'approved' (อนุมัติแล้ว), 'paid' (จ่ายแล้ว)
      payment_date TEXT,
      payment_method TEXT,             -- 'โอนผ่านธนาคาร', 'พร้อมเพย์', 'เงินสด'
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(reference_job_id) REFERENCES jobs(id)
    );

    -- 9. ตารางสถานที่ประจำ / จุดปฏิบัติงาน ที่ Admin กำหนดได้
    CREATE TABLE IF NOT EXISTS workplaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'clinic', -- 'clinic' หรือ 'hospital'
      description TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default data if empty
  seedFullEcosystem();
  seedWorkplaces();
}

function seedFullEcosystem() {
  const staffCount = db.prepare('SELECT count(*) as count FROM staff').get().count;
  if (staffCount > 0) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Seed Medical Staff (แพทย์ พยาบาล เจ้าหน้าที่)
  const insertStaff = db.prepare(`
    INSERT INTO staff (id, staff_code, name, role, department, license_no, phone, email, line_id, shift_rate, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStaff.run(
    'stf-1', 'MED-101', 'นพ. วิทยา วชิรเวช', 'แพทย์', 'แผนกอายุรกรรม',
    'ว. 48921', '081-445-1234', 'dr.wittaya@tzuchiclinic.org', 'dr.wittaya',
    3500, 'active', 'แพทย์ประจำคลินิก เชี่ยวชาญโรคระบบทางเดินอาหาร', now.toISOString()
  );

  insertStaff.run(
    'stf-2', 'MED-102', 'พญ. นภาพร จิตพิสุทธิ์', 'แพทย์', 'ศูนย์ตรวจสุขภาพ & กุมารเวช',
    'ว. 52109', '089-234-5678', 'dr.naphaporn@tzuchiclinic.org', 'dr.naphaporn',
    3500, 'active', 'แพทย์ตรวจสุขภาพ Executive Check-up', now.toISOString()
  );

  insertStaff.run(
    'stf-3', 'NUR-201', 'พว. กรรณิการ์ สุขสวัสดิ์', 'พยาบาลวิชาชีพ', 'แผนกอายุรกรรม & ผู้ป่วยวิกฤต',
    'พย. 88124', '086-789-0123', 'kannika.s@tzuchiclinic.org', 'kannika_nurse',
    1600, 'active', 'หัวหน้าพยาบาลเวรเช้า', now.toISOString()
  );

  insertStaff.run(
    'stf-4', 'NUR-202', 'พว. ธีรภัทร ชาญวิทย์', 'พยาบาลวิชาชีพ', 'แผนกฉุกเฉิน & เวชระเบียน',
    'พย. 90432', '085-112-3344', 'theerapat@tzuchiclinic.org', 'theera_n',
    1600, 'active', 'พยาบาลเวรบ่าย/คัดกรอง Triage', now.toISOString()
  );

  insertStaff.run(
    'stf-5', 'CRD-301', 'คุณมณีรัตน์ วงศ์สว่าง', 'ประสานงาน', 'ศูนย์ประสานงานผู้ป่วยต่างชาติ (International Center)',
    '-', '082-998-8776', 'maneerat@tzuchiclinic.org', 'manee_coord',
    1200, 'active', 'ผู้ประสานงานจัดส่งล่ามและประสานงานสถานทูต', now.toISOString()
  );

  // 2. Seed Interpreters (ล่ามแปลภาษา)
  const insertInterp = db.prepare(`
    INSERT INTO interpreters (
      id, interpreter_code, name, languages, certification, experience_years,
      hourly_rate_clinic, hourly_rate_hospital, travel_allowance, phone, email, line_id,
      status, preferred_hospitals, rating, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInterp.run(
    'int-1', 'INT-01', 'สมชาย ล่ามมือโปร', 'ภาษาญี่ปุ่น, ภาษาอังกฤษ', 'JLPT N1 / ประกาศนียบัตรล่ามแพทย์สากล', 8,
    500, 800, 350, '089-111-2233', 'somchai.jp@gmail.com', 'somchai_translator',
    'available', 'รพ.บำรุงราษฎร์, รพ.กรุงเทพ, รพ.สมิติเวช', 4.95,
    'เชี่ยวชาญการแปลโรคระบบประสาทและศัลยกรรมกระดูก', now.toISOString()
  );

  insertInterp.run(
    'int-2', 'INT-02', 'คุณหลิน ซินอี๋ (Lin Xinyi)', 'ภาษาจีน, ภาษาอังกฤษ', 'HSK ระดับ 6 / ล่ามเวชศาสตร์ชะลอวัย', 6,
    450, 750, 300, '087-333-4455', 'xinyi.lin@gmail.com', 'lin_chinese',
    'available', 'รพ.พระรามเก้า, รพ.เมดพาร์ค, รพ.พญาไท 2', 4.90,
    'เชี่ยวชาญกลุ่มผู้ป่วยจีน Medical Tourism และตรวจสุขภาพ', now.toISOString()
  );

  insertInterp.run(
    'int-3', 'INT-03', 'คุณฮิเดกิ ทานากะ (Tanaka)', 'ภาษาญี่ปุ่น, ภาษาไทย', 'เจ้าของภาษา (Native Japanese) / ล่ามการแพทย์ 10 ปี', 10,
    550, 900, 400, '081-555-6677', 'tanaka.bkk@gmail.com', 'tanaka_sensei',
    'on_duty', 'รพ.สมิติเวช สุขุมวิท, รพ.บำรุงราษฎร์', 5.00,
    'ล่ามอาวุโส ประจำเคสฉุกเฉินและผ่าตัดใหญ่', now.toISOString()
  );

  insertInterp.run(
    'int-4', 'INT-04', 'คุณอับดุลเลาะห์ มานโซร์', 'ภาษาอาหรับ, ภาษาอังกฤษ', 'วุฒิภาษาอาหรับธุรกิจและการแพทย์ (Cairo Univ.)', 5,
    500, 800, 350, '084-222-7788', 'abdullah.ar@gmail.com', 'abdullah_ar',
    'available', 'รพ.บำรุงราษฎร์, รพ.กรุงเทพ', 4.85,
    'เชี่ยวชาญดูแลผู้ป่วยกลุ่มตะวันออกกลางและญาติ', now.toISOString()
  );

  // 3. Seed Shifts (กะทำงานแยก เมดิคอลทีม vs ล่าม)
  const insertShift = db.prepare(`
    INSERT INTO shifts (id, team_type, person_id, person_name, role_or_language, shift_name, shift_date, start_time, end_time, workplace, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // กะเมดิคอลทีม (กะมาตรฐาน 07:00 - 16:30 น. มีกะเดียว)
  insertShift.run('shf-m1', 'medical', 'stf-1', 'นพ. วิทยา วชิรเวช', 'แพทย์อายุรกรรม', 'กะมาตรฐาน (07:00 - 16:30 น.)', todayStr, '07:00', '16:30', 'คลินิกหลัก ห้องตรวจ 1 (OPD 1)', 'on_duty', 'ออกตรวจ OPD ทั่วไป', now.toISOString());
  insertShift.run('shf-m2', 'medical', 'stf-3', 'พว. กรรณิการ์ สุขสวัสดิ์', 'พยาบาลวิชาชีพ', 'กะมาตรฐาน (07:00 - 16:30 น.)', todayStr, '07:00', '16:30', 'คลินิกหลัก จุดคัดกรอง (Triage)', 'on_duty', 'วัดสัญญาณชีพและเจาะเลือด', now.toISOString());
  insertShift.run('shf-m3', 'medical', 'stf-2', 'พญ. นภาพร จิตพิสุทธิ์', 'แพทย์ตรวจสุขภาพ', 'กะมาตรฐาน (07:00 - 16:30 น.)', todayStr, '07:00', '16:30', 'คลินิกหลัก ห้องตรวจ 2 (OPD 2)', 'scheduled', 'ตรวจสุขภาพและโรคเรื้อรัง', now.toISOString());

  // กะทีมล่าม (กะมาตรฐาน 07:00 - 16:30 น.)
  insertShift.run('shf-i1', 'interpreter', 'int-1', 'สมชาย ล่ามมือโปร', 'ภาษาญี่ปุ่น', 'กะมาตรฐาน (07:00 - 16:30 น.)', todayStr, '07:00', '16:30', 'เคาน์เตอร์ประสานงานล่ามต่างชาติ', 'on_duty', 'ล่ามประจำจุดต้อนรับ', now.toISOString());
  insertShift.run('shf-i2', 'interpreter', 'int-2', 'คุณหลิน ซินอี๋ (Lin Xinyi)', 'ภาษาจีน', 'กะมาตรฐาน (07:00 - 16:30 น.)', todayStr, '07:00', '16:30', 'โรงพยาบาลพระรามเก้า (Praram 9 Hospital)', 'scheduled', 'ล่ามประจำโรงพยาบาล', now.toISOString());

  // 4. Seed HIP CiF93s-VL Device Config
  db.prepare(`
    INSERT OR REPLACE INTO device_configs (id, device_name, model, ip_address, port, comm_key, is_active, last_sync_time, total_records)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'hip-dev-1',
    'เครื่องสแกนใบหน้า ประตูทางเข้าคลินิกหลัก',
    'HIP CiF93s-VL',
    '192.168.1.201',
    4370,
    '0',
    1,
    `${todayStr} 08:05:00`,
    1240
  );

  // 5. Seed Attendance Logs from HIP CiF93s-VL
  const insertLog = db.prepare(`
    INSERT INTO attendance_logs (id, device_model, device_ip, enroll_no, person_id, person_name, person_type, scan_time, verify_mode, punch_state, sync_source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('att-1', 'HIP CiF93s-VL', '192.168.1.201', '101', 'stf-1', 'นพ. วิทยา วชิรเวช', 'medical', `${todayStr} 07:55:12`, 'Face', 'Check-In', 'network_sync', now.toISOString());
  insertLog.run('att-2', 'HIP CiF93s-VL', '192.168.1.201', '201', 'stf-3', 'พว. กรรณิการ์ สุขสวัสดิ์', 'medical', `${todayStr} 07:22:45`, 'Face', 'Check-In', 'network_sync', now.toISOString());
  insertLog.run('att-3', 'HIP CiF93s-VL', '192.168.1.201', '301', 'int-1', 'สมชาย ล่ามมือโปร', 'interpreter', `${todayStr} 07:58:30`, 'Face', 'Check-In', 'network_sync', now.toISOString());

  // 6. Seed Payroll Records (3 categories)
  const insertPay = db.prepare(`
    INSERT INTO payroll_records (
      id, payroll_no, category, person_id, person_name, role_or_language,
      reference_job_id, work_date, hours_worked, rate_per_unit, travel_allowance,
      special_bonus, total_amount, payment_status, payment_date, payment_method, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // หมวด 1: ค่าจ้างเมดิคอลคลินิก
  insertPay.run(
    'pay-1', 'PAY-MED-001', 'medical_clinic', 'stf-1', 'นพ. วิทยา วชิรเวช', 'แพทย์อายุรกรรม',
    null, todayStr, 8, 3500, 0, 500, 4000, 'approved', null, 'โอนผ่านธนาคาร',
    'ค่าเวรตรวจ OPD เช้า 8 ชม. + ค่า DF เคสพิเศษ 500 บาท', now.toISOString()
  );

  insertPay.run(
    'pay-2', 'PAY-MED-002', 'medical_clinic', 'stf-3', 'พว. กรรณิการ์ สุขสวัสดิ์', 'พยาบาลวิชาชีพ',
    null, todayStr, 8, 1600, 0, 200, 1800, 'approved', null, 'โอนผ่านธนาคาร',
    'ค่ากะพยาบาล 8 ชม. + ค่าตรวจแล็บเร่งด่วน', now.toISOString()
  );

  // หมวด 2: ค่าจ้างล่ามทำงานที่คลินิก
  insertPay.run(
    'pay-3', 'PAY-INTCLI-001', 'interpreter_clinic', 'int-1', 'สมชาย ล่ามมือโปร', 'ภาษาญี่ปุ่น',
    null, todayStr, 8, 500, 0, 0, 4000, 'pending', null, 'พร้อมเพย์',
    'ค่าเวรล่ามประจำคลินิก 8 ชม. (08:00 - 16:00)', now.toISOString()
  );

  // หมวด 3: ค่าจ้างล่ามทำงานที่ รพ.
  insertPay.run(
    'pay-4', 'PAY-INTHOSP-001', 'interpreter_hospital', 'int-1', 'สมชาย ล่ามมือโปร', 'ภาษาญี่ปุ่น',
    'job-demo-1', todayStr, 3.5, 800, 350, 0, 3150, 'paid', `${todayStr} 16:30`, 'โอนผ่านธนาคาร',
    'แปลเคสคนไข้ Mr. Kenji Takahashi รพ.บำรุงราษฎร์ (3.5 ชม. x 800 + ค่าเดินทาง 350)', now.toISOString()
  );

  console.log('Full HR, Shifts, HIP Biometrics & Payroll ecosystem seeded successfully!');
}

function seedWorkplaces() {
  const count = db.prepare('SELECT count(*) as count FROM workplaces').get().count;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO workplaces (id, name, type, description, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialWorkplaces = [
    { id: 'wp-1', name: 'คลินิกหลัก จุดคัดกรอง (Triage)', type: 'clinic', desc: 'จุดซักประวัติ วัดความดัน และเจาะเลือด' },
    { id: 'wp-2', name: 'คลินิกหลัก ห้องตรวจ 1 (OPD 1)', type: 'clinic', desc: 'ห้องตรวจอายุรกรรมทั่วไป' },
    { id: 'wp-3', name: 'คลินิกหลัก ห้องตรวจ 2 (OPD 2)', type: 'clinic', desc: 'ห้องตรวจศูนย์ตรวจสุขภาพ & กุมารเวช' },
    { id: 'wp-4', name: 'คลินิกหลัก แผนกตรวจสุขภาพ (Check-up)', type: 'clinic', desc: 'ศูนย์ตรวจสุขภาพแรงงานและคนไข้ต่างชาติ' },
    { id: 'wp-5', name: 'เคาน์เตอร์ประสานงานล่ามต่างชาติ', type: 'clinic', desc: 'จุดต้อนรับและบริการแปลภาษาผู้ป่วยต่างชาติ' },
    { id: 'wp-6', name: 'ห้องยาและเวชระเบียน (Pharmacy & Records)', type: 'clinic', desc: 'จุดจ่ายยาและจัดเก็บเวชระเบียน' },
    { id: 'wp-7', name: 'โรงพยาบาลบำรุงราษฎร์ (Bumrungrad)', type: 'hospital', desc: 'รพ. ปลายทาง ส่งล่ามออกหน้างาน' },
    { id: 'wp-8', name: 'โรงพยาบาลกรุงเทพ (Bangkok Hospital)', type: 'hospital', desc: 'รพ. ปลายทาง ส่งล่ามออกหน้างาน' },
    { id: 'wp-9', name: 'โรงพยาบาลพระรามเก้า (Praram 9 Hospital)', type: 'hospital', desc: 'รพ. ปลายทาง ส่งล่ามออกหน้างาน' },
  ];

  initialWorkplaces.forEach((wp) => {
    insert.run(wp.id, wp.name, wp.type, wp.desc, new Date().toISOString());
  });

  console.log('Workplaces seeded successfully!');
}

initDatabase();

module.exports = {
  db,
  initDatabase,
};

