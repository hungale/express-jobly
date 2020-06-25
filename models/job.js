const db = require("../db");
const ExpressError = require('../expressError');
const partialUpdate = require('../helpers/partialUpdate');

/** Job Class to add/get/update/delete jobs*/

class Job {

  /** POST / - add Job to db
 *
 * => {job: [{title, salary, equity, company_handle, date_posted}]}
 * */
  
  static async create({title, salary, equity, company_handle}) {
    const job = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
        VALUES ($1, $2, $3, $4, current_timestamp)
        RETURNING id, title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]
    );
    
    if (!job.rows.length) throw new ExpressError('Company does not exist in our records', 404);
    return job.rows[0];
  };

/** GET / - get jobs that match the query String parameters.
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}, ...]}
* */

  static async all(queryObj) {
    const queryArr = [];
    const values = [];
    let dbQuery = `SELECT title, company_handle, date_posted FROM jobs `;

    for (let key in queryObj) {
      if (key === 'search') {
        queryArr.push(`company_handle=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      };
      if (key === 'min_salary') {
        queryArr.push(`salary>=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      };
      if (key === 'min_equity') {
        queryArr.push(`equity>=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      };
    };

    if (queryArr.length) {
      dbQuery += 'WHERE ' + queryArr.join(' AND ');
    };
   
    dbQuery += ' ORDER BY date_posted DESC';
    const jobs = await db.query(dbQuery, values);
    return jobs.rows;
  };

/** GET / - get certain job by id
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}]}
* */
  
  static async getBy(id) {
    const job = await db.query(`SELECT id, title, salary, equity, company_handle, date_posted
                                FROM jobs
                                WHERE id=$1`, [id]);
                                
    return job.rows[0];
  };

/** PATCH / - adjust Job by id
*
* => {job: [{id, title, salary, equity, company_handle, date_posted}]}
* */

  static async update(id, updateValues) {
    const { query, values } = partialUpdate('jobs', updateValues, 'id', id);
    const job = await db.query(query, values);

    if (!job.rows.length) {
      throw new ExpressError("Cannot update a job that does not exist.", 404);
    };

    return job.rows[0];
  };

/** DELETE / - delete Job by id
*
* => {job: [{title}]}
* */

  static async delete(id) {
    const job = await db.query(`
    DELETE FROM jobs
    WHERE id=$1
    RETURNING title`, [id]);
  
    return job.rows[0];
  };
};

module.exports = Job;
