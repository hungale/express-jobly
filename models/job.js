const db = require("../db");
const ExpressError = require('../expressError');
const partialUpdate = require('../helpers/partialUpdate');


class Job {
  static async create({title, salary, equity, company_handle}) {
    const job = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, current_timestamp)
        RETURNING title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );
    
    return job.rows[0];
  }

  static async all(queryObj) {
    const queryArr = [];
    const values = [];
    let dbQuery = `SELECT jobs.title, jobs.company_handle FROM jobs `;

    for (let key in queryObj) {
      if (key === 'search') {
        queryArr.push(`search=$${queryArr.length + 1}`);
        values.push(+queryObj[key]);
      }
      if (key === 'min_salary') {
        queryArr.push(`salary>=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      }
      if (key === 'min_equity') {
        queryArr.push(`equity>=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      }
    }

    if (queryArr.length) {
      dbQuery += 'WHERE ' + queryArr.join(' AND ');
    }
    console.log('......', values)

    const jobs = await db.query(dbQuery, values);
    return jobs.rows;
  }

  static async getBy(id) {
    const job = await db.query(`SELECT id, title, salary, equity, company_handle, date_posted
                                FROM jobs
                                WHERE id=$1`, [id])
    return job.rows[0];
  }

  static async update(id, updateValues) {
    const { query, values } = partialUpdate('jobs', updateValues, 'id', id);
    const job = await db.query(query, values);

    if (!job.rows.length) {
      throw new ExpressError("Cannot update a job that does not exist.", 404);
    }

    return job.rows[0];
  }

  static async delete(id) {
    const job = await db.query(`
    DELETE FROM jobs
    WHERE id=$1
    RETURNING title`, [id]);
  
    return job.rows[0];
  }
}

module.exports = Job;