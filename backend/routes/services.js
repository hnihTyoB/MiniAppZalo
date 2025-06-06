const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


// Định nghĩa các khoảng giờ cố định
const TIME_SLOTS = [
  { start: '07:00:00', end: '09:00:00', display: '07:00-09:00' },
  { start: '08:00:00', end: '10:00:00', display: '08:00-10:00' },
  { start: '10:00:00', end: '12:00:00', display: '10:00-12:00' },
  { start: '12:00:00', end: '14:00:00', display: '12:00-14:00' },
  { start: '14:00:00', end: '16:00:00', display: '14:00-16:00' },
  { start: '16:00:00', end: '18:00:00', display: '16:00-18:00' },
  { start: '18:00:00', end: '20:00:00', display: '18:00-20:00' },
  { start: '19:00:00', end: '21:00:00', display: '19:00-21:00' },
];

// Hàm tìm display time slot dựa trên start time
const getTimeSlotDisplay = (startTime) => {
  const slot = TIME_SLOTS.find((slot) => slot.start === startTime);
  return slot ? slot.display : startTime; // Nếu không tìm thấy, trả về thời gian gốc
};

// API lấy khung giờ khả dụng
router.get('/available-times', authenticateToken, async (req, res) => {
  try {
    const { branch_id, appointment_date } = req.query;

    console.log(`Received request for /available-times: branch_id=${branch_id}, appointment_date=${appointment_date}`);

    if (!branch_id || !appointment_date) {
      console.log('Missing required parameters');
      return res.status(400).json({ message: 'Vui lòng cung cấp branch_id và appointment_date' });
    }

    // Kiểm tra định dạng ngày (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appointment_date)) {
      return res.status(400).json({ message: 'Định dạng ngày không hợp lệ, vui lòng dùng YYYY-MM-DD' });
    }

    // Tạo selectedDate với múi giờ cố định +07:00
    const selectedDate = new Date(`${appointment_date}T00:00:00+07:00`);

    // Tạo today với múi giờ +07:00
    const today = new Date();
    const todayInLocal = new Date(today.getTime() + 7 * 60 * 60 * 1000); // Điều chỉnh múi giờ +07
    todayInLocal.setHours(0, 0, 0, 0); // Đặt về đầu ngày

    // So sánh chỉ phần ngày
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly.getTime() < todayInLocal.getTime()) {
      console.log(`Selected date is in the past: ${appointment_date}`);
      return res.status(400).json({ message: 'Không thể chọn ngày trong quá khứ' });
    }

    const dayOfWeek = selectedDate.getDay();

    const [schedules] = await pool.query(
      'SELECT start_time, end_time FROM branch_schedules WHERE branch_id = ? AND day_of_week = ?',
      [branch_id, dayOfWeek]
    );

    console.log(`Schedules for branch_id=${branch_id}, dayOfWeek=${dayOfWeek}:`, schedules);

    if (schedules.length === 0) {
      console.log(`No schedules found for branch_id=${branch_id}, dayOfWeek=${dayOfWeek}`);
      return res.status(200).json([]);
    }

    const { start_time, end_time } = schedules[0];

    const [bookedAppointments] = await pool.query(
      'SELECT appointment_time FROM appointments WHERE branch_id = ? AND appointment_date = ?',
      [branch_id, appointment_date]
    );
    const bookedTimes = bookedAppointments.map((appt) => appt.appointment_time);
    console.log(`Booked times for branch_id=${branch_id}, date=${appointment_date}:`, bookedTimes);

    const isToday = selectedDateOnly.getTime() === todayInLocal.getTime();
    const currentTime = new Date(); // Thời gian hiện tại (ví dụ: 14:01 PM +07)
    currentTime.setUTCHours(currentTime.getUTCHours() + 7); // Đảm bảo múi giờ +07

    const availableTimes = TIME_SLOTS.filter((slot) => {
      if (slot.start < start_time || slot.end > end_time) {
        return false;
      }

      const [slotStartHours, slotStartMinutes] = slot.start.split(':').map(Number);
      const slotStartTime = new Date(selectedDate);
      slotStartTime.setHours(slotStartHours, slotStartMinutes, 0, 0);

      const [slotEndHours, slotEndMinutes] = slot.end.split(':').map(Number);
      const slotEndTime = new Date(selectedDate);
      slotEndTime.setHours(slotEndHours, slotEndMinutes, 0, 0);

      // Kiểm tra trùng lặp với thời gian đã đặt
      for (const bookedTime of bookedTimes) {
        const [bookedHours, bookedMinutes] = bookedTime.split(':').map(Number);
        const booked = new Date(selectedDate);
        booked.setHours(bookedHours, bookedMinutes, 0, 0);
        if (booked >= slotStartTime && booked < slotEndTime) {
          return false;
        }
      }

      // Nếu là hôm nay, chỉ loại bỏ slot nếu thời gian bắt đầu đã qua
      if (isToday) {
        const slotStart = new Date(selectedDate);
        const [currentHours, currentMinutes] = [
          currentTime.getHours(),
          currentTime.getMinutes()
        ];
        slotStart.setHours(slotStartHours, slotStartMinutes, 0, 0);
        if (slotStart < currentTime) {
          console.log(`Slot ${slot.display} bị loại do đã qua thời gian hiện tại: ${currentTime}`);
          return false;
        }
      }

      return true;
    }).map((slot) => slot.display);

    console.log(`Available times for branch_id=${branch_id}, date=${appointment_date}:`, availableTimes);
    res.status(200).json(availableTimes);
  } catch (error) {
    console.error('Error fetching available times:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy khung giờ khả dụng' });
  }
});

