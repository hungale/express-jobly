const db = require("../db");
const ExpressError = require('../expressError');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BCRYPT_WORKFACTOR, SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');

/** User Class to add/get/update/delete user */
class User {
  /** Create a new user */
  static async create({username, password, first_name, last_name, email, photo_url}) {
    
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORKFACTOR);
    
    const user = await db.query(
      `INSERT INTO users 
        (username, password, first_name, last_name,
        email, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );

    if(!user.rows.length) {
      throw new ExpressError("This user already exists.", 404);
    }

    const { is_admin } = user.rows[0];
    const payload = { username, is_admin };
    user.rows[0]._token = jwt.sign(payload, SECRET_KEY )
    
    return user.rows[0];
  }

  static async all() {
    const users = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );

    return users.rows;
  }

  static async get(username) {
    const user = await db.query(
      `SELECT username, first_name, last_name, email, photo_url
        FROM users
        WHERE username=$1`,
      [username]
    );

    if(!user.rows.length) {
      throw new ExpressError("No matching user.", 404);
    }

    return user.rows[0];
  }

  static async update(username, updateValues) {
    const { query, values } = partialUpdate('users', updateValues, 
                                            'username', username);
    const user = await db.query(query, values);

    if(!user.rows.length) {
      throw new ExpressError("No matching user.", 404);
    }

    // take out the password
    delete user.rows[0].password;

    return user.rows[0];
  }

  static async delete(username) {
    const user = await db.query(
      `DELETE FROM users
        WHERE username=$1
      RETURNING username`,
      [username]
    );
    if (!user.rows.length) {
      throw new ExpressError("Cannot delete a user that does not exist.", 404);
    }
    
    return user.rows[0];
  }

  static async login({username, password}) {
    const response = await db.query(
      `SELECT password, username, is_admin
      FROM users
      WHERE username=$1`,
      [username]
    );
    if(!response.rows.length) {
      throw new ExpressError("No such user.", 400);
    }

    const { password: hashedPassword } = response.rows[0];

    const validPassword = await bcrypt.compare(password, hashedPassword);
    if(validPassword) {
      const payload = response.rows[0];
      delete payload.password;

      const token = jwt.sign(payload, SECRET_KEY);

      return token;
    }
    throw new ExpressError("Invalid user/password", 400);
  }
}

module.exports = User;