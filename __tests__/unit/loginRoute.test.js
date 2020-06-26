process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let username;
let password;
let token;
beforeEach(async () => {
  let response = await request(app).post('/users').send({
    "username": "abcdman",
    "password": "password",
    "first_name": "abc",
    "last_name": "man",
    "email": "noped",
    "photo_url": "nope"
  });

  username = "abcdman";
  password = "password";
  token = response.body.token;
});

afterEach(async () => {
  await db.query(`DELETE FROM users;`);
});

afterAll(async () => {
  await db.end();
});


describe('TESTING login', () => {
  test('login successful', async () => {
    const response = await request(app).post('/login').send({
      "username": "abcdman",
      "password": "password",
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('token');
  });
  test('login unsuccessful (invalid username)', async () => {
    const response = await request(app).post('/login').send({
      "username": "abcman",
      "password": "password",
    });

    expect(response.statusCode).toEqual(400);
  });
  test('login unsuccessful (invalid password)', async () => {
    const response = await request(app).post('/login').send({
      "username": "abcdman",
      "password": "g",
    });

    expect(response.statusCode).toEqual(400);
  });

});