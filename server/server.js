const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db } = require('./database');
const hipService = require('./hip-service');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const checkinDir = path.join(uploadsDir, 'checkin');
const docsDir = path.join(uploadsDir, 'docs');

[uploadsDir, checkinDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'checkin_photo') cb(null, checkinDir);
    else cb(null, docsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${file.fieldname}-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

// Memory storage for text/CSV USB files
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Helper: Save Base64 image
function saveBase64Image(base64Data, targetDir, prefix = 'photo') {
  const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  const mimeType = matches[1];
  const dataBuffer = Buffer.from(matches[2], 'base64');
  let ext = '.jpg';
  if (mimeType.includes('png')) ext = '.png';
  if (mimeType.includes('webp')) ext = '.webp';

  const fileName = `${prefix}-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
  const filePath = path.join(targetDir, fileName);
  fs.writeFileSync(filePath, dataBuffer);
  return fileName;
}

// ==========================================
// 1. HOSPITAL JOBS & MEDICAL CERTIFICATES
// ==========================================

app.get('/api/hospitals', (req, res) => {
  const hospitals = [
    { name: 'โรงพยาบาลบำรุงราษฎร์ (Bumrungrad International)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลกรุงเทพ (Bangkok Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลสมิติเวช สุขุมวิท (Samitivej Sukhumvit)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลพระรามเก้า (Praram 9 Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลเมดพาร์ค (MedPark Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลพญาไท 2 (Phyathai 2 Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลรามาธิบดี (Ramathibodi Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย (Chulalongkorn Hospital)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์ (SiPH)', province: 'กรุงเทพมหานคร' },
    { name: 'โรงพยาบาลกรุงเทพพัทยา (Bangkok Hospital Pattaya)', province: 'ชลบุรี' },
    { name: 'โรงพยาบาลกรุงเทพภูเก็ต (Bangkok Hospital Phuket)', province: 'ภูเก็ต' },
  ];
  res.json({ success: true, data: hospitals });
});

app.get('/api/jobs', (req, res) => {
  try {
    const { status, interpreter } = req.query;
    let query = `
      SELECT j.*, 
        (SELECT count(*) FROM medical_docs WHERE job_id = j.id) as doc_count 
      FROM jobs j 
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'all') {
      query += ' AND j.status = ?';
      params.push(status);
    }
    if (interpreter) {
      query += ' AND j.interpreter_name LIKE ?';
      params.push(`%${interpreter}%`);
    }
    query += ' ORDER BY j.created_at DESC';

    const jobs = db.prepare(query).all(...params);
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'ไม่พบงาน' });

    const docs = db.prepare('SELECT * FROM medical_docs WHERE job_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ success: true, data: { ...job, docs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const {
      interpreter_id, interpreter_name, hospital_name, department,
      patient_name, patient_hn, language, appointment_time, summary_notes,
    } = req.body;

    if (!hospital_name || !patient_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกโรงพยาบาลและชื่อคนไข้' });
    }

    const id = `job-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(100 + Math.random() * 900);
    const job_no = `JOB-${dateCode}-${randomCode}`;
    const created_at = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO jobs (
        id, job_no, interpreter_id, interpreter_name, hospital_name, department,
        patient_name, patient_hn, language, appointment_time,
        status, summary_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'assigned', ?, ?)
    `);

    insert.run(
      id, job_no, interpreter_id || null, interpreter_name || 'สมชาย ล่ามมือโปร',
      hospital_name, department || 'ทั่วไป', patient_name, patient_hn || '-',
      language || 'ภาษาญี่ปุ่น',
      appointment_time || new Date().toISOString().slice(0, 16).replace('T', ' '),
      summary_notes || '', created_at
    );

    const createdJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json({ success: true, message: 'สร้างเคสงานเรียบร้อยแล้ว', data: createdJob });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/jobs/:id/checkin', upload.single('checkin_photo'), (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, accuracy, address, base64Photo } = req.body;

    let photoFilename = null;
    if (req.file) photoFilename = `/uploads/checkin/${req.file.filename}`;
    else if (base64Photo) {
      const saved = saveBase64Image(base64Photo, checkinDir, 'checkin');
      photoFilename = `/uploads/checkin/${saved}`;
    }

    const checkin_time = new Date().toISOString();
    db.prepare(`
      UPDATE jobs SET
        checkin_time = ?, checkin_lat = ?, checkin_lng = ?, checkin_accuracy = ?,
        checkin_address = ?, checkin_photo = COALESCE(?, checkin_photo), status = 'checked_in'
      WHERE id = ?
    `).run(checkin_time, lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null, accuracy ? parseFloat(accuracy) : null, address || 'พิกัดโรงพยาบาล', photoFilename, id);

    const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json({ success: true, message: 'เช็คอินสำเร็จ', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/jobs/:id/upload-doc', upload.single('doc_file'), (req, res) => {
  try {
    const { id } = req.params;
    const { doc_type, notes, base64Photo, original_name } = req.body;

    let filePath = null;
    let originalName = original_name || 'medical_cert.jpg';
    let fileSize = 0;

    if (req.file) {
      filePath = `/uploads/docs/${req.file.filename}`;
      originalName = req.file.originalname;
      fileSize = req.file.size;
    } else if (base64Photo) {
      const saved = saveBase64Image(base64Photo, docsDir, 'meddoc');
      filePath = `/uploads/docs/${saved}`;
      fileSize = Math.round((base64Photo.length * 3) / 4);
    } else {
      return res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์หรือถ่ายรูป' });
    }

    const docId = `doc-${Date.now()}-${uuidv4().slice(0, 6)}`;
    db.prepare(`
      INSERT INTO medical_docs (id, job_id, doc_type, file_path, original_name, file_size, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(docId, id, doc_type || 'ใบรับรองแพทย์', filePath, originalName, fileSize, notes || '', new Date().toISOString());

    db.prepare("UPDATE jobs SET status = 'in_progress' WHERE id = ? AND status = 'checked_in'").run(id);

    const newDoc = db.prepare('SELECT * FROM medical_docs WHERE id = ?').get(docId);
    res.json({ success: true, message: 'อัปโหลดใบรับรองแพทย์สำเร็จ', data: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/docs/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM medical_docs WHERE id = ?').get(req.params.id);
    if (doc) {
      const fullPath = path.join(__dirname, doc.file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      db.prepare('DELETE FROM medical_docs WHERE id = ?').run(req.params.id);
    }
    res.json({ success: true, message: 'ลบเอกสารสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/jobs/:id/checkout', (req, res) => {
  try {
    const { summary_notes } = req.body;
    const checkout_time = new Date().toISOString();
    db.prepare(`
      UPDATE jobs SET checkout_time = ?, status = 'completed', summary_notes = COALESCE(?, summary_notes)
      WHERE id = ?
    `).run(checkout_time, summary_notes, req.params.id);

    const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'เช็คเอาท์เสร็จสิ้นงานล่าม รพ.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. CLINIC STAFF (เมดิคอลทีม: แพทย์, พยาบาล)
// ==========================================

app.get('/api/staff', (req, res) => {
  try {
    const { role, department } = req.query;
    let query = 'SELECT * FROM staff WHERE 1=1';
    const params = [];
    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    if (department && department !== 'all') {
      query += ' AND department LIKE ?';
      params.push(`%${department}%`);
    }
    query += ' ORDER BY role DESC, name ASC';
    const staff = db.prepare(query).all(...params);
    res.json({ success: true, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/staff', (req, res) => {
  try {
    const { name, role, department, license_no, phone, email, line_id, shift_rate, status, notes } = req.body;
    if (!name || !role) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อและตำแหน่ง' });

    const id = `stf-${Date.now()}`;
    const count = db.prepare('SELECT count(*) as count FROM staff').get().count + 1;
    const staff_code = role === 'แพทย์' ? `MED-${100 + count}` : `NUR-${200 + count}`;

    db.prepare(`
      INSERT INTO staff (id, staff_code, name, role, department, license_no, phone, email, line_id, shift_rate, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, staff_code, name, role, department || 'ทั่วไป', license_no || '-', phone || '', email || '', line_id || '', shift_rate || 1500, status || 'active', notes || '', new Date().toISOString());

    const created = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
    res.json({ success: true, message: 'เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/staff/:id', (req, res) => {
  try {
    const { name, role, department, license_no, phone, email, line_id, shift_rate, status, notes } = req.body;
    db.prepare(`
      UPDATE staff SET name=?, role=?, department=?, license_no=?, phone=?, email=?, line_id=?, shift_rate=?, status=?, notes=?
      WHERE id=?
    `).run(name, role, department, license_no, phone, email, line_id, shift_rate, status, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'อัปเดตข้อมูลเจ้าหน้าที่เรียบร้อย', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบข้อมูลเจ้าหน้าที่สำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. INTERPRETERS DIRECTORY (ทีมล่าม)
// ==========================================

app.get('/api/interpreters', (req, res) => {
  try {
    const { language, status } = req.query;
    let query = 'SELECT * FROM interpreters WHERE 1=1';
    const params = [];
    if (language && language !== 'all') {
      query += ' AND languages LIKE ?';
      params.push(`%${language}%`);
    }
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY rating DESC, name ASC';
    const interpreters = db.prepare(query).all(...params);
    res.json({ success: true, data: interpreters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/interpreters', (req, res) => {
  try {
    const {
      name, languages, certification, experience_years, hourly_rate_clinic,
      hourly_rate_hospital, travel_allowance, phone, email, line_id,
      status, preferred_hospitals, rating, notes,
    } = req.body;

    if (!name || !languages) return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อและภาษา' });

    const id = `int-${Date.now()}`;
    const count = db.prepare('SELECT count(*) as count FROM interpreters').get().count + 1;
    const interpreter_code = `INT-${String(count).padStart(2, '0')}`;

    db.prepare(`
      INSERT INTO interpreters (
        id, interpreter_code, name, languages, certification, experience_years,
        hourly_rate_clinic, hourly_rate_hospital, travel_allowance, phone, email, line_id,
        status, preferred_hospitals, rating, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, interpreter_code, name, languages, certification || 'ล่ามทั่วไป', experience_years || 1,
      hourly_rate_clinic || 450, hourly_rate_hospital || 750, travel_allowance || 300,
      phone || '', email || '', line_id || '', status || 'available',
      preferred_hospitals || 'รพ.ทั่วไป', rating || 5.0, notes || '', new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM interpreters WHERE id = ?').get(id);
    res.json({ success: true, message: 'เพิ่มข้อมูลล่ามสำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/interpreters/:id', (req, res) => {
  try {
    const {
      name, languages, certification, experience_years, hourly_rate_clinic,
      hourly_rate_hospital, travel_allowance, phone, email, line_id,
      status, preferred_hospitals, rating, notes,
    } = req.body;

    db.prepare(`
      UPDATE interpreters SET
        name=?, languages=?, certification=?, experience_years=?, hourly_rate_clinic=?,
        hourly_rate_hospital=?, travel_allowance=?, phone=?, email=?, line_id=?,
        status=?, preferred_hospitals=?, rating=?, notes=?
      WHERE id=?
    `).run(
      name, languages, certification, experience_years, hourly_rate_clinic,
      hourly_rate_hospital, travel_allowance, phone, email, line_id,
      status, preferred_hospitals, rating, notes, req.params.id
    );

    const updated = db.prepare('SELECT * FROM interpreters WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'อัปเดตข้อมูลล่ามสำเร็จ', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/interpreters/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM interpreters WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบข้อมูลล่ามสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. SHIFTS (จัดกะทำงานแยก เมดิคอลทีม vs ล่าม)
// ==========================================

app.get('/api/shifts', (req, res) => {
  try {
    const { team_type, date } = req.query;
    let query = `
      SELECT s.*, 
        CASE 
          WHEN s.team_type = 'medical' THEN st.staff_code
          WHEN s.team_type = 'interpreter' THEN ip.interpreter_code
          ELSE NULL
        END as person_code
      FROM shifts s
      LEFT JOIN staff st ON s.person_id = st.id
      LEFT JOIN interpreters ip ON s.person_id = ip.id
      WHERE 1=1
    `;
    const params = [];
    if (team_type && team_type !== 'all') {
      query += ' AND s.team_type = ?';
      params.push(team_type);
    }
    if (date) {
      query += ' AND s.shift_date = ?';
      params.push(date);
    }
    query += ' ORDER BY s.shift_date DESC, s.start_time ASC';
    const shifts = db.prepare(query).all(...params);
    res.json({ success: true, data: shifts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/shifts', (req, res) => {
  try {
    const { team_type, person_id, person_name, role_or_language, shift_name, shift_date, start_time, end_time, workplace, notes } = req.body;
    if (!team_type || !person_name || !shift_date) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุทีม ชื่อผู้ปฏิบัติงาน และวันที่' });
    }

    const id = `shf-${Date.now()}`;
    db.prepare(`
      INSERT INTO shifts (id, team_type, person_id, person_name, role_or_language, shift_name, shift_date, start_time, end_time, workplace, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
    `).run(
      id,
      team_type,
      person_id || 'manual',
      person_name,
      role_or_language || '',
      shift_name || 'กะมาตรฐาน (07:00 - 16:30 น.)',
      shift_date,
      start_time || '07:00',
      end_time || '16:30',
      workplace || 'คลินิกหลัก จุดคัดกรอง (Triage)',
      notes || '',
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM shifts WHERE id = ?').get(id);
    res.json({ success: true, message: 'บันทึกกะทำงานสำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/shifts/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE shifts SET status = ? WHERE id = ?').run(status, req.params.id);
    const updated = db.prepare('SELECT * FROM shifts WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'อัปเดตสถานะกะทำงานสำเร็จ', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/shifts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM shifts WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบกะทำงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Workplaces / Stations Management (Admin can define & create)
app.get('/api/workplaces', (req, res) => {
  try {
    const workplaces = db.prepare('SELECT * FROM workplaces ORDER BY type ASC, name ASC').all();
    res.json({ success: true, data: workplaces });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/workplaces', (req, res) => {
  try {
    const { name, type, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อสถานที่/จุดปฏิบัติงาน' });
    }
    const id = `wp-${Date.now()}`;
    db.prepare(`
      INSERT INTO workplaces (id, name, type, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name.trim(), type || 'clinic', description || '', new Date().toISOString());

    const created = db.prepare('SELECT * FROM workplaces WHERE id = ?').get(id);
    res.json({ success: true, message: 'เพิ่มจุดปฏิบัติงานสำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/workplaces/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM workplaces WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'ลบจุดปฏิบัติงานสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. HIP CiF93s-VL TIME ATTENDANCE
// ==========================================

app.get('/api/attendance', (req, res) => {
  try {
    const { person_type, date } = req.query;
    let query = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params = [];
    if (person_type && person_type !== 'all') {
      query += ' AND person_type = ?';
      params.push(person_type);
    }
    if (date) {
      query += ' AND scan_time LIKE ?';
      params.push(`${date}%`);
    }
    query += ' ORDER BY scan_time DESC LIMIT 100';
    const logs = db.prepare(query).all(...params);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/attendance/device-config', (req, res) => {
  try {
    const config = hipService.getDeviceConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/attendance/device-config', (req, res) => {
  try {
    const updated = hipService.updateDeviceConfig(req.body);
    res.json({ success: true, message: 'บันทึกการตั้งค่าเครื่องสแกน HIP เรียบร้อย', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger direct sync with HIP CiF93s-VL
app.post('/api/attendance/sync-hip', async (req, res) => {
  try {
    const { ip_address, port } = req.body;
    const result = await hipService.syncFromDevice(ip_address, port);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Import USB attlog.dat or CSV
app.post('/api/attendance/import-file', memoryUpload.single('log_file'), (req, res) => {
  try {
    let fileContent = '';
    if (req.file) {
      fileContent = req.file.buffer.toString('utf-8');
    } else if (req.body.text_content) {
      fileContent = req.body.text_content;
    } else {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ Log จาก USB' });
    }

    const imported = hipService.importUsbLogFile(fileContent, req.file ? req.file.originalname : 'attlog.dat');
    res.json({
      success: true,
      message: `นำเข้าบันทึกเวลาจากไฟล์สำเร็จ (${imported} รายการ)`,
      importedCount: imported,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. PAYROLL & ACCOUNTING (3 หมวดค่าจ้าง)
// ==========================================

app.get('/api/payroll', (req, res) => {
  try {
    const { category, status } = req.query;
    let query = 'SELECT * FROM payroll_records WHERE 1=1';
    const params = [];
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'all') {
      query += ' AND payment_status = ?';
      params.push(status);
    }
    query += ' ORDER BY work_date DESC, created_at DESC';
    const records = db.prepare(query).all(...params);

    // Summary totals
    const totalAmount = db.prepare('SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records').get().total;
    const pendingAmount = db.prepare("SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records WHERE payment_status = 'pending'").get().total;
    const paidAmount = db.prepare("SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records WHERE payment_status = 'paid'").get().total;

    res.json({
      success: true,
      data: records,
      summary: { totalAmount, pendingAmount, paidAmount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/payroll', (req, res) => {
  try {
    const {
      category, person_id, person_name, role_or_language, reference_job_id,
      work_date, hours_worked, rate_per_unit, travel_allowance, special_bonus,
      payment_method, notes,
    } = req.body;

    if (!category || !person_name || !rate_per_unit) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลหมวดหมู่ ผู้รับเงิน และอัตราค่าจ้าง' });
    }

    const hours = parseFloat(hours_worked || 0);
    const rate = parseFloat(rate_per_unit || 0);
    const travel = parseFloat(travel_allowance || 0);
    const bonus = parseFloat(special_bonus || 0);
    const total_amount = Math.round((hours > 0 ? hours * rate : rate) + travel + bonus);

    const id = `pay-${Date.now()}`;
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    let prefix = 'PAY-GEN';
    if (category === 'medical_clinic') prefix = 'PAY-MED';
    else if (category === 'interpreter_clinic') prefix = 'PAY-INTCLI';
    else if (category === 'interpreter_hospital') prefix = 'PAY-INTHOSP';

    const payroll_no = `${prefix}-${dateCode}-${rand}`;

    db.prepare(`
      INSERT INTO payroll_records (
        id, payroll_no, category, person_id, person_name, role_or_language,
        reference_job_id, work_date, hours_worked, rate_per_unit, travel_allowance,
        special_bonus, total_amount, payment_status, payment_method, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).run(
      id, payroll_no, category, person_id || 'manual', person_name, role_or_language || '',
      reference_job_id || null, work_date || new Date().toISOString().slice(0, 10),
      hours, rate, travel, bonus, total_amount, payment_method || 'โอนผ่านธนาคาร',
      notes || '', new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(id);
    res.json({ success: true, message: 'บันทึกรายการค่าจ้างสำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update payment status (e.g. pending -> approved -> paid)
app.put('/api/payroll/:id/status', (req, res) => {
  try {
    const { payment_status, payment_method } = req.body;
    const payment_date = payment_status === 'paid' ? new Date().toISOString() : null;
    db.prepare(`
      UPDATE payroll_records SET payment_status = ?, payment_date = COALESCE(?, payment_date), payment_method = COALESCE(?, payment_method)
      WHERE id = ?
    `).run(payment_status, payment_date, payment_method, req.params.id);

    const updated = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'อัปเดตสถานะการจ่ายเงินเรียบร้อย', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Automatically calculate interpreter hospital wage directly from job GPS checkin/checkout!
app.post('/api/payroll/auto-calculate-hospital', (req, res) => {
  try {
    const { job_id } = req.body;
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(job_id);
    if (!job) return res.status(404).json({ success: false, message: 'ไม่พบเคสงาน รพ. นี้' });

    let hours = 2.0; // default minimum
    if (job.checkin_time && job.checkout_time) {
      const diffMs = new Date(job.checkout_time) - new Date(job.checkin_time);
      hours = Math.max(1.0, parseFloat((diffMs / 3600000).toFixed(1)));
    }

    const rate = 800; // standard hospital rate
    const travel = 350; // standard hospital travel allowance
    const total = Math.round(hours * rate + travel);

    const id = `pay-auto-${Date.now()}`;
    const payroll_no = `PAY-HOSP-${Date.now().toString().slice(-6)}`;

    db.prepare(`
      INSERT INTO payroll_records (
        id, payroll_no, category, person_id, person_name, role_or_language,
        reference_job_id, work_date, hours_worked, rate_per_unit, travel_allowance,
        special_bonus, total_amount, payment_status, payment_method, notes, created_at
      ) VALUES (?, ?, 'interpreter_hospital', ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'pending', 'โอนผ่านธนาคาร', ?, ?)
    `).run(
      id, payroll_no, job.interpreter_id || 'int-1', job.interpreter_name, job.language,
      job.id, job.checkin_time ? job.checkin_time.slice(0, 10) : new Date().toISOString().slice(0, 10),
      hours, rate, travel, total,
      `คำนวณอัตโนมัติจากเคส ${job.job_no} ที่ ${job.hospital_name} (คนไข้: ${job.patient_name})`,
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(id);
    res.json({ success: true, message: 'คำนวณและสร้างรายการค่าจ้างงาน รพ. สำเร็จ', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. REPORTS & ANALYTICS DASHBOARD
// ==========================================

app.get('/api/reports/executive', (req, res) => {
  try {
    const totalJobs = db.prepare('SELECT count(*) as count FROM jobs').get().count;
    const completedJobs = db.prepare("SELECT count(*) as count FROM jobs WHERE status = 'completed'").get().count;
    const totalStaff = db.prepare('SELECT count(*) as count FROM staff').get().count;
    const totalInterpreters = db.prepare('SELECT count(*) as count FROM interpreters').get().count;
    const totalShiftsToday = db.prepare('SELECT count(*) as count FROM shifts').get().count;
    const totalAttendanceScans = db.prepare('SELECT count(*) as count FROM attendance_logs').get().count;

    const payrollTotal = db.prepare('SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records').get().total;
    const payrollPaid = db.prepare("SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records WHERE payment_status = 'paid'").get().total;
    const payrollPending = db.prepare("SELECT COALESCE(sum(total_amount), 0) as total FROM payroll_records WHERE payment_status = 'pending'").get().total;

    // Language breakdown
    const languageStats = db.prepare(`
      SELECT language, count(*) as count 
      FROM jobs 
      GROUP BY language 
      ORDER BY count DESC
    `).all();

    // Hospital breakdown
    const hospitalStats = db.prepare(`
      SELECT hospital_name, count(*) as count 
      FROM jobs 
      GROUP BY hospital_name 
      ORDER BY count DESC 
      LIMIT 5
    `).all();

    // Category payroll breakdown
    const payrollByCategory = db.prepare(`
      SELECT category, sum(total_amount) as total, count(*) as count
      FROM payroll_records
      GROUP BY category
    `).all();

    res.json({
      success: true,
      data: {
        kpi: {
          totalJobs,
          completedJobs,
          totalStaff,
          totalInterpreters,
          totalShiftsToday,
          totalAttendanceScans,
          payrollTotal,
          payrollPaid,
          payrollPending,
          onTimeRate: 96.5,
        },
        languageStats,
        hospitalStats,
        payrollByCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// App Health
app.get('/api/stats', (req, res) => {
  const jobsCount = db.prepare('SELECT count(*) as count FROM jobs').get().count;
  const staffCount = db.prepare('SELECT count(*) as count FROM staff').get().count;
  const interpCount = db.prepare('SELECT count(*) as count FROM interpreters').get().count;
  res.json({ success: true, data: { jobsCount, staffCount, interpCount } });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Tzuchi HR Clinic & Interpreter Platform API running on http://localhost:${PORT}`);
});
