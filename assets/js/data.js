/* قریشی پراپرٹی ڈیلرز — ڈیٹا لیئر (localStorage میں محفوظ) */

const STORAGE_KEY = 'qpd_store_v1';

function seedData() {
  return {
    properties: [
      { id: 'ADR-01', deal: 'rent', ptype: 'house', rooms: 5, floors: 2, area: 10, loc: 'ڈی ایچ اے فیز 5، لاہور', price: 85000, owner: 'ملک ادریس قریشی', ownerPhone: '0300-1234567', tenant: 'عثمان طارق', date: '2026-06-02', status: 'active' },
      { id: 'ADR-02', deal: 'rent', ptype: 'flat', rooms: 3, floors: 4, area: 6, loc: 'گلبرگ 3، لاہور', price: 55000, owner: 'حافظ محمد اویس', ownerPhone: '0301-2345678', tenant: '', date: '2026-06-10', status: 'available' },
      { id: 'ADR-03', deal: 'rent', ptype: 'shop', rooms: 1, floors: 1, area: 4, loc: 'لبرٹی مارکیٹ، لاہور', price: 120000, owner: 'سعید اختر', ownerPhone: '0302-3456789', tenant: 'فیضان الیکٹرانکس', date: '2026-05-20', status: 'active' },
      { id: 'ADR-04', deal: 'rent', ptype: 'house', rooms: 4, floors: 1, area: 8, loc: 'ماڈل ٹاؤن، لاہور', price: 65000, owner: 'ذوالفقار قریشی', ownerPhone: '0333-4567890', tenant: '', date: '2026-07-01', status: 'available' },
      { id: 'ADS-01', deal: 'sale', ptype: 'house', rooms: 6, floors: 2, area: 12, loc: 'بحریہ ٹاؤن، لاہور', price: 45000000, owner: 'شیخ عمران الحق', ownerPhone: '0303-4567890', tenant: '', date: '2026-06-15', status: 'active' },
      { id: 'ADS-02', deal: 'sale', ptype: 'land', rooms: 0, floors: 0, area: 20, loc: 'ایڈن سٹی، لاہور', price: 32000000, owner: 'راجہ فیصل محمود', ownerPhone: '0304-5678901', tenant: '', date: '2026-05-28', status: 'active' },
      { id: 'ADS-03', deal: 'sale', ptype: 'flat', rooms: 3, floors: 6, area: 7, loc: 'کلفٹن، کراچی', price: 21000000, owner: 'عابد حسین', ownerPhone: '0305-6789012', tenant: '', date: '2026-04-18', status: 'sold' },
      { id: 'ADS-04', deal: 'sale', ptype: 'shop', rooms: 1, floors: 1, area: 3, loc: 'ہال روڈ، لاہور', price: 9500000, owner: 'ندیم قریشی', ownerPhone: '0306-7890123', tenant: '', date: '2026-06-25', status: 'active' },
      { id: 'ADG-01', deal: 'mortgage', ptype: 'house', rooms: 5, floors: 2, area: 10, loc: 'جوہر ٹاؤن، لاہور', price: 6000000, owner: 'طاہر محمود', ownerPhone: '0307-8901234', tenant: '', date: '2026-03-12', status: 'active', duration: '2 سال' },
      { id: 'ADG-02', deal: 'mortgage', ptype: 'flat', rooms: 2, floors: 3, area: 5, loc: 'بحریہ ٹاؤن، اسلام آباد', price: 3500000, owner: 'وسیم اکرم قریشی', ownerPhone: '0308-9012345', tenant: '', date: '2026-02-08', status: 'released', duration: '1 سال' },
    ],
    clients: [
      { id: 'CL-01', name: 'ملک ادریس قریشی', phone: '0300-1234567', type: 'owner', props: ['ADR-01'], date: '2026-01-10', notes: '' },
      { id: 'CL-02', name: 'عثمان طارق', phone: '0311-1122334', type: 'tenant', props: ['ADR-01'], date: '2026-06-01', notes: 'ملازم — بینک' },
      { id: 'CL-03', name: 'شیخ عمران الحق', phone: '0303-4567890', type: 'owner', props: ['ADS-01'], date: '2026-06-15', notes: '' },
      { id: 'CL-04', name: 'بلال اکبر', phone: '0322-3344556', type: 'buyer', props: ['ADS-01', 'ADS-02'], date: '2026-06-20', notes: 'کیش خریدار، جلدی چاہیے' },
      { id: 'CL-05', name: 'حافظ محمد اویس', phone: '0301-2345678', type: 'owner', props: ['ADR-02'], date: '2026-05-01', notes: '' },
      { id: 'CL-06', name: 'عائشہ رفیق', phone: '0333-5566778', type: 'buyer', props: ['ADR-02', 'ADS-04'], date: '2026-06-28', notes: 'کرایہ اور خریداری دونوں دیکھ رہی ہیں' },
    ],
    transactions: [
      { id: 'TXN-001', date: '2026-06-15', type: 'income', cat: 'کمیشن', amt: 450000, desc: 'ADS-01 پر فروخت کمیشن (کمپنی حصہ)' },
      { id: 'TXN-002', date: '2026-06-10', type: 'income', cat: 'کرایہ کمیشن', amt: 33000, desc: 'ADR-02 کرایہ کمیشن' },
      { id: 'TXN-003', date: '2026-06-08', type: 'expense', cat: 'دفتر', amt: 45000, desc: 'دفتر کرایہ — جون' },
      { id: 'TXN-004', date: '2026-06-05', type: 'expense', cat: 'تنخواہ', amt: 180000, desc: 'عملے کی تنخواہیں' },
      { id: 'TXN-005', date: '2026-05-28', type: 'income', cat: 'کمیشن', amt: 288000, desc: 'ADS-02 پر بیعانہ کمیشن' },
      { id: 'TXN-006', date: '2026-05-20', type: 'income', cat: 'کرایہ کمیشن', amt: 120000, desc: 'ADR-03 کرایہ کمیشن' },
      { id: 'TXN-007', date: '2026-05-15', type: 'expense', cat: 'ٹرانسپورٹ', amt: 12000, desc: 'دورہ جات — بحریہ ٹاؤن' },
      { id: 'TXN-008', date: '2026-05-10', type: 'expense', cat: 'مارکیٹنگ', amt: 25000, desc: 'فیس بک اشتہارات' },
      { id: 'TXN-009', date: '2026-04-18', type: 'income', cat: 'کمیشن', amt: 210000, desc: 'ADS-03 فروخت کمیشن' },
      { id: 'TXN-010', date: '2026-04-05', type: 'expense', cat: 'اداری', amt: 8000, desc: 'بجلی و پانی کا بل' },
    ],
    employees: [
      { id: 'EMP-01', name: 'عادل قریشی', role: 'مینیجر / جنرل منیجر', phone: '0300-0000001', baseSalary: 90000, commissionPct: 5, joinDate: '2024-01-05' },
      { id: 'EMP-02', name: 'فہد ملک', role: 'سیلز ایجنٹ', phone: '0300-0000002', baseSalary: 40000, commissionPct: 45, joinDate: '2024-03-15' },
      { id: 'EMP-03', name: 'زینب اکرم', role: 'اکاؤنٹنٹ', phone: '0300-0000003', baseSalary: 55000, commissionPct: 0, joinDate: '2023-11-01' },
      { id: 'EMP-04', name: 'حمزہ خان', role: 'سیلز ایجنٹ', phone: '0300-0000004', baseSalary: 40000, commissionPct: 45, joinDate: '2025-02-20' },
    ],
    attendance: [],
    documents: [
      { id: 'DOC-01', propertyId: 'ADS-01', name: 'ملکیت کا سند (انتقال)', type: 'قانونی سند', date: '2026-06-15', status: 'verified' },
      { id: 'DOC-02', propertyId: 'ADS-01', name: 'CNIC کاپی — مالک', type: 'شناختی دستاویز', date: '2026-06-15', status: 'verified' },
      { id: 'DOC-03', propertyId: 'ADR-01', name: 'کرایہ نامہ (Agreement)', type: 'معاہدہ', date: '2026-06-02', status: 'pending' },
      { id: 'DOC-04', propertyId: 'ADS-02', name: 'فرد ملکیت', type: 'قانونی سند', date: '2026-05-28', status: 'pending' },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.properties) return parsed;
    }
  } catch (e) { /* fall through to seed */ }
  const seeded = seedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetData() {
  const seeded = seedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}
