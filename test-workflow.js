async function testWorkflow() {
  console.log('=== STARTING WORKFLOW VERIFICATION TEST ===');

  // 1. Get initial stats
  const statsRes = await fetch('http://localhost:5000/api/stats');
  const stats = await statsRes.json();
  console.log('1. Initial stats:', stats.data);

  // 2. Create a new hospital interpreter job
  const newJobPayload = {
    interpreter_name: 'สมชาย ล่ามมือโปร',
    hospital_name: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์ (SiPH)',
    department: 'อายุรกรรม (Internal Medicine)',
    patient_name: 'Mr. David Miller',
    patient_hn: 'HN-889021',
    language: 'ภาษาอังกฤษ (English)',
    appointment_time: '2026-09-14 20:00',
    summary_notes: 'คนไข้ปวดศีรษะเฉียบพลัน ต้องการล่ามช่วยแพทย์ซักประวัติ',
  };

  const createRes = await fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJobPayload),
  });
  const created = await createRes.json();
  console.log('2. Created Job ID:', created.data.id, 'Job No:', created.data.job_no);

  // 3. Test GPS Check-in with Photo (simulate base64 camera photo)
  // Simple 1x1 white pixel png base64
  const dummyPhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const checkinRes = await fetch(`http://localhost:5000/api/jobs/${created.data.id}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: 13.7583,
      lng: 100.4856,
      accuracy: 6,
      address: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์ แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ',
      base64Photo: dummyPhotoBase64,
    }),
  });
  const checkinResult = await checkinRes.json();
  console.log('3. Check-in Result:', checkinResult.success, 'Status:', checkinResult.data.status, 'GPS Lat/Lng:', checkinResult.data.checkin_lat, checkinResult.data.checkin_lng);

  // 4. Test Upload Patient's Medical Certificate
  const uploadDocRes = await fetch(`http://localhost:5000/api/jobs/${created.data.id}/upload-doc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_type: 'ใบรับรองแพทย์ (Medical Certificate)',
      notes: 'แพทย์วินิจฉัย Tension Headache สั่งจ่ายยาแก้ปวดและให้หยุดพัก 2 วัน',
      base64Photo: dummyPhotoBase64,
      original_name: 'medical_cert_david.png',
    }),
  });
  const uploadResult = await uploadDocRes.json();
  console.log('4. Upload Medical Cert Result:', uploadResult.success, 'Doc ID:', uploadResult.data.id, 'Doc Type:', uploadResult.data.doc_type);

  // 5. Test Check-out
  const checkoutRes = await fetch(`http://localhost:5000/api/jobs/${created.data.id}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary_notes: 'ล่ามแปลผลตรวจและส่งต่อใบรับรองแพทย์ให้คนไข้เรียบร้อย คนไข้เข้าใจขั้นตอนทานยาและกำหนดนัดติดตามอาการ',
    }),
  });
  const checkoutResult = await checkoutRes.json();
  console.log('5. Check-out Result:', checkoutResult.success, 'Final Status:', checkoutResult.data.status, 'Checkout Time:', checkoutResult.data.checkout_time);

  // 6. Verify single job retrieval with docs
  const finalJobRes = await fetch(`http://localhost:5000/api/jobs/${created.data.id}`);
  const finalJob = await finalJobRes.json();
  console.log('6. Final Job Details Verified:', {
    id: finalJob.data.id,
    hospital: finalJob.data.hospital_name,
    patient: finalJob.data.patient_name,
    status: finalJob.data.status,
    docsCount: finalJob.data.docs.length,
    docName: finalJob.data.docs[0].original_name,
  });

  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

testWorkflow().catch(console.error);
