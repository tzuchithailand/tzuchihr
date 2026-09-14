# 🏥 Tzuchi HR Clinic & Hospital Interpreter Platform (Pro Max Edition)

ระบบบริหารจัดการคลินิก, บุคลากรทางการแพทย์, ทีมล่ามแปลภาษา, เครื่องสแกนใบหน้า HIP CiF93s-VL, บัญชีค่าจ้าง 3 หมวด, และระบบรายงานทั้งระบบ ออกแบบตามมาตรฐาน **Pro Max UI Design System** (iPhone Pro Max Viewport & Apple Human Interface Aesthetics)

---

## 🌟 6 เสาหลักของระบบ (Core Modules)

### 1. 📋 งานล่ามโรงพยาบาล (Hospital Interpreter Jobs)
- รับมอบหมายงานและเปิดเคสใหม่หน้างาน (เลือก รพ., แผนก, คนไข้, ภาษา)
- **เช็คอิน GPS + ถ่ายภาพหน้างาน**: ดึงพิกัดดาวเทียมอัตโนมัติ พร้อมปุ่มจำลองพิกัด รพ. และเชื่อมต่อ Google Maps
- **ถ่ายรูปและอัปโหลดใบรับรองแพทย์**: รองรับภาพถ่ายความละเอียดสูง พร้อมเครื่องมือ **ซูมเข้า-ออก (Zoom)** และ **หมุนภาพ (Rotate)** เพื่อตรวจเช็คลายเซ็นและตราประทับแพทย์
- เช็คเอาท์และบันทึกข้อคิดเห็นของแพทย์เมื่อเสร็จสิ้นภารกิจ

### 2. 👥 ฐานข้อมูลบุคลากรคลินิก (Personnel Directory)
- **🩺 เมดิคอลทีม**: ฐานข้อมูลแพทย์, พยาบาลวิชาชีพ, ผู้ช่วยพยาบาล, เลขที่ใบประกอบวิชาชีพ, แผนกตรวจ, อัตราค่าเวร
- **🌐 ทีมล่ามแปลภาษา**: ฐานข้อมูลล่ามเฉพาะทาง, ภาษาที่เชี่ยวชาญ (ญี่ปุ่น, จีน, อังกฤษ, อาหรับ ฯลฯ), วุฒิบัตร (JLPT N1, HSK 6, ล่ามแพทย์), อัตราค่าบริการในคลินิก และอัตราออก รพ.
- ปุ่มโทรด่วน (Call) และปุ่มทัก LINE ได้ทันทีบนจอมือถือ

### 3. ⏰ จัดกะการทำงานแยก 2 ทีม (Shift Roster)
- **🩺 กะเมดิคอลทีม**: กะตรวจ OPD เช้า (08:00 - 16:00), กะบ่าย (14:00 - 22:00), กะเวรดึก/ฉุกเฉิน (22:00 - 08:00)
- **🌐 กะทีมล่าม**: กะประจำคลินิก (In-Clinic), กะออกหน้างาน รพ., กะสแตนด์บายฉุกเฉิน (On-Call)
- แสดงสถานะ **🟢 ขึ้นเวรอยู่ (On-Duty Live)** แบบเรียลไทม์ และปุ่มเปลี่ยนสถานะเมื่อออกเวร

### 4. ⏱️ ดึงเวลาเข้า-ออกงานจากเครื่องสแกน HIP CiF93s-VL (Time Attendance)
- **Direct Network Sync (TCP Port 4370)**: กำหนด IP Address ของเครื่องสแกนในคลินิก แล้วกด "ดึงเวลา HIP ทันที" ผ่านระบบ LAN
- **USB Flash Drive Log Import**: นำเข้าไฟล์บันทึกเวลา `attlog.dat` หรือ CSV จาก Flash Drive สำหรับเครื่องที่ติดตั้งในจุดออฟไลน์
- ตรวจจับการสแกนใบหน้า (Face Recognition) และลายนิ้วมือ พร้อมจับคู่กับกะทำงานเพื่อเช็คว่า มาตรงเวลา, สาย (Late), หรือทำล่วงเวลา (OT)

### 5. 💰 ระบบบัญชีและคำนวณค่าจ้าง 3 หมวด (Accounting & Payroll)
- **🩺 1. ค่าจ้างเมดิคอลทีม (คลินิก)**: คำนวณตามกะตรวจแพทย์, Doctor Fee (DF), ค่ากะพยาบาล
- **🌐 2. ค่าจ้างล่ามประจำคลินิก**: คำนวณตามชั่วโมงที่สแกนหน้าเข้ากะจริง
- **🏥 3. ค่าจ้างล่ามปฏิบัติงาน รพ.**: คำนวณอัตโนมัติจากชั่วโมงเช็คอิน GPS ถึงเช็คเอาท์ + ค่าพาหนะเดินทาง รพ.
- ระบบอนุมัติยอดเงิน (Pending -> Approved -> Paid)
- **พิมพ์ใบสำคัญจ่าย / สลิปค่าตอบแทน (Print Payslip / Voucher)** พร้อมช่องเซ็นรับเงินและหัวกระดาษทางการ

### 6. 📊 ระบบรายงานภาพรวมทั้งระบบ (Executive Reports & Analytics)
- **Executive KPI Dashboard**: สรุปยอดเคส รพ., ชั่วโมงทำงาน, อัตราเข้างานตรงเวลา (%), ยอดค่าจ้างรวม
- **แผนภูมิสัดส่วนภาษา**: วิเคราะห์ความต้องการภาษาที่คนไข้ใช้บริการสูงสุด
- **อันดับโรงพยาบาลยอดนิยม**: สถิติ รพ. ที่ส่งล่ามไปปฏิบัติหน้าที่
- ปุ่ม **Export CSV** สำหรับนำเข้า Excel และปุ่ม **Print Report**

---

## 🚀 วิธีการเปิดใช้งาน (Getting Started)

เปิด Terminal ในโฟลเดอร์โครงการ แล้วรันคำสั่ง:
```bash
npm run dev
```

- **Frontend (Mobile-First Pro Max UI)**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:5000`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
webappline/
├── client/                     # Frontend (React 19 + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/         # ProMaxHeader, ProMaxNavBar, CameraModal, Modals
│   │   ├── pages/              # PersonnelDirectory, ShiftManagement, HipAttendancePage, AccountingPayrollPage, ReportsDashboard
│   │   ├── services/api.js     # REST API Client
│   │   ├── App.jsx             # Pro Max Shell Container & Controller
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express + SQLite + Multer)
│   ├── database.js             # SQLite Database (Jobs, Staff, Interpreters, Shifts, HIP Logs, Payroll)
│   ├── hip-service.js          # HIP CiF93s-VL TCP Sync & USB Log Parser
│   ├── server.js               # REST Endpoints ครบ 6 โมดูล
│   └── uploads/                # เก็บรูปถ่ายเช็คอิน GPS และใบรับรองแพทย์
├── test-workflow.js            # ชุดทดสอบงานล่าม รพ.
├── test-promax-ecosystem.js    # ชุดทดสอบระบบ Pro Max ทั้ง 6 โมดูล
└── package.json                # concurrently dev scripts
```