router.get('/services', authenticateToken, async (req, res) => {
  try {
    const [services] = await pool.query('SELECT id, name, description, cost, image_url, created_at FROM services');
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách dịch vụ', error: error.message });
  }
});

router.get('/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [services] = await pool.query('SELECT id, name, description, cost, image_url, created_at FROM services WHERE id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }
    res.status(200).json(services[0]);
  } catch (error) {
    console.error('Error fetching service by ID:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy chi tiết dịch vụ', error: error.message });
  }
});

router.get('/branches', authenticateToken, async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT id, name, address, phone_number, description, image_url FROM branches');
    res.status(200).json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách chi nhánh', error: error.message });
  }
});

router.get('/branches/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [branches] = await pool.query('SELECT id, name, address, phone_number, description, image_url FROM branches WHERE id = ?', [id]);
    if (branches.length === 0) {
      return res.status(404).json({ message: 'Chi nhánh không tồn tại' });
    }
    res.status(200).json(branches[0]);
  } catch (error) {
    console.error('Error fetching branch by ID:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy chi tiết chi nhánh', error: error.message });
  }
});

router.put('/branches/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone_number, description, image_url } = req.body;
    const user = req.user;

    if (user.role !== 'branch_manager' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin hoặc branch_manager mới có quyền cập nhật chi nhánh' });
    }

    if (!name || !address || !phone_number) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, địa chỉ và số điện thoại chi nhánh' });
    }

    const [branches] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
    if (branches.length === 0) {
      return res.status(404).json({ message: 'Chi nhánh không tồn tại' });
    }

    if (user.role === 'branch_manager') {
      const [userBranches] = await pool.query('SELECT branch_id FROM users WHERE id = ? AND role = "branch_manager"', [user.userId]);
      if (userBranches.length === 0 || userBranches[0].branch_id != id) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật chi nhánh này' });
      }
    }

    await pool.query(
      'UPDATE branches SET name = ?, address = ?, phone_number = ?, description = ?, image_url = ? WHERE id = ?',
      [name, address, phone_number, description || null, image_url || null, id]
    );

    res.status(200).json({ message: 'Cập nhật chi nhánh thành công' });
  } catch (error) {
    console.error('Error updating branch:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật chi nhánh', error: error.message });
  }
});

router.put('/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technician_id } = req.body;
    const user = req.user;

    if (user.role !== 'admin' && user.role !== 'branch_manager') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật lịch hẹn' });
    }

    const [appointment] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (appointment.length === 0) {
      return res.status(404).json({ message: 'Lịch hẹn không tồn tại' });
    }

    if (user.role === 'branch_manager') {
      const [branch] = await pool.query('SELECT branch_id FROM users WHERE id = ?', [user.userId]);
      if (branch[0].branch_id !== appointment[0].branch_id) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật lịch hẹn này' });
      }
    }

    if (technician_id) {
      const [technician] = await pool.query('SELECT * FROM employees WHERE id = ? AND role = "technician" AND branch_id = ?', [technician_id, appointment[0].branch_id]);
      if (technician.length === 0) {
        return res.status(400).json({ message: 'Kỹ thuật viên không tồn tại hoặc không thuộc chi nhánh này' });
      }
    }

    await pool.query(
      'UPDATE appointments SET status = ?, technician_id = ? WHERE id = ?',
      [status || appointment[0].status, technician_id || null, id]
    );

    if (status === 'completed') {
      const [totalCost] = await pool.query(
        'SELECT SUM(s.cost) as total FROM appointment_services aps JOIN services s ON aps.service_id = s.id WHERE aps.appointment_id = ?',
        [id]
      );
    }

    res.status(200).json({ message: 'Cập nhật lịch hẹn thành công' });
  } catch (error) {
    console.error('Error updating appointment:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật lịch hẹn', error: error.message });
  }
});

