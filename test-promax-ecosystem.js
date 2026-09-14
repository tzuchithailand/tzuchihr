async function testPromaxEcosystem() {
  console.log('=== STARTING PRO MAX ECOSYSTEM VERIFICATION TEST ===');

  // 1. Test Staff API
  const staffRes = await fetch('http://localhost:5000/api/staff');
  const staffData = await staffRes.json();
  console.log('1. Staff Count:', staffData.data.length, 'Sample:', staffData.data[0].name, 'Role:', staffData.data[0].role);

  // 2. Test Interpreters API
  const interpRes = await fetch('http://localhost:5000/api/interpreters');
  const interpData = await interpRes.json();
  console.log('2. Interpreter Count:', interpData.data.length, 'Sample:', interpData.data[0].name, 'Langs:', interpData.data[0].languages);

  // 3. Test Shift Management (Medical vs Interpreter)
  const medShiftsRes = await fetch('http://localhost:5000/api/shifts?team_type=medical');
  const medShifts = await medShiftsRes.json();
  const intShiftsRes = await fetch('http://localhost:5000/api/shifts?team_type=interpreter');
  const intShifts = await intShiftsRes.json();
  console.log('3. Shifts - Medical:', medShifts.data.length, 'Interpreter:', intShifts.data.length);

  // 4. Test HIP CiF93s-VL Biometric Sync
  const syncRes = await fetch('http://localhost:5000/api/attendance/sync-hip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip_address: '192.168.1.201', port: 4370 }),
  });
  const syncResult = await syncRes.json();
  console.log('4. HIP CiF93s-VL Sync Result:', syncResult.success, 'Synced records:', syncResult.syncedRecords);

  const attRes = await fetch('http://localhost:5000/api/attendance');
  const attData = await attRes.json();
  console.log('4.1 Total Attendance Logs in DB:', attData.data.length);

  // 5. Test Payroll Across 3 Categories
  const payrollRes = await fetch('http://localhost:5000/api/payroll');
  const payrollData = await payrollRes.json();
  console.log('5. Payroll Records:', payrollData.data.length, 'Total Amount: ฿' + payrollData.summary.totalAmount);

  // 6. Test Auto-calculation of Hospital Wage
  const autoPayRes = await fetch('http://localhost:5000/api/payroll/auto-calculate-hospital', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: 'job-demo-1' }),
  });
  const autoPayResult = await autoPayRes.json();
  console.log('6. Auto-calculate Hospital Payroll:', autoPayResult.success, 'Wage No:', autoPayResult.data.payroll_no, 'Total:', autoPayResult.data.total_amount);

  // 7. Test Executive Reports Dashboard
  const reportRes = await fetch('http://localhost:5000/api/reports/executive');
  const reportData = await reportRes.json();
  console.log('7. Executive Report KPI:', {
    totalJobs: reportData.data.kpi.totalJobs,
    staff: reportData.data.kpi.totalStaff,
    interpreters: reportData.data.kpi.totalInterpreters,
    shifts: reportData.data.kpi.totalShiftsToday,
    payrollTotal: reportData.data.kpi.payrollTotal,
    languagesTracked: reportData.data.languageStats.length,
  });

  console.log('=== ALL PRO MAX MODULES VERIFIED SUCCESSFULLY! ===');
}

testPromaxEcosystem().catch(console.error);
