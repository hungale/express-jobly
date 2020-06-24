const db = require("../db");
const ExpressError = require('../expressError');
const partialUpdate = require('../helpers/partialUpdate');


/** Company on the site.  */
class Company {
  // static async search(term) {

  // }
  static async all(queryObj) {
    //  query = {search, min_employees, max_employees}
    let queryArr = [];
    for(let key in queryObj) {
      if(key === "search") {
        queryArr.push(`handle=$${queryArr.length + 1}`);
      }
      if(key === "min_employees") {
        queryArr.push(`num_employees>$${queryArr.length + 1}`);
      }
      if(key === "max_employees") {
        queryArr.push(`num_employees<$${queryArr.length + 1}`);
      }
    }

    let baseQuery = `SELECT handle, name FROM companies`
    if(queryArr.length > 0) {
      baseQuery += " WHERE " + queryArr.join(" AND ");
    }
    const companies = await db.query(
       baseQuery, Object.values(queryObj)
      // WHERE handle=$1, num_employees>$2, num_employees<$3`,
      // [search, min_employees, max_employees]
    );

    return companies.rows;
  }

/**
 * 
 * @param {*} param0 
 */
  static async create({handle, name, num_employees, description, logo_url}) {
    // { handle,
    //   name,
    //   num_employees,
    //   description,
    //   logo_url
    // }
    const response = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    return response.rows[0];
  }

/** Getting a single company by its handle */
  static async getBy(handle) {
    const result = await db.query(`
    SELECT handle, name, num_employees, description, logo_url
    FROM companies
    WHERE handle = $1
    `, [handle]);
    if (!result.rows.length) throw new ExpressError(`Company ${handle} doesn't exist`, 404);
    return result.rows[0];
  }
/** Updating a single company by its handle */
  static async update(handle, updateValues) {
    const { query, values } = partialUpdate('companies', updateValues, 'handle', handle);
    const companyUpdate = await db.query(query, values);
    return companyUpdate.rows[0];
  }
/** Delete a single company by its handle */
  
  static async delete(handle) {
    const company = await db.query(`
    DELETE FROM companies
    WHERE handle = $1
    RETURNING handle`, [handle]);
    return company.rows[0];
  }
}

module.exports = Company;