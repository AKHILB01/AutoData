const pool = require("../config/db.config");

const saveIdData = async (data) => {
  const query = `
    INSERT INTO id_data (full_name, dob, id_number, raw_text)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [data.full_name, data.dob, data.id_number, data.raw_text];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { saveIdData };
