const { app } = require('@azure/functions');
const sql = require('mssql');

// ค่า SQL_CONNECTION_STRING ตั้งใน Azure Portal > Static Web App > Environment variables
let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(process.env.SQL_CONNECTION_STRING).catch(err => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

const json = (status, body) => ({ status, jsonBody: body });

app.http('students', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'students/{id?}',
  handler: async (request, context) => {
    try {
      const pool = await getPool();
      const id = request.params.id ? parseInt(request.params.id, 10) : null;

      // READ
      if (request.method === 'GET') {
        if (id) {
          const r = await pool.request().input('id', sql.Int, id)
            .query('SELECT * FROM Students WHERE id = @id');
          return r.recordset.length ? json(200, r.recordset[0]) : json(404, { error: 'ไม่พบข้อมูล' });
        }
        const r = await pool.request().query('SELECT * FROM Students ORDER BY id DESC');
        return json(200, r.recordset);
      }

      // CREATE
      if (request.method === 'POST') {
        const { name, email, major } = await request.json();
        if (!name || !email) return json(400, { error: 'กรุณากรอกชื่อและอีเมล' });
        const r = await pool.request()
          .input('name', sql.NVarChar(100), name)
          .input('email', sql.NVarChar(100), email)
          .input('major', sql.NVarChar(100), major || null)
          .query('INSERT INTO Students (name, email, major) OUTPUT INSERTED.* VALUES (@name, @email, @major)');
        return json(201, r.recordset[0]);
      }

      if (!id) return json(400, { error: 'ต้องระบุ id' });

      // UPDATE
      if (request.method === 'PUT') {
        const { name, email, major } = await request.json();
        if (!name || !email) return json(400, { error: 'กรุณากรอกชื่อและอีเมล' });
        const r = await pool.request()
          .input('id', sql.Int, id)
          .input('name', sql.NVarChar(100), name)
          .input('email', sql.NVarChar(100), email)
          .input('major', sql.NVarChar(100), major || null)
          .query('UPDATE Students SET name=@name, email=@email, major=@major OUTPUT INSERTED.* WHERE id=@id');
        return r.recordset.length ? json(200, r.recordset[0]) : json(404, { error: 'ไม่พบข้อมูล' });
      }

      // DELETE
      if (request.method === 'DELETE') {
        const r = await pool.request().input('id', sql.Int, id)
          .query('DELETE FROM Students WHERE id = @id');
        return r.rowsAffected[0] ? json(200, { deleted: id }) : json(404, { error: 'ไม่พบข้อมูล' });
      }
    } catch (err) {
      context.error(err);
      return json(500, { error: err.message });
    }
  }
});
