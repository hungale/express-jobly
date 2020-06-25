const Job = require('../../models/job');
const Company = require('../../models/company');
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let id;
beforeEach(async () => {

  let response = await request(app).post('/companies').send({
    "handle": "apple",
    "name": "apple",
    "num_employees": 12,
    "description": "nope",
    "logo_url": "w/e"
  });

  let responseJob = await request(app).post('/jobs').send({
    "title": "SOFTWARE ENGINEER",
    "salary": 33223.32,
    "equity": 0.2,
    "company_handle": "apple"
  });
  
 id = responseJob.body.job.id;

  await request(app).post('/jobs').send({
    "title": "Swift",
    "salary": 99999.32,
    "equity": 0.99,
    "company_handle": "apple"
  });

});

describe('TESTING GET/POST/PATCH/DELETE', () => {
  test('if post is adding records to db', async () => {
    let response = await request(app).post('/jobs').send({
      "title": "tech",
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "apple"
    });
    
    expect(response.body.job).toHaveProperty('title');
    expect(response.body.job.title).toEqual('tech');
    expect(response.statusCode).toEqual(201);

    response = await request(app).get(`/jobs/${response.body.job.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.job.salary).toEqual(68999.32);
    

    response = await request(app).get(`/companies/apple`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.jobs.length).toEqual(3);
    

    response = await request(app).get(`/jobs`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.jobs.length).toEqual(3);
  });

  test('sad path POST', async () => {
    let response = await request(app).post('/jobs').send({
      "title": "tech",
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "hi"
    });
    let response2 = await request(app).post('/jobs').send({
      "title": 123,
      "salary": 68999.32,
      "equity": 0.55,
      "company_handle": "hi"
    });
    expect(response.statusCode).toEqual(404);
    expect(response.body.message).toEqual('Company does not exist in our records');
    expect(response2.statusCode).toEqual(400);
  });

  test('get all with query strings', async () => {
    let response = await request(app).get('/jobs?min_salary=50000');
    expect(response.body.jobs.length).toEqual(1);

    response = await request(app).get('/jobs?min_salary=50000&min_equity=0.1');
    expect(response.body.jobs.length).toEqual(1);

    response = await request(app).get('/jobs?min_salary=1000000&min_equity=0.1');
    expect(response.body.jobs.length).toEqual(0);

    response = await request(app).get('/jobs?search=apple');
    console.log(response.body);
    expect(response.body.jobs.length).toEqual(2);

    response = await request(app).get('/jobs?search=mapple');
    expect(response.body.jobs.length).toEqual(0);
    
  });

  test('DELETE', async () => {
    let response = await request(app).delete(`/jobs/${id}`);
   
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: `Job was deleted` });
  });

  test('PATCH', async () => {
    let response = await request(app).patch(`/jobs/${id}`).send({ "title": "data science" });

    expect(response.statusCode).toEqual(200);
    expect(response.body.job.title).toEqual('data science');
  });

});








afterEach(async () => {
  await db.query(`DELETE FROM jobs;`);
  await db.query(`DELETE FROM companies;`);
});
afterAll(async () => {
  await db.end();
});
