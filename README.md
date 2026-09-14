# 🏥 MedTranslate - ระบบงานล่ามโรงพยาบาล (Hospital Interpreter Mobile Web App)

ระบบ Mobile Web Application สำหรับล่ามแปลภาษาทางการแพทย์ที่ต้องเดินทางไปปฏิบัติงานที่โรงพยาบาล ออกแบบให้ใช้งานบนสมาร์ตโฟนได้อย่างคล่องตัว (Mobile-First) สามารถเปิดใช้งานผ่าน Mobile Web Browser (Safari, Chrome) หรือผ่าน **LINE LIFF** / LINE In-App Browser ได้ทันที

---

## ✨ ฟีเจอร์หลัก (Key Features)

1. **📍 ระบบเช็คอิน GPS + ถ่ายภาพหน้างาน (GPS & Camera Check-in)**
   - ดึงพิกัด GPS อัตโนมัติจากเซนเซอร์ดาวเทียมของมือถือ (Latitude, Longitude, Accuracy)
   - มีปุ่มจำลองพิกัดโรงพยาบาล (Mock Location) สำหรับการทดสอบบนเดสก์ท็อปหรือในอาคาร
   - ถ่ายภาพเซลฟี่หรือภาพหน้าโรงพยาบาลด้วยกล้องมือถือจริง หรือเลือกรูปจากคลังภาพ
   - เชื่อมต่อไปยัง Google Maps ได้โดยตรง

2. **📄 ระบบถ่ายรูป & อัปโหลดใบรับรองแพทย์ของผู้ป่วย (Medical Certificate Upload)**
   - เปิดกล้องมือถือถ่ายรูปใบรับรองแพทย์ (Medical Certificate) จากโต๊ะแพทย์ได้ทันที
   - รองรับเอกสารหลายประเภท: ใบรับรองแพทย์, ใบสั่งยา, ผลตรวจเลือด/แล็บ, ใบนัดตรวจ
   - ระบบพรีวิวรูปภาพความละเอียดสูง พร้อมเครื่องมือ **ซูมเข้า/ออก (Zoom in/out)** และ **หมุนภาพ (Rotate)** เพื่อตรวจสอบความคมชัดของลายเซ็นและตราประทับแพทย์
   - บันทึกคำแนะนำเพิ่มเติมจากแพทย์ หรือรายละเอียดผลการวินิจฉัย

3. **📋 ระบบบริหารจัดการงานล่าม (Job Management & History)**
   - ดูรายการงานประจำวัน พร้อมสถานะ (รอเช็คอิน, เช็คอินแล้ว, กำลังแปล, เสร็จสิ้น)
   - เปิดเคสงานล่ามใหม่ได้เองหน้างาน พร้อมตัวเลือกโรงพยาบาลชั้นนำอัตโนมัติ
   - สรุปเคสงานและกด **เช็คเอาท์ (Check-out)** เพื่อปิดงาน
   - ค้นหาและดูประวัติงานย้อนหลัง พร้อมดูรูปถ่ายเช็คอินและใบรับรองแพทย์ที่เคยบันทึกไว้

---

## 🚀 วิธีเปิดใช้งานระบบ (Getting Started)

### 1. วิธีสั่งรันระบบ (Development Mode)
เปิด Terminal ในโฟลเดอร์โครงการ แล้วรันคำสั่ง:
```bash
npm run dev
```
คำสั่งนี้จะรันทั้ง:
- **Backend API Server**: `http://localhost:5000` (Node.js + Express + SQLite + Multer)
- **Frontend Mobile App**: `http://localhost:3000` (Vite + React + Tailwind CSS)

### 2. วิธีทดสอบเปิดด้วยมือถือจริงผ่าน Wi-Fi เดียวกัน
Vite ถูกตั้งค่า `host: true` ไว้เรียบร้อยแล้ว ท่านสามารถดู IP เครื่องคอมพิวเตอร์ (เช่น `192.168.1.XX:3000`) แล้วนำ URL นี้ไปเปิดในเบราว์เซอร์บนโทรศัพท์มือถือ หรือส่งลิงก์เข้า LINE เพื่อทดสอบใช้งานจริงได้ทันที

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
webappline/
├── client/                     # หน้าบ้าน (React 19 + Tailwind v4 + Lucide Icons)
│   ├── src/
│   │   ├── components/         # คอมโพเนนต์กล้อง (CameraModal), พิกัด (GpsLocationBadge), ตัวดูรูป (MedicalDocViewer)
│   │   ├── pages/              # หน้ารวมงาน (TodayJobs), หน้าเช็คอิน (ActiveJob), หน้าอัปโหลดเอกสาร (UploadDocPage), ประวัติ (HistoryPage)
│   │   ├── services/api.js     # ฟังก์ชันเรียก REST API
│   │   ├── App.jsx             # เมนูด้านล่าง (Bottom Tab Bar) และการจัดการ State
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # หลังบ้าน (Express + SQLite + Multer)
│   ├── uploads/
│   │   ├── checkin/            # โฟลเดอร์เก็บภาพถ่ายเช็คอินหน้างาน
│   │   └── docs/               # โฟลเดอร์เก็บภาพใบรับรองแพทย์และเอกสาร
│   ├── database.js             # SQLite ฐานข้อมูลเก็บตารางงานและเอกสาร
│   ├── seed-assets.js          # สคริปต์จำลองภาพตัวอย่าง
│   ├── server.js               # REST API Endpoints
│   └── package.json
├── test-workflow.js            # สคริปต์ทดสอบระบบอัตโนมัติ (End-to-End Test)
└── package.json                # สคริปต์ควบคุมส่วนกลาง (concurrently)
```
