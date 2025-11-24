
const pool = require('../db');

const getAnnouncements = async (req, res) => {
  const { department_id, published_only = 'false' } = req.query;
  
  try {
    let query = `
      SELECT a.*, u.full_name as author_name, d.department_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN departments d ON a.department_id = d.department_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // If user is logged in, you can filter by their department if needed
    if (department_id) {
      paramCount++;
      query += ` AND a.department_id = $${paramCount}`;
      params.push(department_id);
    }

    if (published_only === 'true') {
      paramCount++;
      query += ` AND a.is_published = true AND (a.publish_at IS NULL OR a.publish_at <= NOW()) 
                AND (a.expires_at IS NULL OR a.expires_at > NOW())`;
    }

    query += ` ORDER BY 
              CASE a.priority 
                WHEN 'high' THEN 1
                WHEN 'medium' THEN 2
                WHEN 'low' THEN 3
                ELSE 4
              END, 
              a.created_at DESC`;

    console.log('Executing query:', query);
    console.log('With params:', params);
    
    const result = await pool.query(query, params);
    console.log('Found announcements:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Create announcement - WITH SESSION USER
const createAnnouncement = async (req, res) => {
  const { title, content, priority, publish_at, expires_at, is_published } = req.body;
  
  console.log('Creating announcement with data:', req.body);
  console.log('User session:', req.user); // This should contain user info from your auth middleware
  
  try {
    // Get user from session (this depends on your authentication setup)
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const author_id = user.id;
    const department_id = user.department_id; // Make sure this is in your user object

    if (!department_id) {
      return res.status(400).json({ error: 'User department not found' });
    }

    const result = await pool.query(
      `INSERT INTO announcements 
       (title, content, author_id, department_id, priority, publish_at, expires_at, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, content, author_id, department_id, priority, publish_at, expires_at, is_published || false]
    );

    console.log('Announcement created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};
// Get single announcement
const getAnnouncementById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name as author_name, d.name as department_name
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       LEFT JOIN departments d ON a.department_id = d.id
       WHERE a.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};


// Update announcement
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, priority, publish_at, expires_at, is_published } = req.body;

  try {
    const result = await pool.query(
      `UPDATE announcements 
       SET title = $1, content = $2, priority = $3, publish_at = $4, 
           expires_at = $5, is_published = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, content, priority, publish_at, expires_at, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM announcements WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

// Toggle publish status
const togglePublish = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE announcements 
       SET is_published = NOT is_published, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling announcement:', error);
    res.status(500).json({ error: 'Failed to toggle announcement' });
  }
};

module.exports = { getAnnouncements, getAnnouncementById, createAnnouncement,updateAnnouncement, togglePublish, deleteAnnouncement };
 