router.post('/appointments', authenticateToken, async (req, res) => {
  try {
    const { service_ids, branch_id, vehicle_id, appointment_date, appointment_time, notes, technician_id } = req.body;
    const user_id = req.user.userId;

    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !branch_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin lịch hẹn, bao gồm ít nhất một dịch vụ' });
    }

    const numericServiceIds = service_ids.map(id => parseInt(id, 10));

    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 7);
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}+07:00`);
    if (appointmentDateTime < now) {
      return res.status(400).json({ message: 'Không thể đặt lịch vào thời gian trong quá khứ' });
    }

    const [services] = await pool.query('SELECT id FROM services WHERE id IN (?)', [numericServiceIds]);
    const validServiceIds = services.map(s => s.id);
    const invalidServiceIds = numericServiceIds.filter(id => !validServiceIds.includes(id));
    if (invalidServiceIds.length > 0) {
      return res.status(400).json({ message: `Dịch vụ không tồn tại: ${invalidServiceIds.join(', ')}` });
    }

    const [branch] = await pool.query('SELECT * FROM branches WHERE id = ?', [branch_id]);
    if (branch.length === 0) {
      return res.status(400).json({ message: 'Chi nhánh không tồn tại' });
    }

    if (vehicle_id) {
      const [vehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ? AND user_id = ?', [vehicle_id, user_id]);
      if (vehicle.length === 0) {
        return res.status(400).json({ message: 'Xe không tồn tại hoặc không thuộc về bạn' });
      }
    }

    if (technician_id) {
      const [technician] = await pool.query('SELECT * FROM employees WHERE id = ? AND role = "technician" AND branch_id = ?', [technician_id, branch_id]);
      if (technician.length === 0) {
        return res.status(400).json({ message: 'Kỹ thuật viên không tồn tại hoặc không thuộc chi nhánh này' });
      }
    }

    const [existingAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE branch_id = ? AND appointment_date = ? AND appointment_time = ?',
      [branch_id, appointment_date, appointment_time]
    );
    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: 'Đã có lịch hẹn khác tại chi nhánh này vào thời gian bạn chọn' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        'INSERT INTO appointments (user_id, branch_id, vehicle_id, appointment_date, appointment_time, notes, status, technician_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, branch_id, vehicle_id || null, appointment_date, appointment_time, notes || null, 'pending', technician_id || null]
      );

      const appointmentId = result.insertId;

      const serviceValues = numericServiceIds.map(service_id => [appointmentId, service_id]);
      await connection.query(
        'INSERT INTO appointment_services (appointment_id, service_id) VALUES ?',
        [serviceValues]
      );

      await connection.commit();

      res.status(201).json({ message: 'Tạo lịch hẹn thành công', appointmentId: appointmentId.toString() });
    } catch (error) {
      await connection.rollback();
      console.error('SQL Error:', error.sqlMessage || error.message);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo lịch hẹn', error: error.message });
  }
});

router.get('/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const [appointments] = await pool.query(
      'SELECT a.*, b.name AS branch_name, b.address AS branch_address, v.make AS vehicle_make, v.model AS vehicle_model, v.license_plate AS vehicle_license_plate, e.full_name AS technician_name ' +
      'FROM appointments a ' +
      'LEFT JOIN branches b ON a.branch_id = b.id ' +
      'LEFT JOIN vehicles v ON a.vehicle_id = v.id ' +
      'LEFT JOIN employees e ON a.technician_id = e.id ' +
      'WHERE a.id = ? AND (a.user_id = ? OR ? = "admin")',
      [id, user_id, req.user.role]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Lịch hẹn không tồn tại hoặc bạn không có quyền truy cập' });
    }

    const appointment = appointments[0];

    // Xử lý appointment_date để đảm bảo không bị lệch múi giờ
    if (appointment.appointment_date) {
      let dateString;
      if (appointment.appointment_date instanceof Date) {
        const dateWithTimezone = new Date(appointment.appointment_date.getTime() + 7 * 60 * 60 * 1000);
        dateString = dateWithTimezone.toISOString().split('T')[0];
      } else {
        dateString = appointment.appointment_date.toString().split(' ')[0];
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.error('Invalid date format from MySQL:', dateString);
        return res.status(500).json({ message: 'Dữ liệu ngày không hợp lệ từ cơ sở dữ liệu' });
      }
      appointment.appointment_date = dateString;
    }

    appointment.time_slot_display = getTimeSlotDisplay(appointment.appointment_time);

    const [services] = await pool.query(
      'SELECT s.* FROM services s ' +
      'JOIN appointment_services aps ON s.id = aps.service_id ' +
      'WHERE aps.appointment_id = ?',
      [id]
    );

    appointment.services = Array.isArray(services) ? services : [];
    appointment.id = appointment.id.toString();
    appointment.technician_id = appointment.technician_id?.toString() || null;

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment by ID:', error.message, error.stack);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy chi tiết lịch hẹn', error: error.message });
  }
});

router.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const { branchId, status } = req.query;
    let query = 'SELECT a.*, u.full_name AS customer_name, b.name AS branch_name, b.address AS branch_address, v.make AS vehicle_make, v.model AS vehicle_model, v.license_plate AS vehicle_license_plate, e.full_name AS technician_name ' +
                'FROM appointments a ' +
                'LEFT JOIN users u ON a.user_id = u.id ' +
                'LEFT JOIN branches b ON a.branch_id = b.id ' +
                'LEFT JOIN vehicles v ON a.vehicle_id = v.id ' +
                'LEFT JOIN employees e ON a.technician_id = e.id ';
    let params = [];

    if (req.user.role === 'admin') {
      if (branchId || status) {
        query += 'WHERE ';
        if (branchId) {
          query += 'a.branch_id = ? ';
          params.push(branchId);
        }
        if (status && status !== 'all') {
          query += (branchId ? 'AND ' : '') + 'a.status = ? ';
          params.push(status);
        }
      }
    } else {
      query += 'WHERE a.user_id = ? ';
      params.push(req.user.userId);
      if (branchId || status) {
        if (branchId) {
          query += 'AND a.branch_id = ? ';
          params.push(branchId);
        }
        if (status && status !== 'all') {
          query += 'AND a.status = ? ';
          params.push(status);
        }
      }
    }

    const [appointments] = await pool.query(query, params);

    for (const appointment of appointments) {
      appointment.appointment_date = appointment.appointment_date instanceof Date
        ? appointment.appointment_date.toISOString().split('T')[0]
        : appointment.appointment_date;
      appointment.time_slot_display = getTimeSlotDisplay(appointment.appointment_time);

      const [services] = await pool.query(
        'SELECT s.* FROM services s JOIN appointment_services aps ON s.id = aps.service_id WHERE aps.appointment_id = ?',
        [appointment.id]
      );
      appointment.services = services;
      appointment.id = appointment.id.toString();
      appointment.technician_id = appointment.technician_id?.toString() || null;
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách lịch hẹn', error: error.message });
  }
});

router.delete('/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const role = req.user.role;

    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Lịch hẹn không tồn tại' });
    }

    const appointment = appointments[0];

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Không thể hủy lịch hẹn đã hoàn thành' });
    }

    if (role !== 'admin') {
      if (appointment.user_id !== user_id) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa lịch hẹn này' });
      }
      if (appointment.status !== 'pending') {
        return res.status(403).json({ message: 'Chỉ có thể xóa lịch hẹn chưa được xác nhận (pending)' });
      }
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        'DELETE FROM appointment_services WHERE appointment_id = ?',
        [id]
      );

      await connection.query(
        'DELETE FROM appointments WHERE id = ?',
        [id]
      );

      await connection.commit();

      res.status(200).json({ message: 'Hủy lịch hẹn thành công' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting appointment:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi hủy lịch hẹn', error: error.message });
  }
});

router.get('/appointments/history', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = 'SELECT a.*, b.name AS branch_name, b.address AS branch_address, b.image_url AS branch_image_url, v.make AS vehicle_make, v.model AS vehicle_model, v.license_plate AS vehicle_license_plate ' +
              'FROM appointments a ' +
              'LEFT JOIN branches b ON a.branch_id = b.id ' +
              'LEFT JOIN vehicles v ON a.vehicle_id = v.id ' +
              'WHERE a.status = ? ' +
              'ORDER BY a.appointment_date DESC, a.appointment_time DESC';
      params = ['completed'];
    } else {
      query = 'SELECT a.*, b.name AS branch_name, b.address AS branch_address, b.image_url AS branch_image_url, v.make AS vehicle_make, v.model AS vehicle_model, v.license_plate AS vehicle_license_plate ' +
              'FROM appointments a ' +
              'LEFT JOIN branches b ON a.branch_id = b.id ' +
              'LEFT JOIN vehicles v ON a.vehicle_id = v.id ' +
              'WHERE a.user_id = ? AND a.status = ? ' +
              'ORDER BY a.appointment_date DESC, a.appointment_time DESC';
      params = [user_id, 'completed'];
    }

    const [appointments] = await pool.query(query, params);

    for (const appointment of appointments) {
      if (appointment.appointment_date) {
        let dateString = appointment.appointment_date instanceof Date
          ? appointment.appointment_date.toISOString().split('T')[0]
          : appointment.appointment_date;
        appointment.appointment_date = `${dateString}T00:00:00.000Z`;
      }

      appointment.time_slot_display = getTimeSlotDisplay(appointment.appointment_time);

      const [services] = await pool.query(
        'SELECT s.* FROM services s ' +
        'JOIN appointment_services aps ON s.id = aps.service_id ' +
        'WHERE aps.appointment_id = ?',
        [appointment.id]
      );
      appointment.services = services;
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointment history:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy lịch sử lịch hẹn', error: error.message });
  }
});

router.get('/vehicles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT v.*, vt.name AS type_name,
          COALESCE(v.make, m.name) AS make_name,
          COALESCE(v.model, mo.name) AS model_name
        FROM vehicles v
        JOIN vehicle_types vt ON v.type_id = vt.id
        LEFT JOIN makes m ON v.make_id = m.id
        LEFT JOIN models mo ON v.model_id = mo.id
      `;
      params = [];
    } else {
      query = `
        SELECT v.*, vt.name AS type_name,
          COALESCE(v.make, m.name) AS make_name,
          COALESCE(v.model, mo.name) AS model_name
        FROM vehicles v
        JOIN vehicle_types vt ON v.type_id = vt.id
        LEFT JOIN makes m ON v.make_id = m.id
        LEFT JOIN models mo ON v.model_id = mo.id
        WHERE v.user_id = ?
      `;
      params = [userId];
    }

    const [vehicles] = await pool.query(query, params);
    const formattedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      id: vehicle.id.toString(),
    }));
    res.status(200).json(formattedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách xe', error: error.message });
  }
});

