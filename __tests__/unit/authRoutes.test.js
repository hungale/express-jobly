process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

const username = "abcman";
const password = "password";
const adminUser = "gg";
const adminPassword = "password";
let adminToken;
let token;
let handle;
let jobId;
let authPaths;
beforeAll(async () => {
  // create regular user
  let response = await request(app).post('/users').send({
    "username": "abcman",
    "password": "password",
    "first_name": "abc",
    "last_name": "man",
    "email": "noped",
    "photo_url": "nope"
  });
  token = response.body.token;

  // create admin user
  response = await request(app).post('/users').send({
    "username": "gg",
    "password": "password",
    "first_name": "gg",
    "last_name": "man",
    "email": "gg",
    "photo_url": "nope"
  });
  adminToken = response.body.token;
  response = await request(app).patch('/users/gg')
  .send({"is_admin":true, "token": adminToken});

  response = await request(app).post('/login').send({
    "username": "gg",
    "password": "password"
  });
  let { token:respToken } = response.body;
  adminToken = respToken;

  // create company
  response = await request(app).post('/companies').send({
    "handle": "apple",
    "name": "apple",
    "num_employees": 12,
    "description": "nope",
    "logo_url": "w/e",
    "token": adminToken
  });
  handle = response.body.company.handle;

  // create jobs
  response = await request(app).post('/jobs').send({
    "title": "SOFTWARE ENGINEER",
    "salary": 33223.32,
    "equity": 0.2,
    "company_handle": "apple",
    "token": adminToken
  });

  jobId = response.body.job.id;

  await request(app).post('/jobs').send({
    "title": "appleman",
    "salary": 99999.32,
    "equity": 0.99,
    "company_handle": "apple",
    "token": adminToken
  });
  authPaths = [
    `/jobs`,
    `/jobs/${jobId}`,
    `/companies`,
    `/companies/${handle}`
  ]
});

describe("testing auth: authentication", () => {
  test("GET authPaths happy path", async () => {
    let response;
    for(let path of authPaths) {
      response = await request(app).get(path).send({token});
      expect(response.statusCode).toBe(200);
    }
  }); 
  test("GET authPaths sad path (no login)", async () => {
    let response;
    for(let path of authPaths) {
      response = await request(app).get(path);
      expect(response.statusCode).toBe(401);
    }
  }); 
});

describe("testing auth: user authorization", () => {
  describe("PATCH", () => {
    test("PATCH happy path", async () => {
      const response = await request(app).patch(`/users/${adminUser}`).send({
        "first_name": "ggg",
        "token": adminToken
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.user.first_name).toBe("ggg");
    });
    test("PATCH sad path (incorrect user)", async () => {
      const response = await request(app).patch(`/users/${adminUser}`).send({
        "first_name": "ggg",
        "token": token
      });
      expect(response.statusCode).toBe(403);
    });
    test("PATCH sad path (not logged in/no token)", async () => {
      const response = await request(app).patch(`/users/${adminUser}`).send({
        "first_name": "ggg"
      });
      expect(response.statusCode).toBe(401);
    }); 
  });


  describe("DELETE", () => {
    test("DELETE sad path (incorrect user)", async () => {
      const response = await request(app).delete(`/users/${adminUser}`).send({
        "token": token
      });
      expect(response.statusCode).toBe(403);
    }); 
    test("DELETE sad path (no login)", async () => {
      const response = await request(app).delete(`/users/${adminUser}`)
      expect(response.statusCode).toBe(401);
    }); 
    test("DELETE happy path", async () => {
      const response = await request(app).delete(`/users/${username}`).send({
        "token": token
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: `User ${username} deleted` });
    }); 
  })
});


describe("testing auth: admin authorization", () => {
  test("DELETE sad path (no user)", async () => {
    let response = await request(app).delete(`/companies/${handle}`);
    expect(response.statusCode).toBe(401);
  }); 
  test("DELETE sad path (not admin)", async () => {
    let response = await request(app).delete(`/companies/${handle}`).send({
      "token": token
    });
    expect(response.statusCode).toBe(403);
  }); 
  test("DELETE happy path", async () => {
    let response = await request(app).delete(`/companies/${handle}`).send({
      "token": adminToken
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: `${handle} deleted` });

    response = await request(app).get('/companies').send({token});
    expect(response.body.companies.length).toBe(0);
    response = await request(app).get('/jobs').send({token});
    expect(response.body.jobs.length).toBe(0);
  }); 
});


afterEach(async () => {
});

afterAll(async () => {
  await db.query(`DELETE FROM companies;`);
  await db.query(`DELETE FROM jobs;`);
  await db.query(`DELETE FROM users;`);
  await db.end();
});