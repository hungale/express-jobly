process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let username = "abcdman";
let password = "password";
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

  token = response.body.token;
  response = await request(app).patch('/users/abcdman')
  .send({"is_admin":true, "token": token});

  response = await request(app).post('/login').send({
    "username": "abcdman",
    "password": "password"
  });
  const { token:respToken } = response.body;
  token = respToken;
});


afterEach(async () => {
  await db.query(`DELETE FROM users;`);
});

afterAll(async () => {
  await db.end();
});

describe('TESTING POST users', () => {
  test('POST', async () => {
    const response = await request(app).post('/users').send({
      "username": "abcman",
      "password": "password",
      "first_name": "abc",
      "last_name": "man",
      "email": "nope",
      photo_url: "nope", // can be done w/o quotes
      token
    });

    expect(response.body).toHaveProperty('token');

    expect(response.statusCode).toEqual(201);

    // check the DB
    const getResponse = await request(app).get("/users").send({token});

    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.users.length).toEqual(2);
  });
  test("POST a user sad path (invalid input)", async () => {
    const response = await request(app).post(`/users`).send({
      "username": "abcman",
      "password": "password",
      "first_name": 123,
      "last_name": "man",
      "email": "nope",
      "photo_url": "nope",
      token
    });
    expect(response.statusCode).toEqual(400);
  });
  test("POST a user sad path (missing input)", async () => {
    const response = await request(app).post(`/users`).send({
      "first_name": "abc",
      token
    });
    expect(response.statusCode).toEqual(400);
  });

  test("POST sad path (duplicate username)", async () => {
    const response = await request(app).post('/users').send({
      "username": "abcdman",
      "password": "password",
      "first_name": "abc",
      "last_name": "man",
      "email": "nope",
      "photo_url": "nope",
      token
    });
    expect(response.statusCode).toEqual(400);
  });
  test("POST sad path (duplicate email)", async () => {
    const response = await request(app).post('/users').send({
      "username": "abcman",
      "password": "password",
      "first_name": "abc",
      "last_name": "man",
      "email": "noped",
      "photo_url": "nope",
      token
    });
    expect(response.statusCode).toEqual(400);
  });

});

describe('TESTING GET', () => {
  test("GET all users", async () => {
    const response = await request(app).get("/users").send({token});

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toEqual(1);
    expect(response.body.users[0].username).toEqual('abcdman');
  });
  test("GET a user", async () => {
    const response = await request(app).get(`/users/${username}`).send({token});

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toEqual('abcdman');
  });
  test("GET a user sad path (invaid user)", async () => {
    const response = await request(app).get(`/users/abcman`).send({token});

    expect(response.statusCode).toEqual(404);
  });
});

describe('TESTING PATCH', () => {
  test("GET all users", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "first_name": "abcd",
      "last_name": "man",
      "photo_url": "nope",
      token
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.user.first_name).toEqual("abcd");

    const getResponse = await request(app).get("/users").send({token});
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.users.length).toEqual(1);
    expect(getResponse.body.users[0].username).toEqual('abcdman');
  });

  test("PATCH a user sad path (invalid input)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "first_name": 123,
      token
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing username)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "username": "abcman",
      token
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing password)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "password": "password",
      token
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing email)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "email": "nope",
      token
    });
    expect(response.statusCode).toEqual(400);
  });

});

describe('TESTING DELETE', () => {
  test("DELETE a user happy path", async () => {
    const response = await request(app).delete(`/users/${username}`)
    .send({token});

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: `User ${username} deleted` });
  });
  test("DELETE a user sad path", async () => {
    const response = await request(app).delete(`/users/abcman`).send({token});

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual("Cannot delete a user that does not exist.");
  });
});