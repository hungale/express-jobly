const db = require("../db");
const ExpressError = require('../expressError');
const partialUpdate = require('../helpers/partialUpdate');


/** Company on the site.  */
class Company {
  static async all(queryObj) {
    //  queryObj = {search, min_employees, max_employees}
    let queryArr = [];
    let values = [];
    for(let key in queryObj) {
      if(key === "search") {
        queryArr.push(`handle=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      }
      if(key === "min_employees") {
        queryArr.push(`num_employees>=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      }
      if(key === "max_employees") {
        queryArr.push(`num_employees<=$${queryArr.length + 1}`);
        values.push(queryObj[key]);
      }
    }
    
    if(queryObj["min_employees"] && queryObj["max_employees"]) {
      if(+queryObj["min_employees"] > +queryObj["max_employees"]) {
        throw new ExpressError("Min must be less than max", 400);
      }
    }

    let baseQuery = `SELECT handle, name FROM companies`
    if(queryArr.length) {
      baseQuery += " WHERE " + queryArr.join(" AND ");
    }
    const companies = await db.query(
       baseQuery, values // or use Object.values(queryObj) if ECMA2020
    );

    return companies.rows;
  }

/**
 * 
 * returning => {handle, name, num_employees, description, logo_url}
 */
  static async create({handle, name, num_employees, description, logo_url}) {
    
    const company = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    return company.rows[0];
  }

/** Getting a single company by its handle */
  static async getBy(handle) {
    const company = await db.query(
      `SELECT handle, name, num_employees, description, logo_url, jobs.title, jobs.salary, jobs.equity
        FROM companies
        JOIN jobs
        ON handle = jobs.company_handle
        WHERE handle = $1`, [handle]
    );
    
    if (!company.rows.length) {
      throw new ExpressError(`Company ${handle} doesn't exist`, 404);
    }

    const {name, description, logo_url } = company.rows[0];

    const jobs = company.rows.map(({ title, salary, equity }) => ({ title, salary, equity }));
    
    return {handle, name, description, logo_url, jobs};
  }
/** Updating a single company by its handle */
  static async update(handle, updateValues) {
    const { query, values } = partialUpdate('companies', updateValues, 'handle', handle);
    const company = await db.query(query, values);

    if(!company.rows.length) {
      throw new ExpressError("Cannot update a company that does not exist.", 404);
    }

    return company.rows[0];
  }
/** Delete a single company by its handle */
  
  static async delete(handle) {
    const company = await db.query(`
    DELETE FROM companies
    WHERE handle = $1
    RETURNING handle`, [handle]);

    if(!company.rows.length) {
      throw new ExpressError("Cannot delete a company that does not exist.", 404);
    }
    
    return company.rows[0];
  }
}

module.exports = Company;