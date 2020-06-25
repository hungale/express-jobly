process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let username;
beforeEach(async () => {
  let response = await request(app).post('/users').send({
    "username":"abcdman",
    "password":"password",
    "first_name":"abc", 
    "last_name":"man",
    "email":"noped",
    "photo_url":"nope"
  });
  
 username = response.body.user.username;
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
      "username":"abcman",
      "password":"password",
      "first_name":"abc", 
      "last_name":"man",
      "email":"nope",
      "photo_url":"nope"
    });

    expect(response.body.user).toHaveProperty('username');
    expect(response.body.user.username).toEqual('abcman');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.statusCode).toEqual(201);

    // check the DB
    const getResponse = await request(app).get("/users");

    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.users.length).toEqual(2);
  });
  test("POST a user sad path (invalid input)", async () => {
    const response = await request(app).post(`/users`).send({
      "username":"abcman",
      "password":"password",
      "first_name":123, 
      "last_name":"man",
      "email":"nope",
      "photo_url":"nope"
    });
    expect(response.statusCode).toEqual(400);
  });
  test("POST a user sad path (missing input)", async () => {
    const response = await request(app).post(`/users`).send({
      "first_name":"abc"
    });
    expect(response.statusCode).toEqual(400);
  });

  test("POST sad path (duplicate username)", async () => {
    const response = await request(app).post('/users').send({
      "username":"abcdman",
      "password":"password",
      "first_name":"abc", 
      "last_name":"man",
      "email":"nope",
      "photo_url":"nope"
    });
    expect(response.statusCode).toEqual(400);
  });
  test("POST sad path (duplicate email)", async () => {
    const response = await request(app).post('/users').send({
      "username":"abcman",
      "password":"password",
      "first_name":"abc", 
      "last_name":"man",
      "email":"noped",
      "photo_url":"nope"
    });
    expect(response.statusCode).toEqual(400);
  });
  
});

describe('TESTING GET', () => {
  test("GET all users", async () => {
    const response = await request(app).get("/users");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toEqual(1);
    expect(response.body.users[0].username).toEqual('abcdman');
  });
  test("GET a user", async () => {
    const response = await request(app).get(`/users/${username}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toEqual('abcdman');
  });
  test("GET a user sad path (invaid user)", async () => {
    const response = await request(app).get(`/users/abcman`);

    expect(response.statusCode).toEqual(404);
  });
});

describe('TESTING PATCH', () => {
  test("GET all users", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "first_name":"abcd", 
      "last_name":"man",
      "photo_url":"nope"
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.user.first_name).toEqual("abcd");

    const getResponse = await request(app).get("/users");
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.users.length).toEqual(1);
    expect(getResponse.body.users[0].username).toEqual('abcdman');
  });
  
  test("PATCH a user sad path (invalid input)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "first_name":123
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing username)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "username":"abcman"
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing password)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "password":"password"
    });
    expect(response.statusCode).toEqual(400);
  });
  test("PATCH a user sad path (changing email)", async () => {
    const response = await request(app).patch(`/users/${username}`).send({
      "email":"nope"
    });
    expect(response.statusCode).toEqual(400);
  });
  
});

describe('TESTING DELETE', () => {
  test("DELETE a user happy path", async () => {
    const response = await request(app).delete(`/users/${username}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: `User ${username} deleted` });
  });
  test("DELETE a user sad path", async () => {
    const response = await request(app).delete(`/users/abcman`);

    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual("Cannot delete a user that does not exist.");
  });
});