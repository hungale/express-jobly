process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

const adminUser = "gg";
const adminPassword = "password";
let token;
beforeAll(async () => {
  // create admin user
  let response = await request(app).post('/users').send({
    "username": "gg",
    "password": "password",
    "first_name": "gg",
    "last_name": "man",
    "email": "gg",
    "photo_url": "nope"
  });
  token = response.body.token;
  response = await request(app).patch('/users/gg')
  .send({"is_admin":true, "token": token});

  response = await request(app).post('/login').send({
    "username": "gg",
    "password": "password"
  });
  let { token:respToken } = response.body;
  token = respToken;
  let test = {
    "username": "gg",
    "password": "password",
    token
  }
});

let id;
beforeEach(async () => {

 await request(app).post('/companies').send({
    "handle": "apple",
    "name": "apple",
    "num_employees": 12,
    "description": "nope",
    "logo_url": "w/e",
    token
  });

  let responseJob = await request(app).post('/jobs').send({
    "title": "SOFTWARE ENGINEER",
    "salary": 33223.32,
    "equity": 0.2,
    "company_handle": "apple",
    token
  });
  
 id = responseJob.body.job.id;

  await request(app).post('/jobs').send({
    "title": "Swift",
    "salary": 99999.32,
    "equity": 0.99,
    "company_handle": "apple",
    token
  });
});

afterEach(async () => {
  await db.query(`DELETE FROM jobs;`);
  await db.query(`DELETE FROM companies;`);
});

describe('TESTING GET/POST/PATCH/DELETE FOR JOBS', () => {
  test('POST', async () => {
    let response = await request(app).post('/jobs').send({
      "title": "tech",
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "apple",
      token
    });
    
    expect(response.body.job).toHaveProperty('title');
    expect(response.body.job.title).toEqual('tech');
    expect(response.statusCode).toEqual(201);


    response = await request(app).get(`/jobs/${response.body.job.id}`).send({token});
    expect(response.statusCode).toEqual(200);
    expect(response.body.job.salary).toEqual(68999.32);
    

    response = await request(app).get(`/companies/apple`).send({token});
    expect(response.statusCode).toEqual(200);
    expect(response.body.jobs.length).toEqual(3);
    

    response = await request(app).get(`/jobs`).send({token});
    expect(response.statusCode).toEqual(200);
    expect(response.body.jobs.length).toEqual(3);
  });

  test('sad path POST', async () => {
    let response = await request(app).post('/jobs').send({
      "title": "tech",
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "hi",
      token
    });
    let response2 = await request(app).post('/jobs').send({
      "title": 123,
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "hi",
      token
    });
    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Company does not exist in our records');
    expect(response2.statusCode).toEqual(400);
  });

  test('GET WITH QUERY STRINGS', async () => {
    let response = await request(app).get('/jobs?min_salary=50000').send({token});
    expect(response.body.jobs.length).toEqual(1);

    response = await request(app).get('/jobs?min_salary=50000&min_equity=0.1').send({token});
    expect(response.body.jobs.length).toEqual(1);

    response = await request(app).get('/jobs?min_salary=1000000&min_equity=0.1').send({token});
    expect(response.body.jobs.length).toEqual(0);

    response = await request(app).get('/jobs?search=apple').send({token});
    expect(response.body.jobs.length).toEqual(2);

    response = await request(app).get('/jobs?search=mapple').send({token});
    expect(response.body.jobs.length).toEqual(0);
    
  });

  test('DELETE', async () => {
    let response = await request(app).delete(`/jobs/${id}`).send({token});
   
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: `Job was deleted` });
  });

  test('PATCH', async () => {
    let response = await request(app).patch(`/jobs/${id}`).send({ 
      "title": "data science",
      token
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.job.title).toEqual('data science');
  });

});

afterAll(async () => {
  await db.query(`DELETE FROM users;`);
  await db.end();
});
