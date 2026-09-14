const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const checkinDir = path.join(uploadsDir, 'checkin');
const docsDir = path.join(uploadsDir, 'docs');

[uploadsDir, checkinDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'checkin_photo') {
      cb(null, checkinDir);
    } else {
      cb(null, docsDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for high-res mobile photos
});

// Helper: Save Base64 image if captured directly from mobile camera canvas
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
// API Routes
// ==========================================

// 1. Get hospital list for autocomplete / quick-pick
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
    { name: 'โรงพยาบาลกรุงเทพเชียงใหม่ (Bangkok Hospital Chiang Mai)', province: 'เชียงใหม่' },
  ];
  res.json({ success: true, data: hospitals });
});

// 2. Get all jobs with medical docs count
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
    console.error('Error fetching jobs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Get single job details with medical certificates/docs
app.get('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลงานนี้' });
    }

    const docs = db.prepare('SELECT * FROM medical_docs WHERE job_id = ? ORDER BY created_at DESC').all(id);

    res.json({
      success: true,
      data: {
        ...job,
        docs,
      },
    });
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Create a new job assignment
app.post('/api/jobs', (req, res) => {
  try {
    const {
      interpreter_name,
      hospital_name,
      department,
      patient_name,
      patient_hn,
      language,
      appointment_time,
      summary_notes,
    } = req.body;

    if (!interpreter_name || !hospital_name || !patient_name) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อล่าม, โรงพยาบาล และชื่อผู้ป่วย',
      });
    }

    const id = `job-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(100 + Math.random() * 900);
    const job_no = `JOB-${dateCode}-${randomCode}`;
    const created_at = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO jobs (
        id, job_no, interpreter_name, hospital_name, department,
        patient_name, patient_hn, language, appointment_time,
        status, summary_notes, created_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        'assigned', ?, ?
      )
    `);

    insert.run(
      id,
      job_no,
      interpreter_name,
      hospital_name,
      department || 'ทั่วไป (General)',
      patient_name,
      patient_hn || '-',
      language || 'ทั่วไป',
      appointment_time || new Date().toISOString().slice(0, 16).replace('T', ' '),
      summary_notes || '',
      created_at
    );

    const createdJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json({ success: true, message: 'บันทึกงานใหม่เรียบร้อยแล้ว', data: createdJob });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Check-in with GPS & Camera Photo
app.post('/api/jobs/:id/checkin', upload.single('checkin_photo'), (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, accuracy, address, base64Photo } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'ไม่พบงานที่ต้องการเช็คอิน' });
    }

    let photoFilename = null;
    if (req.file) {
      photoFilename = `/uploads/checkin/${req.file.filename}`;
    } else if (base64Photo) {
      const savedName = saveBase64Image(base64Photo, checkinDir, 'checkin');
      photoFilename = `/uploads/checkin/${savedName}`;
    }

    const checkin_time = new Date().toISOString();
    const update = db.prepare(`
      UPDATE jobs SET
        checkin_time = ?,
        checkin_lat = ?,
        checkin_lng = ?,
        checkin_accuracy = ?,
        checkin_address = ?,
        checkin_photo = COALESCE(?, checkin_photo),
        status = 'checked_in'
      WHERE id = ?
    `);

    update.run(
      checkin_time,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      accuracy ? parseFloat(accuracy) : null,
      address || 'พิกัดโรงพยาบาล',
      photoFilename,
      id
    );

    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    res.json({
      success: true,
      message: 'เช็คอินพร้อมบันทึก GPS และภาพถ่ายสำเร็จ!',
      data: updatedJob,
    });
  } catch (err) {
    console.error('Error during checkin:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Upload Medical Certificate or medical documents
app.post('/api/jobs/:id/upload-doc', upload.single('doc_file'), (req, res) => {
  try {
    const { id } = req.params;
    const { doc_type, notes, base64Photo, original_name } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'ไม่พบงานที่ระบุ' });
    }

    let filePath = null;
    let originalName = original_name || 'ใบรับรองแพทย์.jpg';
    let fileSize = 0;

    if (req.file) {
      filePath = `/uploads/docs/${req.file.filename}`;
      originalName = req.file.originalname;
      fileSize = req.file.size;
    } else if (base64Photo) {
      const savedName = saveBase64Image(base64Photo, docsDir, 'meddoc');
      filePath = `/uploads/docs/${savedName}`;
      fileSize = Math.round((base64Photo.length * 3) / 4);
    } else {
      return res.status(400).json({ success: false, message: 'กรุณาเลือกไฟล์หรือถ่ายรูปใบรับรองแพทย์' });
    }

    const docId = `doc-${Date.now()}-${uuidv4().slice(0, 6)}`;
    const created_at = new Date().toISOString();

    const insertDoc = db.prepare(`
      INSERT INTO medical_docs (
        id, job_id, doc_type, file_path, original_name, file_size, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDoc.run(
      docId,
      id,
      doc_type || 'ใบรับรองแพทย์ (Medical Certificate)',
      filePath,
      originalName,
      fileSize,
      notes || '',
      created_at
    );

    // Also update job status to in_progress if currently checked_in
    if (job.status === 'checked_in') {
      db.prepare("UPDATE jobs SET status = 'in_progress' WHERE id = ?").run(id);
    }

    const newDoc = db.prepare('SELECT * FROM medical_docs WHERE id = ?').get(docId);
    res.json({
      success: true,
      message: 'อัปโหลดเอกสาร/ใบรับรองแพทย์เรียบร้อยแล้ว',
      data: newDoc,
    });
  } catch (err) {
    console.error('Error uploading medical doc:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Delete an uploaded document
app.delete('/api/docs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.prepare('SELECT * FROM medical_docs WHERE id = ?').get(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'ไม่พบเอกสารนี้' });
    }

    // Attempt to delete physical file if exists
    const fullPath = path.join(__dirname, doc.file_path);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.warn('Could not delete file:', fullPath);
      }
    }

    db.prepare('DELETE FROM medical_docs WHERE id = ?').run(id);
    res.json({ success: true, message: 'ลบเอกสารสำเร็จ' });
  } catch (err) {
    console.error('Error deleting doc:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Check-out / Complete job
app.post('/api/jobs/:id/checkout', (req, res) => {
  try {
    const { id } = req.params;
    const { summary_notes } = req.body;

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'ไม่พบงานที่ระบุ' });
    }

    const checkout_time = new Date().toISOString();
    const update = db.prepare(`
      UPDATE jobs SET
        checkout_time = ?,
        status = 'completed',
        summary_notes = COALESCE(?, summary_notes)
      WHERE id = ?
    `);

    update.run(checkout_time, summary_notes, id);
    const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'เช็คเอาท์เสร็จสิ้นภารกิจล่ามเรียบร้อยแล้ว!',
      data: updatedJob,
    });
  } catch (err) {
    console.error('Error checking out:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Statistics summary
app.get('/api/stats', (req, res) => {
  try {
    const totalJobs = db.prepare('SELECT count(*) as count FROM jobs').get().count;
    const activeJobs = db.prepare("SELECT count(*) as count FROM jobs WHERE status IN ('assigned', 'checked_in', 'in_progress')").get().count;
    const completedJobs = db.prepare("SELECT count(*) as count FROM jobs WHERE status = 'completed'").get().count;
    const totalDocs = db.prepare('SELECT count(*) as count FROM medical_docs').get().count;

    res.json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        completedJobs,
        totalDocs,
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Interpreter Web Server running on http://localhost:${PORT}`);
});