router.get('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const vehicleId = req.params.id;

    const [vehicles] = await pool.query(
      `SELECT v.*, vt.name AS type_name,
        COALESCE(v.make, m.name) AS make_name,
        COALESCE(v.model, mo.name) AS model_name
      FROM vehicles v
      JOIN vehicle_types vt ON v.type_id = vt.id
      LEFT JOIN makes m ON v.make_id = m.id
      LEFT JOIN models mo ON v.model_id = mo.id
      WHERE v.id = ? AND (v.user_id = ? OR ? = "admin")`,
      [vehicleId, userId, req.user.role]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe hoặc bạn không có quyền truy cập' });
    }

    const vehicle = vehicles[0];
    vehicle.id = vehicle.id.toString();
    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin xe', error: error.message });
  }
});

router.post('/vehicles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type_id, make_id, model_id, make, model, license_plate, year, vin, notes } = req.body;

    if (!type_id || !license_plate) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Loại xe và Biển số' });
    }

    const [existingVehicle] = await pool.query(
      'SELECT * FROM vehicles WHERE license_plate = ? AND user_id = ?',
      [license_plate, userId]
    );
    if (existingVehicle.length > 0) {
      return res.status(400).json({ message: 'Biển số xe đã tồn tại' });
    }

    const [result] = await pool.query(
      'INSERT INTO vehicles (user_id, type_id, make_id, model_id, make, model, license_plate, year, vin, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, type_id, make_id || null, model_id || null, make || null, model || null, license_plate, year || null, vin || null, notes || null]
    );

    res.status(201).json({ message: 'Thêm xe thành công', vehicleId: result.insertId.toString() });
  } catch (error) {
    console.error('Error adding vehicle:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi thêm xe', error: error.message });
  }
});

