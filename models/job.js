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
}

module.exports = Job;