const pool = require("../db");

// Update the getTodaySchedule function to include block information
const getTodaySchedule = async (req, res) => {
  const { day } = req.query;
  
  try {
    const today = day || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const query = `
      SELECT 
        dc.id,
        ds.day_of_week,
        c.course_name,
        c.course_code,
        dc.start_time,
        dc.end_time,
        b.block_name,
        b.block_code,
        f.floor_number,
        f.floor_name,
        r.room_number,
        r.room_type,
        u.full_name AS instructor_name,
        d.department_name,
        s.batch,
        s.semester,
        s.section
      FROM day_courses dc
      JOIN day_schedules ds ON dc.day_schedule_id = ds.id
      JOIN schedules s ON ds.schedule_id = s.id
      JOIN course c ON dc.course_id = c.course_id
      JOIN users u ON dc.instructor_id = u.id
      JOIN rooms r ON dc.room_id = r.room_id
      JOIN floors f ON r.floor_id = f.floor_id
      JOIN blocks b ON f.block_id = b.block_id
      JOIN departments d ON s.department_id = d.department_id
      WHERE LOWER(ds.day_of_week) = LOWER($1)
        AND s.status = 'published'
      ORDER BY dc.start_time
    `;

    const result = await pool.query(query, [today]);

    const formattedSchedules = result.rows.map(row => ({
      id: row.id,
      course_name: row.course_name,
      course_code: row.course_code,
      start_time: row.start_time,
      end_time: row.end_time,
      location: `${row.block_code} - Floor ${row.floor_number}${row.floor_name ? ` (${row.floor_name})` : ''} - Room ${row.room_number}`,
      block_name: row.block_name,
      block_code: row.block_code,
      floor_number: row.floor_number,
      floor_name: row.floor_name,
      room_number: row.room_number,
      room_type: row.room_type,
      day_of_week: row.day_of_week,
      instructor_name: row.instructor_name,
      department_name: row.department_name,
      batch: row.batch,
      semester: row.semester,
      section: row.section
    }));

    res.json(formattedSchedules);
  } catch (err) {
    console.error("Error fetching today's schedule:", err);
    res.status(500).json({ error: "Failed to fetch today's schedule" });
  }
};