router.put('/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const vehicleId = req.params.id;
    const { type_id, make_id, model_id, make, model, license_plate, year, vin, notes } = req.body;

    if (!type_id || !license_plate) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Loại xe và Biển số' });
    }

    const [vehicle] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [vehicleId, userId, req.user.role]
    );
    if (vehicle.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe hoặc bạn không có quyền truy cập' });
    }

    const [existingVehicle] = await pool.query(
      'SELECT * FROM vehicles WHERE license_plate = ? AND user_id = ? AND id != ?',
      [license_plate, userId, vehicleId]
    );
    if (existingVehicle.length > 0) {
      return res.status(400).json({ message: 'Biển số xe đã tồn tại' });
    }

    await pool.query(
      'UPDATE vehicles SET type_id = ?, make_id = ?, model_id = ?, make = ?, model = ?, license_plate = ?, year = ?, vin = ?, notes = ?, updated_at = NOW() WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [type_id, make_id || null, model_id || null, make || null, model || null, license_plate, year || null, vin || null, notes || null, vehicleId, userId, req.user.role]
    );

    res.status(200).json({ message: 'Cập nhật xe thành công' });
  } catch (error) {
    console.error('Error updating vehicle:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật thông tin xe', error: error.message });
  }
});

router.delete('/vehicles/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const [vehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    if (vehicle.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }

    await pool.query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

    res.status(200).json({ message: 'Xóa xe thành công' });
  } catch (error) {
    console.error('Error deleting vehicle:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xóa xe', error: error.message });
  }
});

router.get('/vehicle-types', authenticateToken, async (req, res) => {
  try {
    const [vehicleTypes] = await pool.query('SELECT * FROM vehicle_types');
    res.status(200).json(vehicleTypes);
  } catch (error) {
    console.error('Error fetching vehicle types:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách loại xe', error: error.message });
  }
});

router.get('/makes', authenticateToken, async (req, res) => {
  try {
    const [makes] = await pool.query('SELECT * FROM makes');
    res.status(200).json(makes);
  } catch (error) {
    console.error('Error fetching makes:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách hãng xe', error: error.message });
  }
});

