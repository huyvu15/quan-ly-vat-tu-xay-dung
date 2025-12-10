const path = require('path');
// Load .env từ thư mục gốc của project
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../db');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Đang thêm dữ liệu mẫu...\n');

    // Xóa dữ liệu cũ nếu có (để có thể chạy lại seed)
    console.log('Đang xóa dữ liệu cũ...');
    await client.query('DELETE FROM issue_items');
    await client.query('DELETE FROM issues');
    await client.query('DELETE FROM receipt_items');
    await client.query('DELETE FROM receipts');
    await client.query('DELETE FROM inventory');
    await client.query('DELETE FROM materials');
    await client.query('DELETE FROM suppliers');
    await client.query('DELETE FROM projects');
    console.log('✓ Đã xóa dữ liệu cũ\n');

    // Thêm công trình (8 công trình)
    const projects = [
      {
        name: 'Chung cư Green Tower',
        location: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
        start_date: '2024-01-15',
        end_date: '2025-06-30',
        status: 'active',
        description: 'Dự án chung cư cao cấp 25 tầng với 300 căn hộ'
      },
      {
        name: 'Trung tâm thương mại Central Plaza',
        location: '456 Đường Lê Lợi, Quận 1, TP.HCM',
        start_date: '2024-03-01',
        end_date: '2025-12-31',
        status: 'active',
        description: 'Trung tâm thương mại 5 tầng với diện tích 15,000m²'
      },
      {
        name: 'Nhà máy sản xuất ABC',
        location: '789 Khu công nghiệp Bình Dương',
        start_date: '2023-06-01',
        end_date: '2024-05-15',
        status: 'completed',
        description: 'Nhà máy sản xuất đã hoàn thành'
      },
      {
        name: 'Khu đô thị mới Sunrise',
        location: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
        start_date: '2024-02-10',
        end_date: '2026-03-31',
        status: 'active',
        description: 'Khu đô thị với 500 căn biệt thự và nhà phố'
      },
      {
        name: 'Bệnh viện đa khoa Quốc tế',
        location: '654 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        start_date: '2024-04-01',
        end_date: '2025-11-30',
        status: 'active',
        description: 'Bệnh viện 10 tầng với 500 giường bệnh'
      },
      {
        name: 'Trường học quốc tế ABC',
        location: '987 Đường Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM',
        start_date: '2023-09-01',
        end_date: '2024-08-31',
        status: 'completed',
        description: 'Trường học 4 tầng với 50 phòng học'
      },
      {
        name: 'Khách sạn 5 sao Luxury',
        location: '147 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        start_date: '2024-05-15',
        end_date: '2026-02-28',
        status: 'active',
        description: 'Khách sạn 30 tầng với 200 phòng'
      },
      {
        name: 'Cầu vượt Ngã Tư Sở',
        location: 'Ngã Tư Sở, Quận Thanh Xuân, Hà Nội',
        start_date: '2023-11-01',
        end_date: '2024-10-31',
        status: 'completed',
        description: 'Cầu vượt dài 500m'
      }
    ];

    const projectIds = {};
    for (const proj of projects) {
      const result = await client.query(
        `INSERT INTO projects (name, location, start_date, end_date, status, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [proj.name, proj.location, proj.start_date, proj.end_date, proj.status, proj.description]
      );
      projectIds[proj.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${projects.length} công trình`);

    // Thêm nhà cung cấp (10 nhà cung cấp)
    const suppliers = [
      {
        name: 'Công ty Vật Liệu Xây Dựng ABC',
        contact_person: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'contact@abc.com.vn',
        address: '123 Đường Trần Hưng Đạo, Quận 1, TP.HCM',
        tax_code: '0123456789'
      },
      {
        name: 'Công ty Thép Việt Nam',
        contact_person: 'Trần Thị B',
        phone: '0912345678',
        email: 'info@thepvietnam.com',
        address: '456 Đường Nguyễn Trãi, Quận 5, TP.HCM',
        tax_code: '0987654321'
      },
      {
        name: 'Công ty Xi Măng Hà Tiên',
        contact_person: 'Lê Văn C',
        phone: '0923456789',
        email: 'sales@hatien.com',
        address: '789 Đường Cộng Hòa, Quận Tân Bình, TP.HCM',
        tax_code: '0111222333'
      },
      {
        name: 'Công ty Gạch Đồng Nai',
        contact_person: 'Phạm Thị D',
        phone: '0934567890',
        email: 'info@gachdongnai.com',
        address: '321 Đường Quốc Lộ 1A, Đồng Nai',
        tax_code: '0222333444'
      },
      {
        name: 'Công ty Cát Đá Sông Đà',
        contact_person: 'Hoàng Văn E',
        phone: '0945678901',
        email: 'contact@songda.com',
        address: '654 Đường Láng, Đống Đa, Hà Nội',
        tax_code: '0333444555'
      },
      {
        name: 'Công ty Sơn Jotun',
        contact_person: 'Vũ Thị F',
        phone: '0956789012',
        email: 'sales@jotun.vn',
        address: '987 Đường Nguyễn Xiển, Thanh Xuân, Hà Nội',
        tax_code: '0444555666'
      },
      {
        name: 'Công ty Gỗ MDF Việt Nam',
        contact_person: 'Đỗ Văn G',
        phone: '0967890123',
        email: 'info@mdfvn.com',
        address: '147 Đường Tân Sơn Nhì, Tân Phú, TP.HCM',
        tax_code: '0555666777'
      },
      {
        name: 'Công ty Tôn Hòa Phát',
        contact_person: 'Bùi Thị H',
        phone: '0978901234',
        email: 'contact@hoaphat.com',
        address: '258 Đường Nguyễn Văn Cừ, Long Biên, Hà Nội',
        tax_code: '0666777888'
      },
      {
        name: 'Công ty Ống Nước Bình Minh',
        contact_person: 'Lý Văn I',
        phone: '0989012345',
        email: 'sales@binhminh.com',
        address: '369 Đường Võ Văn Tần, Quận 3, TP.HCM',
        tax_code: '0777888999'
      },
      {
        name: 'Công ty Vật Tư Điện Nước',
        contact_person: 'Ngô Thị K',
        phone: '0990123456',
        email: 'info@diennuoc.com',
        address: '741 Đường Lê Đức Thọ, Gò Vấp, TP.HCM',
        tax_code: '0888999000'
      }
    ];

    const supplierIds = {};
    for (const sup of suppliers) {
      const result = await client.query(
        `INSERT INTO suppliers (name, contact_person, phone, email, address, tax_code)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [sup.name, sup.contact_person, sup.phone, sup.email, sup.address, sup.tax_code]
      );
      supplierIds[sup.name] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${suppliers.length} nhà cung cấp`);

    // Thêm vật tư (35 vật tư)
    const materials = [
      { code: 'XM-PC40', name: 'Xi măng PC40', unit: 'bao', category: 'Xi măng', min_stock: 100 },
      { code: 'XM-PC50', name: 'Xi măng PC50', unit: 'bao', category: 'Xi măng', min_stock: 50 },
      { code: 'XM-PC60', name: 'Xi măng PC60', unit: 'bao', category: 'Xi măng', min_stock: 30 },
      { code: 'THEP-D10', name: 'Thép D10', unit: 'kg', category: 'Thép', min_stock: 5000 },
      { code: 'THEP-D12', name: 'Thép D12', unit: 'kg', category: 'Thép', min_stock: 5000 },
      { code: 'THEP-D14', name: 'Thép D14', unit: 'kg', category: 'Thép', min_stock: 4000 },
      { code: 'THEP-D16', name: 'Thép D16', unit: 'kg', category: 'Thép', min_stock: 3000 },
      { code: 'THEP-D18', name: 'Thép D18', unit: 'kg', category: 'Thép', min_stock: 2000 },
      { code: 'THEP-D20', name: 'Thép D20', unit: 'kg', category: 'Thép', min_stock: 2000 },
      { code: 'GACH-ON', name: 'Gạch ống', unit: 'viên', category: 'Gạch', min_stock: 10000 },
      { code: 'GACH-THIT', name: 'Gạch thịt', unit: 'viên', category: 'Gạch', min_stock: 5000 },
      { code: 'GACH-LAT', name: 'Gạch lát nền', unit: 'm²', category: 'Gạch', min_stock: 200 },
      { code: 'GACH-OP', name: 'Gạch ốp tường', unit: 'm²', category: 'Gạch', min_stock: 300 },
      { code: 'CAT-XAY', name: 'Cát xây dựng', unit: 'm³', category: 'Cát', min_stock: 50 },
      { code: 'CAT-SAN', name: 'Cát san lấp', unit: 'm³', category: 'Cát', min_stock: 100 },
      { code: 'DA-1x2', name: 'Đá 1x2', unit: 'm³', category: 'Đá', min_stock: 100 },
      { code: 'DA-4x6', name: 'Đá 4x6', unit: 'm³', category: 'Đá', min_stock: 100 },
      { code: 'DA-MI', name: 'Đá mi', unit: 'm³', category: 'Đá', min_stock: 50 },
      { code: 'SON-NGOAI', name: 'Sơn ngoài trời', unit: 'thùng', category: 'Sơn', min_stock: 20 },
      { code: 'SON-TRONG', name: 'Sơn trong nhà', unit: 'thùng', category: 'Sơn', min_stock: 30 },
      { code: 'SON-KIM-LOAI', name: 'Sơn kim loại', unit: 'thùng', category: 'Sơn', min_stock: 15 },
      { code: 'GO-VAN', name: 'Gỗ ván', unit: 'm²', category: 'Gỗ', min_stock: 200 },
      { code: 'GO-MDF', name: 'Gỗ MDF', unit: 'tấm', category: 'Gỗ', min_stock: 50 },
      { code: 'GO-PLYWOOD', name: 'Gỗ Plywood', unit: 'tấm', category: 'Gỗ', min_stock: 30 },
      { code: 'TONG-EP', name: 'Tôn ép', unit: 'm²', category: 'Tôn', min_stock: 500 },
      { code: 'TONG-LAP', name: 'Tôn lợp', unit: 'm²', category: 'Tôn', min_stock: 300 },
      { code: 'ONG-NUOC-21', name: 'Ống nước PVC D21', unit: 'm', category: 'Ống nước', min_stock: 1000 },
      { code: 'ONG-NUOC-27', name: 'Ống nước PVC D27', unit: 'm', category: 'Ống nước', min_stock: 800 },
      { code: 'ONG-NUOC-34', name: 'Ống nước PVC D34', unit: 'm', category: 'Ống nước', min_stock: 500 },
      { code: 'ONG-NUOC-42', name: 'Ống nước PVC D42', unit: 'm', category: 'Ống nước', min_stock: 300 },
      { code: 'THEP-ONG-21', name: 'Ống thép D21', unit: 'm', category: 'Ống thép', min_stock: 200 },
      { code: 'THEP-ONG-27', name: 'Ống thép D27', unit: 'm', category: 'Ống thép', min_stock: 150 },
      { code: 'DAY-DIEN-2.5', name: 'Dây điện 2.5mm²', unit: 'm', category: 'Điện', min_stock: 2000 },
      { code: 'DAY-DIEN-4', name: 'Dây điện 4mm²', unit: 'm', category: 'Điện', min_stock: 1500 },
      { code: 'XI-MANG-TRO', name: 'Xi măng trộn sẵn', unit: 'm³', category: 'Bê tông', min_stock: 20 }
    ];

    const materialIds = {};
    for (const mat of materials) {
      const result = await client.query(
        `INSERT INTO materials (code, name, unit, category, min_stock)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [mat.code, mat.name, mat.unit, mat.category, mat.min_stock]
      );
      materialIds[mat.code] = result.rows[0].id;
    }
    console.log(`✓ Đã thêm ${materials.length} vật tư`);

    // Thêm tồn kho với một số vật tư sắp hết (để dashboard hiển thị cảnh báo)
    const inventoryData = [
      // Chung cư Green Tower
      { material_code: 'XM-PC40', project_id: projectIds['Chung cư Green Tower'], quantity: 250, location: 'Kho A' },
      { material_code: 'XM-PC50', project_id: projectIds['Chung cư Green Tower'], quantity: 120, location: 'Kho A' },
      { material_code: 'THEP-D10', project_id: projectIds['Chung cư Green Tower'], quantity: 8500, location: 'Kho B' },
      { material_code: 'THEP-D12', project_id: projectIds['Chung cư Green Tower'], quantity: 7200, location: 'Kho B' },
      { material_code: 'THEP-D16', project_id: projectIds['Chung cư Green Tower'], quantity: 3500, location: 'Kho B' },
      { material_code: 'GACH-ON', project_id: projectIds['Chung cư Green Tower'], quantity: 25000, location: 'Kho C' },
      { material_code: 'GACH-THIT', project_id: projectIds['Chung cư Green Tower'], quantity: 12000, location: 'Kho C' },
      { material_code: 'CAT-XAY', project_id: projectIds['Chung cư Green Tower'], quantity: 150, location: 'Bãi ngoài' },
      { material_code: 'DA-1x2', project_id: projectIds['Chung cư Green Tower'], quantity: 200, location: 'Bãi ngoài' },
      { material_code: 'DA-4x6', project_id: projectIds['Chung cư Green Tower'], quantity: 180, location: 'Bãi ngoài' },
      { material_code: 'SON-NGOAI', project_id: projectIds['Chung cư Green Tower'], quantity: 35, location: 'Kho A' },
      { material_code: 'SON-TRONG', project_id: projectIds['Chung cư Green Tower'], quantity: 45, location: 'Kho A' },
      
      // Trung tâm thương mại Central Plaza
      { material_code: 'XM-PC40', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 180, location: 'Kho chính' },
      { material_code: 'THEP-D16', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 4500, location: 'Kho chính' },
      { material_code: 'THEP-D18', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 2800, location: 'Kho chính' },
      { material_code: 'GACH-THIT', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 15000, location: 'Kho phụ' },
      { material_code: 'GACH-LAT', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 350, location: 'Kho phụ' },
      { material_code: 'DA-4x6', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 180, location: 'Bãi' },
      { material_code: 'SON-NGOAI', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 45, location: 'Kho chính' },
      { material_code: 'SON-TRONG', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 60, location: 'Kho chính' },
      { material_code: 'GO-VAN', project_id: projectIds['Trung tâm thương mại Central Plaza'], quantity: 280, location: 'Kho chính' },
      
      // Khu đô thị mới Sunrise
      { material_code: 'XM-PC40', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 320, location: 'Kho 1' },
      { material_code: 'XM-PC50', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 180, location: 'Kho 1' },
      { material_code: 'THEP-D10', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 12000, location: 'Kho 2' },
      { material_code: 'THEP-D12', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 9800, location: 'Kho 2' },
      { material_code: 'GACH-ON', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 35000, location: 'Kho 3' },
      { material_code: 'CAT-XAY', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 250, location: 'Bãi' },
      { material_code: 'DA-1x2', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 300, location: 'Bãi' },
      { material_code: 'ONG-NUOC-21', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 2500, location: 'Kho 1' },
      { material_code: 'ONG-NUOC-27', project_id: projectIds['Khu đô thị mới Sunrise'], quantity: 1800, location: 'Kho 1' },
      
      // Bệnh viện đa khoa Quốc tế
      { material_code: 'XM-PC50', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 95, location: 'Kho chính' },
      { material_code: 'THEP-D16', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 3200, location: 'Kho chính' },
      { material_code: 'GACH-LAT', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 450, location: 'Kho phụ' },
      { material_code: 'GACH-OP', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 520, location: 'Kho phụ' },
      { material_code: 'SON-TRONG', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 85, location: 'Kho chính' },
      { material_code: 'GO-MDF', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 75, location: 'Kho chính' },
      { material_code: 'TONG-LAP', project_id: projectIds['Bệnh viện đa khoa Quốc tế'], quantity: 450, location: 'Kho ngoài' },
      
      // Khách sạn 5 sao Luxury
      { material_code: 'XM-PC60', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 45, location: 'Kho tầng hầm' },
      { material_code: 'THEP-D18', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 2200, location: 'Kho tầng hầm' },
      { material_code: 'THEP-D20', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 1800, location: 'Kho tầng hầm' },
      { material_code: 'GACH-LAT', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 380, location: 'Kho tầng 1' },
      { material_code: 'GACH-OP', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 420, location: 'Kho tầng 1' },
      { material_code: 'SON-TRONG', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 95, location: 'Kho tầng 1' },
      { material_code: 'GO-MDF', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 65, location: 'Kho tầng 1' },
      { material_code: 'GO-PLYWOOD', project_id: projectIds['Khách sạn 5 sao Luxury'], quantity: 45, location: 'Kho tầng 1' },
      
      // Kho trung tâm (một số vật tư sắp hết để dashboard cảnh báo)
      { material_code: 'XM-PC40', project_id: null, quantity: 85, location: 'Kho trung tâm' }, // Sắp hết (< 100)
      { material_code: 'XM-PC50', project_id: null, quantity: 35, location: 'Kho trung tâm' }, // Sắp hết (< 50)
      { material_code: 'THEP-D10', project_id: null, quantity: 4200, location: 'Kho trung tâm' }, // Sắp hết (< 5000)
      { material_code: 'GACH-ON', project_id: null, quantity: 8500, location: 'Kho trung tâm' }, // Sắp hết (< 10000)
      { material_code: 'CAT-XAY', project_id: null, quantity: 35, location: 'Kho trung tâm' }, // Sắp hết (< 50)
      { material_code: 'DA-1x2', project_id: null, quantity: 75, location: 'Kho trung tâm' }, // Sắp hết (< 100)
      { material_code: 'SON-NGOAI', project_id: null, quantity: 12, location: 'Kho trung tâm' }, // Sắp hết (< 20)
      { material_code: 'SON-TRONG', project_id: null, quantity: 18, location: 'Kho trung tâm' }, // Sắp hết (< 30)
      { material_code: 'GO-VAN', project_id: null, quantity: 150, location: 'Kho trung tâm' }, // Sắp hết (< 200)
      { material_code: 'TONG-EP', project_id: null, quantity: 380, location: 'Kho trung tâm' }, // Sắp hết (< 500)
      { material_code: 'ONG-NUOC-21', project_id: null, quantity: 750, location: 'Kho trung tâm' }, // Sắp hết (< 1000)
      { material_code: 'THEP-ONG-21', project_id: null, quantity: 120, location: 'Kho trung tâm' }, // Sắp hết (< 200)
      { material_code: 'DAY-DIEN-2.5', project_id: null, quantity: 1500, location: 'Kho trung tâm' }, // Sắp hết (< 2000)
      { material_code: 'XI-MANG-TRO', project_id: null, quantity: 12, location: 'Kho trung tâm' } // Sắp hết (< 20)
    ];

    for (const inv of inventoryData) {
      await client.query(
        `INSERT INTO inventory (material_id, project_id, quantity, location)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (material_id, project_id) DO NOTHING`,
        [materialIds[inv.material_code], inv.project_id, inv.quantity, inv.location]
      );
    }
    console.log('✓ Đã thêm tồn kho (bao gồm một số vật tư sắp hết để cảnh báo)');

    // Thêm phiếu nhập (15 phiếu)
    const receipts = [
      {
        receipt_number: 'PN-2024-001',
        project_id: projectIds['Chung cư Green Tower'],
        supplier_id: supplierIds['Công ty Vật Liệu Xây Dựng ABC'],
        receipt_date: '2024-01-20',
        total_amount: 125000000,
        notes: 'Nhập vật tư cho giai đoạn 1',
        items: [
          { material_code: 'XM-PC40', quantity: 200, unit_price: 85000 },
          { material_code: 'THEP-D10', quantity: 5000, unit_price: 18000 },
          { material_code: 'GACH-ON', quantity: 10000, unit_price: 1800 }
        ]
      },
      {
        receipt_number: 'PN-2024-002',
        project_id: projectIds['Trung tâm thương mại Central Plaza'],
        supplier_id: supplierIds['Công ty Thép Việt Nam'],
        receipt_date: '2024-03-15',
        total_amount: 98000000,
        notes: 'Nhập thép cho khung nhà',
        items: [
          { material_code: 'THEP-D16', quantity: 4000, unit_price: 22000 },
          { material_code: 'GACH-THIT', quantity: 10000, unit_price: 1000 }
        ]
      },
      {
        receipt_number: 'PN-2024-003',
        project_id: projectIds['Trung tâm thương mại Central Plaza'],
        supplier_id: supplierIds['Công ty Xi Măng Hà Tiên'],
        receipt_date: '2024-04-10',
        total_amount: 45000000,
        notes: 'Nhập sơn và vật liệu hoàn thiện',
        items: [
          { material_code: 'SON-NGOAI', quantity: 30, unit_price: 1200000 },
          { material_code: 'SON-TRONG', quantity: 25, unit_price: 360000 }
        ]
      },
      {
        receipt_number: 'PN-2024-004',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        supplier_id: supplierIds['Công ty Vật Liệu Xây Dựng ABC'],
        receipt_date: '2024-02-25',
        total_amount: 185000000,
        notes: 'Nhập vật tư cho giai đoạn khởi công',
        items: [
          { material_code: 'XM-PC40', quantity: 300, unit_price: 85000 },
          { material_code: 'THEP-D10', quantity: 8000, unit_price: 18000 },
          { material_code: 'GACH-ON', quantity: 15000, unit_price: 1800 },
          { material_code: 'CAT-XAY', quantity: 200, unit_price: 250000 }
        ]
      },
      {
        receipt_number: 'PN-2024-005',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        supplier_id: supplierIds['Công ty Cát Đá Sông Đà'],
        receipt_date: '2024-03-10',
        total_amount: 75000000,
        notes: 'Nhập cát đá',
        items: [
          { material_code: 'DA-1x2', quantity: 250, unit_price: 280000 },
          { material_code: 'DA-4x6', quantity: 200, unit_price: 300000 }
        ]
      },
      {
        receipt_number: 'PN-2024-006',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        supplier_id: supplierIds['Công ty Sơn Jotun'],
        receipt_date: '2024-04-20',
        total_amount: 68000000,
        notes: 'Nhập sơn và gỗ cho hoàn thiện',
        items: [
          { material_code: 'SON-TRONG', quantity: 80, unit_price: 360000 },
          { material_code: 'GO-MDF', quantity: 70, unit_price: 500000 }
        ]
      },
      {
        receipt_number: 'PN-2024-007',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        supplier_id: supplierIds['Công ty Gạch Đồng Nai'],
        receipt_date: '2024-05-05',
        total_amount: 42000000,
        notes: 'Nhập gạch lát và ốp',
        items: [
          { material_code: 'GACH-LAT', quantity: 400, unit_price: 85000 },
          { material_code: 'GACH-OP', quantity: 500, unit_price: 18000 }
        ]
      },
      {
        receipt_number: 'PN-2024-008',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        supplier_id: supplierIds['Công ty Thép Việt Nam'],
        receipt_date: '2024-05-20',
        total_amount: 92000000,
        notes: 'Nhập thép cho khung',
        items: [
          { material_code: 'THEP-D18', quantity: 2000, unit_price: 24000 },
          { material_code: 'THEP-D20', quantity: 1500, unit_price: 26000 }
        ]
      },
      {
        receipt_number: 'PN-2024-009',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        supplier_id: supplierIds['Công ty Gỗ MDF Việt Nam'],
        receipt_date: '2024-06-10',
        total_amount: 55000000,
        notes: 'Nhập gỗ cho nội thất',
        items: [
          { material_code: 'GO-MDF', quantity: 60, unit_price: 500000 },
          { material_code: 'GO-PLYWOOD', quantity: 40, unit_price: 625000 }
        ]
      },
      {
        receipt_number: 'PN-2024-010',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        supplier_id: supplierIds['Công ty Ống Nước Bình Minh'],
        receipt_date: '2024-06-25',
        total_amount: 38000000,
        notes: 'Nhập ống nước',
        items: [
          { material_code: 'ONG-NUOC-21', quantity: 2000, unit_price: 15000 },
          { material_code: 'ONG-NUOC-27', quantity: 1500, unit_price: 20000 }
        ]
      },
      {
        receipt_number: 'PN-2024-011',
        project_id: null,
        supplier_id: supplierIds['Công ty Vật Liệu Xây Dựng ABC'],
        receipt_date: '2024-07-05',
        total_amount: 95000000,
        notes: 'Nhập vật tư cho kho trung tâm',
        items: [
          { material_code: 'XM-PC40', quantity: 500, unit_price: 85000 },
          { material_code: 'THEP-D10', quantity: 3000, unit_price: 18000 },
          { material_code: 'GACH-ON', quantity: 20000, unit_price: 1800 }
        ]
      },
      {
        receipt_number: 'PN-2024-012',
        project_id: null,
        supplier_id: supplierIds['Công ty Cát Đá Sông Đà'],
        receipt_date: '2024-07-15',
        total_amount: 45000000,
        notes: 'Nhập cát đá cho kho trung tâm',
        items: [
          { material_code: 'CAT-XAY', quantity: 100, unit_price: 250000 },
          { material_code: 'DA-1x2', quantity: 80, unit_price: 280000 }
        ]
      },
      {
        receipt_number: 'PN-2024-013',
        project_id: projectIds['Chung cư Green Tower'],
        supplier_id: supplierIds['Công ty Tôn Hòa Phát'],
        receipt_date: '2024-08-01',
        total_amount: 52000000,
        notes: 'Nhập tôn lợp mái',
        items: [
          { material_code: 'TONG-LAP', quantity: 400, unit_price: 130000 }
        ]
      },
      {
        receipt_number: 'PN-2024-014',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        supplier_id: supplierIds['Công ty Vật Tư Điện Nước'],
        receipt_date: '2024-08-10',
        total_amount: 28000000,
        notes: 'Nhập vật tư điện nước',
        items: [
          { material_code: 'ONG-NUOC-34', quantity: 800, unit_price: 25000 },
          { material_code: 'DAY-DIEN-2.5', quantity: 2000, unit_price: 12000 },
          { material_code: 'DAY-DIEN-4', quantity: 1500, unit_price: 15000 }
        ]
      },
      {
        receipt_number: 'PN-2024-015',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        supplier_id: supplierIds['Công ty Sơn Jotun'],
        receipt_date: '2024-08-20',
        total_amount: 72000000,
        notes: 'Nhập sơn cho hoàn thiện',
        items: [
          { material_code: 'SON-TRONG', quantity: 90, unit_price: 360000 },
          { material_code: 'SON-KIM-LOAI', quantity: 50, unit_price: 780000 }
        ]
      }
    ];

    for (const receipt of receipts) {
      const receiptResult = await client.query(
        `INSERT INTO receipts (receipt_number, project_id, supplier_id, receipt_date, total_amount, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [receipt.receipt_number, receipt.project_id, receipt.supplier_id, receipt.receipt_date, receipt.total_amount, receipt.notes, 'admin']
      );
      const receiptId = receiptResult.rows[0].id;

      for (const item of receipt.items) {
        const totalPrice = item.quantity * item.unit_price;
        await client.query(
          `INSERT INTO receipt_items (receipt_id, material_id, quantity, unit_price, total_price, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [receiptId, materialIds[item.material_code], item.quantity, item.unit_price, totalPrice, '']
        );
      }
    }
    console.log(`✓ Đã thêm ${receipts.length} phiếu nhập`);

    // Thêm phiếu xuất (12 phiếu)
    const issues = [
      {
        issue_number: 'PX-2024-001',
        project_id: projectIds['Chung cư Green Tower'],
        issue_date: '2024-02-15',
        purpose: 'Xuất vật tư cho thi công tầng 1-5',
        approved_by: 'Nguyễn Văn Giám Đốc',
        items: [
          { material_code: 'XM-PC40', quantity: 100 },
          { material_code: 'THEP-D10', quantity: 2000 },
          { material_code: 'GACH-ON', quantity: 5000 }
        ]
      },
      {
        issue_number: 'PX-2024-002',
        project_id: projectIds['Trung tâm thương mại Central Plaza'],
        issue_date: '2024-04-20',
        purpose: 'Xuất vật tư cho hoàn thiện mặt tiền',
        approved_by: 'Trần Văn Phó Giám Đốc',
        items: [
          { material_code: 'SON-NGOAI', quantity: 15 },
          { material_code: 'THEP-D16', quantity: 1000 }
        ]
      },
      {
        issue_number: 'PX-2024-003',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        issue_date: '2024-03-05',
        purpose: 'Xuất vật tư cho thi công nhà mẫu',
        approved_by: 'Lê Thị Trưởng Ban',
        items: [
          { material_code: 'XM-PC40', quantity: 150 },
          { material_code: 'THEP-D10', quantity: 3000 },
          { material_code: 'GACH-ON', quantity: 8000 },
          { material_code: 'CAT-XAY', quantity: 50 }
        ]
      },
      {
        issue_number: 'PX-2024-004',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        issue_date: '2024-04-15',
        purpose: 'Xuất vật tư cho thi công đường nội bộ',
        approved_by: 'Lê Thị Trưởng Ban',
        items: [
          { material_code: 'DA-1x2', quantity: 100 },
          { material_code: 'DA-4x6', quantity: 80 }
        ]
      },
      {
        issue_number: 'PX-2024-005',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        issue_date: '2024-05-10',
        purpose: 'Xuất vật tư cho hoàn thiện phòng khám',
        approved_by: 'Phạm Văn Giám Đốc',
        items: [
          { material_code: 'SON-TRONG', quantity: 40 },
          { material_code: 'GO-MDF', quantity: 30 },
          { material_code: 'GACH-LAT', quantity: 200 }
        ]
      },
      {
        issue_number: 'PX-2024-006',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        issue_date: '2024-06-01',
        purpose: 'Xuất vật tư cho thi công phòng mổ',
        approved_by: 'Phạm Văn Giám Đốc',
        items: [
          { material_code: 'GACH-OP', quantity: 150 },
          { material_code: 'SON-TRONG', quantity: 25 }
        ]
      },
      {
        issue_number: 'PX-2024-007',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        issue_date: '2024-06-20',
        purpose: 'Xuất vật tư cho thi công khung nhà',
        approved_by: 'Hoàng Văn Tổng Giám Đốc',
        items: [
          { material_code: 'THEP-D18', quantity: 1500 },
          { material_code: 'THEP-D20', quantity: 1000 }
        ]
      },
      {
        issue_number: 'PX-2024-008',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        issue_date: '2024-07-05',
        purpose: 'Xuất vật tư cho hoàn thiện phòng',
        approved_by: 'Hoàng Văn Tổng Giám Đốc',
        items: [
          { material_code: 'SON-TRONG', quantity: 50 },
          { material_code: 'GO-MDF', quantity: 40 },
          { material_code: 'GACH-LAT', quantity: 180 }
        ]
      },
      {
        issue_number: 'PX-2024-009',
        project_id: projectIds['Chung cư Green Tower'],
        issue_date: '2024-07-15',
        purpose: 'Xuất vật tư cho thi công tầng 6-10',
        approved_by: 'Nguyễn Văn Giám Đốc',
        items: [
          { material_code: 'XM-PC40', quantity: 120 },
          { material_code: 'THEP-D12', quantity: 2500 },
          { material_code: 'GACH-ON', quantity: 6000 }
        ]
      },
      {
        issue_number: 'PX-2024-010',
        project_id: projectIds['Khu đô thị mới Sunrise'],
        issue_date: '2024-07-25',
        purpose: 'Xuất vật tư cho lắp đặt hệ thống nước',
        approved_by: 'Lê Thị Trưởng Ban',
        items: [
          { material_code: 'ONG-NUOC-21', quantity: 1500 },
          { material_code: 'ONG-NUOC-27', quantity: 1000 }
        ]
      },
      {
        issue_number: 'PX-2024-011',
        project_id: projectIds['Bệnh viện đa khoa Quốc tế'],
        issue_date: '2024-08-05',
        purpose: 'Xuất vật tư cho lắp đặt điện',
        approved_by: 'Phạm Văn Giám Đốc',
        items: [
          { material_code: 'DAY-DIEN-2.5', quantity: 1500 },
          { material_code: 'DAY-DIEN-4', quantity: 1000 }
        ]
      },
      {
        issue_number: 'PX-2024-012',
        project_id: projectIds['Khách sạn 5 sao Luxury'],
        issue_date: '2024-08-15',
        purpose: 'Xuất vật tư cho hoàn thiện sảnh',
        approved_by: 'Hoàng Văn Tổng Giám Đốc',
        items: [
          { material_code: 'SON-TRONG', quantity: 35 },
          { material_code: 'GO-PLYWOOD', quantity: 25 },
          { material_code: 'GACH-OP', quantity: 200 }
        ]
      }
    ];

    for (const issue of issues) {
      const issueResult = await client.query(
        `INSERT INTO issues (issue_number, project_id, issue_date, purpose, approved_by, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [issue.issue_number, issue.project_id, issue.issue_date, issue.purpose, issue.approved_by, 'admin']
      );
      const issueId = issueResult.rows[0].id;

      for (const item of issue.items) {
        await client.query(
          `INSERT INTO issue_items (issue_id, material_id, quantity, notes)
           VALUES ($1, $2, $3, $4)`,
          [issueId, materialIds[item.material_code], item.quantity, '']
        );

        // Cập nhật tồn kho (trừ đi số lượng đã xuất)
        await client.query(
          `UPDATE inventory SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
           WHERE material_id = $2 AND project_id = $3`,
          [item.quantity, materialIds[item.material_code], issue.project_id]
        );
      }
    }
    console.log(`✓ Đã thêm ${issues.length} phiếu xuất`);

    await client.query('COMMIT');
    console.log('\n✅ Hoàn thành! Đã thêm tất cả dữ liệu mẫu vào database.');
    console.log('\n📊 Tổng kết dữ liệu đã thêm:');
    console.log(`   - ${projects.length} công trình`);
    console.log(`   - ${suppliers.length} nhà cung cấp`);
    console.log(`   - ${materials.length} vật tư`);
    console.log(`   - ${inventoryData.length} bản ghi tồn kho (bao gồm vật tư sắp hết)`);
    console.log(`   - ${receipts.length} phiếu nhập với chi tiết`);
    console.log(`   - ${issues.length} phiếu xuất với chi tiết`);
    console.log('\n💡 Dashboard sẽ hiển thị:');
    console.log('   - Số lượng công trình, vật tư, nhà cung cấp');
    console.log('   - Cảnh báo vật tư sắp hết (tồn kho <= tồn tối thiểu)');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi thêm dữ liệu:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
