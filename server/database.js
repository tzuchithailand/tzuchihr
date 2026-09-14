const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'webappline.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      job_no TEXT UNIQUE,
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
  `);

  // Seed sample jobs if table is empty
  const count = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  if (count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertJob = db.prepare(`
    INSERT INTO jobs (
      id, job_no, interpreter_name, hospital_name, department,
      patient_name, patient_hn, language, appointment_time,
      status, created_at, summary_notes
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Job 1: Ready for check-in today
  insertJob.run(
    'job-demo-1',
    `JOB-${todayStr.replace(/-/g, '')}-001`,
    'สมชาย ล่ามมือโปร',
    'โรงพยาบาลบำรุงราษฎร์ (Bumrungrad International)',
    'แผนกอายุรกรรม (Internal Medicine)',
    'Mr. Kenji Takahashi',
    'HN-982341',
    'ภาษาญี่ปุ่น (Japanese)',
    `${todayStr} 09:30`,
    'assigned',
    new Date(now.getTime() - 3600000).toISOString(),
    'คนไข้มีอาการปวดท้องต่อเนื่อง 3 วัน มีประวัติแพ้ยาเพนิซิลลิน'
  );

  // Job 2: Afternoon assignment
  insertJob.run(
    'job-demo-2',
    `JOB-${todayStr.replace(/-/g, '')}-002`,
    'สมชาย ล่ามมือโปร',
    'โรงพยาบาลกรุงเทพ (Bangkok Hospital)',
    'ศูนย์ศัลยกรรมกระดูกและข้อ (Orthopedic Center)',
    'Ms. Sarah Jenkins',
    'HN-771204',
    'ภาษาอังกฤษ (English)',
    `${todayStr} 14:00`,
    'assigned',
    new Date(now.getTime() - 7200000).toISOString(),
    'ติดตามอาการหลังผ่าตัดส่องกล้องข้อเข่า (Follow-up Post-op)'
  );

  // Job 3: Chinese interpreter job
  insertJob.run(
    'job-demo-3',
    `JOB-${todayStr.replace(/-/g, '')}-003`,
    'สมชาย ล่ามมือโปร',
    'โรงพยาบาลพระรามเก้า (Praram 9 Hospital)',
    'ศูนย์ตรวจสุขภาพ (Health Check-up Center)',
    'Mr. Wang Wei (王伟)',
    'HN-554190',
    'ภาษาจีน (Chinese)',
    `${todayStr} 16:30`,
    'assigned',
    new Date(now.getTime() - 10800000).toISOString(),
    'แปลผลการตรวจสุขภาพประจำปี Executive Program'
  );

  console.log('Sample hospital jobs seeded successfully.');
}

initDatabase();

module.exports = {
  db,
  initDatabase,
};