router.get('/models/:make_id', authenticateToken, async (req, res) => {
  try {
    const { make_id } = req.params;
    const { vehicle_type_id } = req.query;

    if (!vehicle_type_id) {
      return res.status(400).json({ message: 'Vui lòng cung cấp vehicle_type_id' });
    }

    const [models] = await pool.query(
      'SELECT m.* FROM models m ' +
      'JOIN makes mk ON m.make_id = mk.id ' +
      'WHERE m.make_id = ? AND mk.vehicle_type_id = ?',
      [make_id, vehicle_type_id]
    );

    res.status(200).json(models);
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách dòng xe', error: error.message });
  }
});

router.get('/promotions', authenticateToken, async (req, res) => {
  try {
    const [promotions] = await pool.query('SELECT * FROM promotions');
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách khuyến mãi', error: error.message });
  }
});

router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const [users] = await pool.query(
      'SELECT full_name AS name, dob, phone_number AS phone, address, gender FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin người dùng', error: error.message });
  }
});

router.put('/users/me', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { name, dob, address, gender } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Họ và tên là bắt buộc' });
    }

    await pool.query(
      'UPDATE users SET full_name = ?, dob = ?, address = ?, gender = ? WHERE id = ?',
      [name, dob || null, address || null, gender || null, user_id]
    );

    res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công' });
  } catch (error) {
    console.error('Error updating user info:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật thông tin người dùng', error: error.message });
  }
});

router.get('/faqs', authenticateToken, async (req, res) => {
  try {
    const [faqs] = await pool.query('SELECT id, question, answer FROM faqs');
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách FAQ', error: error.message });
  }
});

router.post('/services', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, cost, image_url } = req.body;

    if (!name || !description || !cost) {
      return res.status(400).json({ message: 'Tên, mô tả và giá dịch vụ là bắt buộc' });
    }

    const [result] = await pool.query(
      'INSERT INTO services (name, description, cost, image_url, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, description, cost, image_url || null]
    );

    res.status(201).json({ message: 'Tạo dịch vụ thành công', serviceId: result.insertId.toString() });
  } catch (error) {
    console.error('Error creating service:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo dịch vụ', error: error.message });
  }
});

router.put('/services/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, cost, image_url } = req.body;

    if (!name || !description || !cost) {
      return res.status(400).json({ message: 'Tên, mô tả và giá dịch vụ là bắt buộc' });
    }

    const [services] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    await pool.query(
      'UPDATE services SET name = ?, description = ?, cost = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
      [name, description, cost, image_url || null, id]
    );

    res.status(200).json({ message: 'Cập nhật dịch vụ thành công' });
  } catch (error) {
    console.error('Error updating service:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật dịch vụ', error: error.message });
  }
});

router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { dateFrom, dateTo, branchId } = req.query;
    const user = req.user;
    let stats = { totalUsers: 0, pendingBookings: 0, monthlyRevenue: "0đ" };
    let dateCondition = '';
    let params = [];

    // Kiểm tra định dạng ngày nếu có dateFrom và dateTo
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateFrom && dateTo) {
      if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
        return res.status(400).json({ message: 'Định dạng ngày không hợp lệ, vui lòng dùng YYYY-MM-DD' });
      }
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      if (startDate > endDate) {
        return res.status(400).json({ message: 'Ngày bắt đầu không thể lớn hơn ngày kết thúc' });
      }
      dateCondition = 'AND a.appointment_date BETWEEN ? AND ?';
      params.push(dateFrom, dateTo);
    } else {
      dateCondition = 'AND MONTH(a.appointment_date) = MONTH(CURRENT_DATE) AND YEAR(a.appointment_date) = YEAR(CURRENT_DATE)';
    }

    if (user.role === "admin") {
      const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
      const [serviceCount] = await pool.query('SELECT COUNT(*) as count FROM services');
      const [pendingCount] = await pool.query(
        'SELECT COUNT(*) as count FROM appointments a WHERE a.status = "pending" ' + dateCondition,
        params
      );
      const [revenue] = await pool.query(
        'SELECT COALESCE(SUM(s.cost), 0) as total FROM appointment_services aps ' +
        'JOIN services s ON aps.service_id = s.id ' +
        'JOIN appointments a ON aps.appointment_id = a.id ' +
        'WHERE a.status = "completed" ' + dateCondition,
        params
      );
      stats.totalUsers = userCount[0].count || 0;
      stats.totalServices = serviceCount[0].count || 0;
      stats.pendingBookings = pendingCount[0].count || 0;
      stats.monthlyRevenue = revenue[0].total ? `${revenue[0].total.toLocaleString()}đ` : "0đ";
    } else if (user.role === "branch_manager") {
      if (!branchId) return res.status(400).json({ message: 'Vui lòng cung cấp branchId' });
      const [pendingCount] = await pool.query(
        'SELECT COUNT(*) as count FROM appointments a WHERE a.branch_id = ? AND a.status = "pending" ' + dateCondition,
        [branchId, ...params]
      );
      const [revenue] = await pool.query(
        'SELECT COALESCE(SUM(s.cost), 0) as total FROM appointment_services aps ' +
        'JOIN services s ON aps.service_id = s.id ' +
        'JOIN appointments a ON aps.appointment_id = a.id ' +
        'WHERE a.branch_id = ? AND a.status = "completed" ' + dateCondition,
        [branchId, ...params]
      );
      stats.pendingBookings = pendingCount[0].count || 0;
      stats.monthlyRevenue = revenue[0].total ? `${revenue[0].total.toLocaleString()}đ` : "0đ";
    }
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.message, error.stack);
    if (error.sqlMessage) {
      console.error('SQL Error:', error.sqlMessage);
    }
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy dữ liệu thống kê', error: error.message });
  }
});