const create = async (req, res) => {
  const { batch, semester, department_id, section, status, schedule } = req.body;
  const client = await pool.connect();
  let found = false;
  
  try {
    // Enhanced duplicate checking with room details
    for (const day of schedule) {
      for (const course1 of day.courses) {
        let countRepeat = 0, instfound = 0;
        for (const course2 of day.courses) {
          if (course1.room_id == course2.room_id && course1.startTime == course2.startTime && course1.endTime == course2.endTime) {
            if (course1.instructor_id == course2.instructor_id) {
              instfound += 1;
            }
            countRepeat += 1;
          }
        }
        if (countRepeat > 1 && instfound > 1) {
          client.release();
          return res.status(400).json({
            message: `Room and instructor are repeated on ${day.day_of_week} between ${course1.startTime}-${course1.endTime}.`,
          });
        } else if (countRepeat > 1) {
          client.release();
          return res.status(400).json({
            message: `Room is repeated on ${day.day_of_week} between ${course1.startTime}-${course1.endTime}.`,
          });
        }
      }
    }

    // Check room availability and conflicts with block/floor context
    const existingResult = await client.query(
      "SELECT * FROM schedules WHERE batch = $1 AND semester = $2 AND section = $3 AND status = $4 AND department_id = $5",
      [batch, semester, section, "published", department_id]
    );

    if (existingResult.rows.length > 0) {
      found = true;
    }

    if (found) {
      for (const day of schedule) {
        const dayResult = await client.query(
          "SELECT * FROM day_schedules WHERE day_of_week = $1",
          [day.day_of_week]
        );

        if (dayResult.rows.length > 0) {
          for (const course of day.courses) {
            // Check for break time conflict
            if (course.startTime > "06:00:00" && course.startTime < "07:00:00") {
              client.release();
              return res.status(400).json({
                message: `Cannot schedule between 06:00:00 and 07:00:00 (break time).`,
              });
            }

            // Enhanced conflict check with room details
            const result = await client.query(
              `SELECT dc.*, c.course_name, u.full_name, 
                      b.block_name, b.block_code, f.floor_number, r.room_number, dw.day_of_week
               FROM day_courses dc
               JOIN course c ON dc.course_id = c.course_id
               JOIN day_schedules dw ON dc.day_schedule_id = dw.id
               JOIN users u ON dc.instructor_id = u.id
               JOIN rooms r ON dc.room_id = r.room_id
               JOIN floors f ON r.floor_id = f.floor_id
               JOIN blocks b ON f.block_id = b.block_id
               WHERE dc.room_id = $1 
                  AND dc.start_time = $2 
                  AND dc.end_time = $3
                  AND dw.day_of_week = $4`,
              [
                course.room_id,
                course.startTime,
                course.endTime,
                day.day_of_week,
              ]
            );

            if (result.rows.length > 0 && result.rows[0].instructor_id == course.instructor_id) {
              client.release();
              return res.status(400).json({
                message: `Instructor ${result.rows[0].full_name} is already scheduled in ${result.rows[0].block_code} - Floor ${result.rows[0].floor_number} - Room ${result.rows[0].room_number} on ${day.day_of_week} between ${course.startTime}-${course.endTime}.`,
              });
            } else if (result.rows.length > 0) {
              client.release();
              return res.status(400).json({
                message: `Room ${result.rows[0].block_code} - Floor ${result.rows[0].floor_number} - ${result.rows[0].room_number} is already scheduled on ${day.day_of_week} between ${course.startTime}-${course.endTime}.`,
              });
            }
          }
        }
      }
    }

    // Create the new schedule
    await client.query('BEGIN');

    // Update existing schedules to draft
    await client.query(
      "UPDATE schedules SET status='draft' WHERE batch=$1 and semester=$2 and section=$3 and status=$4 and department_id=$5",
      [batch, semester, section, status, department_id]
    ); 

    // Insert into schedules
    const schedResult = await client.query(
      "INSERT INTO schedules (batch, semester, section, status, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [batch, semester, section, status, department_id]
    );

    const scheduleId = schedResult.rows[0].id;

    // Insert day_schedules and day_courses
    for (const day of schedule) {
      const dayResult = await client.query(
        "INSERT INTO day_schedules (schedule_id, day_of_week) VALUES ($1, $2) RETURNING id",
        [scheduleId, day.day_of_week]
      );

      const dayId = dayResult.rows[0].id;

      for (const course of day.courses) {
        await client.query(
          `INSERT INTO day_courses 
           (day_schedule_id, course_id, room_id, instructor_id, start_time, end_time, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            dayId,
            course.course_id,
            course.room_id,
            course.instructor_id,
            course.startTime,
            course.endTime,
            course.color,
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Schedule created successfully." });
  } catch (err) {
    console.error("Schedule creation failed:", err);
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to save schedule." });
  } finally {
    client.release();
  }
};

 const getAll = async (req, res) => {
  try {
    const schedulesResult = await pool.query("SELECT * FROM schedules ORDER BY created_at DESC");
    const schedules = schedulesResult.rows;
    
    if (!schedules || schedules.length === 0) {
      return res.json([]);
    }

    const scheduleIds = schedules.map(s => s.id);

    const daysResult = await pool.query(
      "SELECT * FROM day_schedules WHERE schedule_id = ANY($1) ORDER BY id",
      [scheduleIds]
    );
    const days = daysResult.rows;

    const dayIds = days.map(d => d.id);

    let dayCourses = [];
    if (dayIds.length > 0) {
      const dayCoursesResult = await pool.query(
        `SELECT 
           dc.*,
           c.course_name, c.course_code,
           b.block_name, b.block_code,
           f.floor_number, f.floor_name,
           r.room_number, r.room_type, r.capacity,
           i.full_name AS instructor_name
         FROM day_courses dc
         LEFT JOIN course c ON dc.course_id = c.course_id
         LEFT JOIN rooms r ON dc.room_id = r.room_id
         LEFT JOIN floors f ON r.floor_id = f.floor_id
         LEFT JOIN blocks b ON f.block_id = b.block_id
         LEFT JOIN users i ON dc.instructor_id = i.id
         WHERE dc.day_schedule_id = ANY($1)
         ORDER BY dc.start_time`,
        [dayIds]
      );
      dayCourses = dayCoursesResult.rows;
    }

    const daysById = {};
    days.forEach(d => {
      daysById[d.id] = { ...d, courses: [] };
    });

    dayCourses.forEach(c => {
      const parent = daysById[c.day_schedule_id];
      if (parent) {
        parent.courses.push({
          id: c.id,
          course_id: c.course_id,
          course_code: c.course_code,
          course_name: c.course_name,
          room_id: c.room_id,
          block_name: c.block_name,
          block_code: c.block_code,
          floor_number: c.floor_number,
          floor_name: c.floor_name,
          room_number: c.room_number,
          room_type: c.room_type,
          room_capacity: c.capacity,
          instructor_id: c.instructor_id,
          instructor_name: c.instructor_name,
          startTime: c.start_time,
          endTime: c.end_time,
          color: c.color,
          location: `${c.block_code} - Floor ${c.floor_number} - ${c.room_number}`,
          created_at: c.created_at,
          updated_at: c.updated_at
        });
      }
    });

    const daysByScheduleId = {};
    days.forEach(d => {
      daysByScheduleId[d.schedule_id] = daysByScheduleId[d.schedule_id] || [];
      daysByScheduleId[d.schedule_id].push(daysById[d.id]);
    });

    const result = schedules.map(s => ({
      id: s.id,
      batch: s.batch,
      semester: s.semester,
      section: s.section,
      department_id: s.department_id,
      status: s.status,
      created_at: s.created_at,
      updated_at: s.updated_at,
      days: daysByScheduleId[s.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};
const Delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
    res.json({ message: "Schedule deleted", affectedRows: result.rowCount });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};

const permission = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  // update existing into schedules
  // Check if a published schedule already exists
    const existingResult = await pool.query(
      "SELECT * FROM schedules WHERE id = $1",
      [id]
    );
    await pool.query(
      "UPDATE schedules SET status='draft' WHERE batch=$1 and semester=$2 and  section=$3 and  status=$4 and department_id=$5",
      [existingResult.rows[0].batch, existingResult.rows[0].semester, existingResult.rows[0].section, "published", existingResult.rows[0].department_id]
    ); 
  if (!["draft", "published"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    await pool.query("UPDATE schedules SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};
const update = async (req, res) => {
  const scheduleId = req.params.id;
  const { batch, semester, section, department_id, status, schedule } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
// update existing into schedules
    await client.query(
      "UPDATE schedules SET status='draft' WHERE batch=$1 and semester=$2 and  section=$3 and  status=$4 and department_id=$5",
      [batch, semester, section, status, department_id]
    ); 
    //  Check if schedule exists
    const existing = await client.query("SELECT * FROM schedules WHERE id = $1", [scheduleId]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Schedule not found." });
    }

    //  Update main schedule info
    await client.query(
      `UPDATE schedules 
       SET batch = $1, semester = $2, section = $3, department_id = $4, status = $5, updated_at = NOW() 
       WHERE id = $6`,
      [batch, semester, section, department_id, status, scheduleId]
    );

    //  Delete old day_schedules and day_courses
    const oldDays = await client.query("SELECT id FROM day_schedules WHERE schedule_id = $1", [scheduleId]);
    const oldDayIds = oldDays.rows.map(r => r.id);
    if (oldDayIds.length > 0) {
      await client.query("DELETE FROM day_courses WHERE day_schedule_id = ANY($1)", [oldDayIds]);
      await client.query("DELETE FROM day_schedules WHERE id = ANY($1)", [oldDayIds]);
    }

    //  Validate duplicate rooms and instructors before inserting new ones
    for (const day of schedule) {
      for (const course1 of day.courses) {
        let countRepeat = 0, instfound = 0;
        for (const course2 of day.courses) {
          if (course1.room_id == course2.room_id && course1.startTime == course2.startTime && course1.endTime == course2.endTime) {
            if (course1.instructor_id == course2.instructor_id) {
              instfound += 1;
            }
            countRepeat += 1;
          }
        }
        if (countRepeat > 1 && instfound > 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            message: `Room ${course1.room_id}, instructor ${course1.instructor_id} are repeated on ${day.day_of_week} between ${course1.startTime}-${course1.endTime}.`,
          });
        } else if (countRepeat > 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            message: `Room ${course1.room_id} is repeated on ${day.day_of_week} between ${course1.startTime}-${course1.endTime}.`,
          });
        }
      }
    }

    //  Insert updated day_schedules and day_courses
    for (const day of schedule) {
      const dayResult = await client.query(
        "INSERT INTO day_schedules (schedule_id, day_of_week) VALUES ($1, $2) RETURNING id",
        [scheduleId, day.day_of_week]
      );

      const dayId = dayResult.rows[0].id;

      for (const course of day.courses) {
        await client.query(
          `INSERT INTO day_courses 
           (day_schedule_id, course_id, room_id, instructor_id, start_time, end_time, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            dayId,
            course.course_id,
            course.room_id,
            course.instructor_id,
            course.startTime,
            course.endTime,
            course.color,
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Schedule updated successfully." });

  } catch (err) {
    console.error("Schedule update failed:", err);
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to update schedule." });
  } finally {
    client.release();
  }
};

const Batch = async (req, res) => {
  const { batch, semester, section, department_id } = req.query;

  try {
    let query = `
      SELECT 
        dc.id, 
        ds.day_of_week, 
        c.course_name, 
        i.full_name AS instructor_name,
        b.block_name,
        b.block_code,
        f.floor_number,
        r.room_number,
        dc.start_time, 
        dc.end_time, 
        d.department_name
      FROM day_courses dc
      JOIN day_schedules ds ON dc.day_schedule_id = ds.id
      JOIN schedules s ON ds.schedule_id = s.id
      JOIN course c ON dc.course_id = c.course_id
      JOIN users i ON dc.instructor_id = i.id
      JOIN rooms r ON dc.room_id = r.room_id
      JOIN floors f ON r.floor_id = f.floor_id
      JOIN blocks b ON f.block_id = b.block_id
      JOIN departments d ON s.department_id = d.department_id
      WHERE s.status='published' 
        AND s.batch = $1 
        AND s.semester = $2 
        AND s.section = $3
    `;

    const params = [batch, semester, section];

    if (department_id) {
      query += ` AND d.department_id = $4`;
      params.push(department_id);
    }

    query += ` ORDER BY 
      CASE ds.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END, dc.start_time`;

    const result = await pool.query(query, params);

    // Format response with location information
    const formattedResults = result.rows.map(row => ({
      ...row,
      location: `${row.block_code} - Floor ${row.floor_number} - Room ${row.room_number}`,
      start_time: formatTime(row.start_time),
      end_time: formatTime(row.end_time)
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

// GET /api/instructors/:id/schedule - Get instructor's teaching schedule
const getInstructorSchedule = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('Fetching schedule for instructor:', id);
    
    const query = `
      SELECT 
        dc.id,
        c.course_name,
        c.course_code,
        s.batch,
        s.semester,
        s.section,
        ds.day_of_week as day,
        dc.start_time,
        dc.end_time,
        r.room_number as room,
        d.department_name,
        u.full_name as instructor_name,
        u.id_number as instructor_id
        
      FROM day_courses dc
      JOIN day_schedules ds ON dc.day_schedule_id = ds.id
      JOIN schedules s ON ds.schedule_id = s.id
      JOIN course c ON dc.course_id = c.course_id
      JOIN users u ON dc.instructor_id = u.id
      JOIN rooms r ON dc.room_id = r.room_id
      JOIN departments d ON s.department_id = d.department_id
      WHERE (u.id= $1)
        AND s.status = 'published'
        AND u.role = 'instructor'
      ORDER BY 
        CASE ds.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        dc.start_time
    `;

    const result = await pool.query(query, [id]);

    // Format the response and add time_slot if not present
    const formattedSchedules = result.rows.map(row => ({
      id: row.id,
      course_name: row.course_name,
      course_code: row.course_code,
      batch: row.batch,
      semester: row.semester,
      section: row.section,
      day: row.day,
      start_time: formatTime(row.start_time),
      end_time: formatTime(row.end_time),
      time_slot: row.time_slot || `${formatTime(row.start_time)}-${formatTime(row.end_time)}`,
      room: row.room,
      department_name: row.department_name,
      instructor_name: row.instructor_name,
      instructor_id: row.instructor_id
    }));

    console.log(`Found ${formattedSchedules.length} classes for instructor ${id}`);
    res.json(formattedSchedules);

  } catch (err) {
    console.error("Error fetching instructor schedule:", err);
    res.status(500).json({ error: "Failed to fetch instructor schedule" });
  }
};

// GET /api/instructors/:id - Get instructor information
const getInstructorInfo = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('Fetching info for instructor:', id);
    
    const query = `
      SELECT 
        u.id,
        u.id_number,
        u.full_name,
        u.email,
        u.role,
        d.department_name,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE (u.id_number = $1 OR u.id::text = $1) 
        AND u.role = 'instructor'
        AND u.status = 'Active'
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const instructor = result.rows[0];
    console.log('Found instructor:', instructor.full_name);
    res.json(instructor);

  } catch (err) {
    console.error('Error fetching instructor info:', err);
    res.status(500).json({ error: 'Failed to fetch instructor info' });
  }
};

// GET /api/instructors/me/schedule - Get current instructor's schedule (from session)
const getMySchedule = async (req, res) => {
  try {
    // Get instructor from session
    if (!req.user || req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied. Instructor role required.' });
    }

    const instructorId = req.user.id;
    console.log('Fetching schedule for current instructor:', instructorId, req.user.full_name);

    const query = `
      SELECT 
        dc.id,
        c.course_name,
        c.course_code,
        s.batch,
        s.semester,
        s.section,
        ds.day_of_week as day,
        dc.start_time,
        dc.end_time,
        CONCAT(
          CASE WHEN r.section IS NOT NULL THEN 'B ' || r.section || ' - ' ELSE '' END,
          'F ' || r.floor_number || ' - ',
          'R ' || r.room_number,
          CASE WHEN r.room_type IS NOT NULL THEN ' (' || r.room_type || ')' ELSE '' END
        ) as room,
        d.department_name,
        u.full_name as instructor_name,
        u.id_number as instructor_id,
        dc.time_slot,
        s.status as schedule_status
      FROM day_courses dc
      JOIN day_schedules ds ON dc.day_schedule_id = ds.id
      JOIN schedules s ON ds.schedule_id = s.id
      JOIN course c ON dc.course_id = c.course_id
      JOIN users u ON dc.instructor_id = u.id
      JOIN rooms r ON dc.room_id = r.id
      JOIN departments d ON s.department_id = d.department_id
      WHERE (u.id_number = $1 OR dc.instructor_id= $1)
        AND s.status = 'published'
        AND u.role = 'instructor'
        AND u.status = 'Active'
      ORDER BY 
        CASE ds.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        dc.start_time
    `;

    const result = await pool.query(query, [instructorId]);

    // Format the response
    const formattedSchedules = result.rows.map(row => ({
      id: row.id,
      course_name: row.course_name,
      course_code: row.course_code,
      batch: row.batch,
      semester: row.semester,
      section: row.section,
      day: row.day,
      start_time: formatTime(row.start_time),
      end_time: formatTime(row.end_time),
      time_slot: row.time_slot || `${formatTime(row.start_time)}-${formatTime(row.end_time)}`,
      room: row.room,
      department_name: row.department_name,
      instructor_name: row.instructor_name,
      instructor_id: row.instructor_id,
      schedule_status: row.schedule_status
    }));

    console.log(`Found ${formattedSchedules.length} classes for instructor ${instructorId}`);
    
    res.json({
      instructor: {
        id: req.user.id,
        id_number: req.user.id_number,
        full_name: req.user.full_name,
        email: req.user.email,
        role: req.user.role,
        department_name: req.user.department_name,
        department_id: req.user.department_id
      },
      schedules: formattedSchedules,
      stats: {
        total_classes: formattedSchedules.length,
        classes_per_day: getClassesPerDay(formattedSchedules),
        unique_courses: [...new Set(formattedSchedules.map(s => s.course_name))].length,
        unique_batches: [...new Set(formattedSchedules.map(s => s.batch))].length
      }
    });

  } catch (err) {
    console.error("Error fetching my schedule:", err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
};


// GET /api/instructors - Get all instructors (for admin use)
const getAllInstructors = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.id_number,
        u.full_name,
        u.email,
        u.role,
        d.department_name,
        u.created_at,
        u.status
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE u.role = 'instructor'
        AND u.status = 'Active'
      ORDER BY u.full_name
    `;

    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} instructors`);
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching instructors:', err);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', timeString, error);
    return timeString;
  }
};

// Helper function to calculate classes per day
const getClassesPerDay = (schedules) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const classesPerDay = {};
  
  days.forEach(day => {
    classesPerDay[day] = schedules.filter(s => s.day === day).length;
  });
  
  return classesPerDay;
};
// Get available rooms for a specific time slot
const getAvailableRooms = async (req, res) => {
  const { day, start_time, end_time, room_type, capacity } = req.query;
  
  try {
    let query = `
      SELECT 
        r.room_id,
        r.room_number,
        r.room_name,
        r.room_type,
        r.capacity,
        r.facilities,
        f.floor_number,
        f.floor_name,
        b.block_name,
        b.block_code,
        CONCAT(b.block_code, ' - Floor ', f.floor_number, ' - ', r.room_number) as location
      FROM rooms r
      JOIN floors f ON r.floor_id = f.floor_id
      JOIN blocks b ON f.block_id = b.block_id
      WHERE r.is_available = true
        AND r.room_id NOT IN (
          SELECT dc.room_id 
          FROM day_courses dc
          JOIN day_schedules ds ON dc.day_schedule_id = ds.id
          WHERE ds.day_of_week = $1 
            AND dc.start_time = $2 
            AND dc.end_time = $3
        )
    `;

    const params = [day, start_time, end_time];

    if (room_type) {
      query += ` AND r.room_type = $${params.length + 1}`;
      params.push(room_type);
    }

    if (capacity) {
      query += ` AND r.capacity >= $${params.length + 1}`;
      params.push(parseInt(capacity));
    }

    query += ` ORDER BY b.block_name, f.floor_number, r.room_number`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching available rooms:", err);
    res.status(500).json({ error: "Failed to fetch available rooms" });
  }
};

// Get room hierarchy (blocks -> floors -> rooms)
const getRoomHierarchy = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.block_id,
        b.block_name,
        b.block_code,
        b.description as block_description,
        f.floor_id,
        f.floor_number,
        f.floor_name,
        f.description as floor_description,
        r.room_id,
        r.room_number,
        r.room_name,
        r.room_type,
        r.capacity,
        r.facilities,
        r.is_available
      FROM blocks b
      LEFT JOIN floors f ON b.block_id = f.block_id
      LEFT JOIN rooms r ON f.floor_id = r.floor_id
      ORDER BY b.block_name, f.floor_number, r.room_number
    `;

    const result = await pool.query(query);
    
    // Structure the data hierarchically
    const hierarchy = result.rows.reduce((acc, row) => {
      let block = acc.find(b => b.block_id === row.block_id);
      if (!block) {
        block = {
          block_id: row.block_id,
          block_name: row.block_name,
          block_code: row.block_code,
          block_description: row.block_description,
          floors: []
        };
        acc.push(block);
      }

      if (row.floor_id) {
        let floor = block.floors.find(f => f.floor_id === row.floor_id);
        if (!floor) {
          floor = {
            floor_id: row.floor_id,
            floor_number: row.floor_number,
            floor_name: row.floor_name,
            floor_description: row.floor_description,
            rooms: []
          };
          block.floors.push(floor);
        }

        if (row.room_id) {
          floor.rooms.push({
            room_id: row.room_id,
            room_number: row.room_number,
            room_name: row.room_name,
            room_type: row.room_type,
            capacity: row.capacity,
            facilities: row.facilities,
            is_available: row.is_available
          });
        }
      }

      return acc;
    }, []);

    res.json(hierarchy);
  } catch (err) {
    console.error("Error fetching room hierarchy:", err);
    res.status(500).json({ error: "Failed to fetch room hierarchy" });
  }
};
module.exports = {
  getInstructorSchedule,
  getInstructorInfo,
  getMySchedule,
  getTodaySchedule,
  getAllInstructors,
  getTodaySchedule,
  getAvailableRooms,
  getRoomHierarchy,
  create, 
  getAll,
  Delete, 
  permission,
  Batch, 
  update };