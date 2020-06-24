const db = require("../db");


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
    if(queryArr) {
      baseQuery += " WHERE " + arr.join(" AND ");
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
}

module.exports = Company;