router.get('/reports/revenue', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Chỉ branch_manager mới có quyền truy cập' });
    }

    const branchId = req.query.branchId;
    if (!branchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp branchId' });
    }

    const [revenueData] = await pool.query(
      'SELECT MONTHNAME(a.appointment_date) as month, SUM(s.cost) as revenue FROM appointment_services aps JOIN services s ON aps.service_id = s.id JOIN appointments a ON aps.appointment_id = a.id WHERE a.branch_id = ? AND a.status = "completed" AND YEAR(a.appointment_date) = YEAR(NOW()) GROUP BY MONTH(a.appointment_date) ORDER BY MONTH(a.appointment_date)',
      [branchId]
    );

    res.status(200).json(revenueData.map((item) => ({
      month: item.month.slice(0, 3),
      revenue: item.revenue || 0,
    })));
  } catch (error) {
    console.error('Error fetching revenue data:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy dữ liệu doanh thu', error: error.message });
  }
});

router.get('/reports/popular-services', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Chỉ branch_manager mới có quyền truy cập' });
    }

    const branchId = req.query.branchId;
    if (!branchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp branchId' });
    }

    const [popularServices] = await pool.query(
      'SELECT s.name, COUNT(aps.service_id) as count, SUM(s.cost) as total_cost FROM appointment_services aps JOIN services s ON aps.service_id = s.id JOIN appointments a ON aps.appointment_id = a.id WHERE a.branch_id = ? AND a.status = "completed" AND MONTH(a.appointment_date) = MONTH(NOW()) AND YEAR(a.appointment_date) = YEAR(NOW()) GROUP BY s.id, s.name ORDER BY count DESC LIMIT 5',
      [branchId]
    );

    res.status(200).json(popularServices);
  } catch (error) {
    console.error('Error fetching popular services:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy dữ liệu dịch vụ phổ biến', error: error.message });
  }
});

router.get('/reports/export', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const format = req.query.format || "excel";
    const branchId = req.query.branchId;

    let query = 'SELECT a.id, a.appointment_date, a.appointment_time, a.status, s.name as service_name, s.price, u.full_name as customer_name FROM appointments a JOIN appointment_services aps ON a.id = aps.appointment_id JOIN services s ON aps.service_id = s.id JOIN users u ON a.user_id = u.id';
    let params = [];

    if (user.role === "branch_manager") {
      if (!branchId) {
        return res.status(400).json({ message: 'Vui lòng cung cấp branchId' });
      }
      query += ' WHERE a.branch_id = ?';
      params.push(branchId);
    }

    const [reportData] = await pool.query(query, params);

    // Giả lập tạo file (cần cài đặt thư viện exceljs)
    const buffer = Buffer.from(JSON.stringify(reportData), "utf-8");
    res.setHeader('Content-Disposition', `attachment; filename=bao_cao_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "csv"}`);
    res.setHeader('Content-Type', format === "excel" ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error exporting report:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xuất báo cáo', error: error.message });
  }
});

router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    const [users] = await pool.query('SELECT id, full_name AS name, phone_number AS phone, role FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const targetUser = users[0];
    if (user.role === "branch_manager" && targetUser.branchId !== user.branchId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập người dùng này' });
    }

    res.status(200).json(targetUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin người dùng', error: error.message });
  }
});

router.post('/users', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, role} = req.body;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền tạo người dùng' });
    }

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, số điện thoại và vai trò' });
    }

    const allowedRoles = ["technician", "receptionist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    let finalBranchId = branchId;
    if (user.role === "branch_manager") {
      if (!user.branchId) {
        return res.status(400).json({ message: 'Không xác định được chi nhánh của bạn' });
      }
      finalBranchId = user.branchId;
    }

    if (!finalBranchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chi nhánh' });
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (full_name, phone_number, role, branch_id, password) VALUES (?, ?, ?, ?, ?)',
      [name, phone, role, finalBranchId, "default_password"] // Cần cơ chế tạo mật khẩu thực tế
    );

    res.status(201).json({ message: 'Tạo người dùng thành công', userId: result.insertId.toString() });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo người dùng', error: error.message });
  }
});

router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, phone, role} = req.body;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật người dùng' });
    }

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, số điện thoại và vai trò' });
    }

    const allowedRoles = ["technician", "receptionist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const [targetUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (targetUser.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role === "branch_manager" && targetUser[0].branch_id !== user.branchId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật người dùng này' });
    }

    let finalBranchId = branchId;
    if (user.role === "branch_manager") {
      finalBranchId = user.branchId;
    }

    if (!finalBranchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chi nhánh' });
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE phone_number = ? AND id != ?', [phone, id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    await pool.query(
      'UPDATE users SET full_name = ?, phone_number = ?, role = ?, branch_id = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, role, finalBranchId, id]
    );

    res.status(200).json({ message: 'Cập nhật người dùng thành công' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật người dùng', error: error.message });
  }
});

router.delete('/services/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [services] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    res.status(200).json({ message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    console.error('Error deleting service:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xóa dịch vụ', error: error.message });
  }
});

router.post('/employees', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, role, branchId } = req.body;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền tạo nhân viên' });
    }

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, số điện thoại và vai trò' });
    }

    const allowedRoles = ["admin", "branch_manager", "customer", "technician", "receptionist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    let finalBranchId = branchId;
    if (user.role === "branch_manager") {
      if (!user.branchId) {
        return res.status(400).json({ message: 'Không xác định được chi nhánh của bạn' });
      }
      finalBranchId = user.branchId;
    } else if (role === "admin") {
      finalBranchId = null; // Admin không thuộc chi nhánh cụ thể
    }

    if (role !== "admin" && !finalBranchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chi nhánh' });
    }

    const [existingEmployee] = await pool.query('SELECT * FROM employees WHERE phone_number = ?', [phone]);
    if (existingEmployee.length > 0) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    const [result] = await pool.query(
      'INSERT INTO employees (full_name, phone_number, role, branch_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, phone, role, finalBranchId]
    );

    res.status(201).json({ message: 'Tạo nhân viên thành công', employeeId: result.insertId.toString() });
  } catch (error) {
    console.error('Error creating employee:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo nhân viên', error: error.message });
  }
});

router.put('/employees/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { name, phone, role, branchId } = req.body;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật nhân viên' });
    }

    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên, số điện thoại và vai trò' });
    }

    const allowedRoles = ["admin", "branch_manager", "customer", "technician", "receptionist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const [targetEmployee] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (targetEmployee.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    if (user.role === "branch_manager" && targetEmployee[0].branch_id !== user.branchId) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật nhân viên này' });
    }

    let finalBranchId = branchId;
    if (user.role === "branch_manager") {
      finalBranchId = user.branchId;
    } else if (role === "admin") {
      finalBranchId = null; // Admin không thuộc chi nhánh
    }

    if (role !== "admin" && !finalBranchId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp chi nhánh' });
    }

    const [existingEmployee] = await pool.query('SELECT * FROM employees WHERE phone_number = ? AND id != ?', [phone, id]);
    if (existingEmployee.length > 0) {
      return res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
    }

    await pool.query(
      'UPDATE employees SET full_name = ?, phone_number = ?, role = ?, branch_id = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, role, finalBranchId, id]
    );

    res.status(200).json({ message: 'Cập nhật nhân viên thành công' });
  } catch (error) {
    console.error('Error updating employee:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật nhân viên', error: error.message });
  }
});

router.get('/employees/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user.role !== "admin" && user.role !== "branch_manager") {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    const [employees] = await pool.query('SELECT id, full_name AS name, phone_number AS phone, role, branch_id AS branchId FROM employees WHERE id = ?', [id]);
    if (employees.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    const targetEmployee = employees[0];
    if (user.role === "branch_manager" && targetEmployee.branchId !== user.branchId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập nhân viên này' });
    }

    res.status(200).json(targetEmployee);
  } catch (error) {
    console.error('Error fetching employee by ID:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin nhân viên', error: error.message });
  }
});

router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const { role, branchId } = req.query;
    const user = req.user;

    let query = 'SELECT id, full_name AS name, role, branch_id AS branchId FROM employees';
    const params = [];

    if (user.role === 'branch_manager') {
      query += ' WHERE branch_id = ?';
      params.push(user.branchId);
    } else if (user.role === 'admin') {
      if (branchId) {
        query += ' WHERE branch_id = ?';
        params.push(branchId);
      }
    }

    if (role) {
      query += (params.length > 0 ? ' AND' : ' WHERE') + ' role = ?';
      params.push(role);
    }

    const [employees] = await pool.query(query, params);
    const formattedEmployees = employees.map((e) => ({
      id: e.id.toString(),
      name: e.name,
      role: e.role,
      branchId: e.branchId?.toString() || null,
    }));

    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách nhân viên', error: error.message });
  }
});

module.exports = router;