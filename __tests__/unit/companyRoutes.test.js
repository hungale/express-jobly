const Company = require('../../models/company');
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');


let handle;
beforeEach(async() => {
  let response = await request(app).post('/companies').send({
      "handle": "apple",
      "name": "apple",
      "num_employees": 12,
      "description": "nope",
      "logo_url": "w/e"
  });
  handle = response.body.company.handle;
});


describe('Testing GET all companies', () => {
  test('GET /companies', async () => {
    const response = await request(app).get('/companies');
    
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.companies[0].handle).toBe("apple");
  });
  test('GET /companies with search query param', async () => {
    const response = await request(app).get(`/companies?search=${handle}`);
    
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
  });
  test('GET /companies with min/max query param happy', async () => {
    let response = await request(app).get(`/companies?min_employees=12`);
    
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.companies[0].handle).toBe("apple");

    response = await request(app).get(`/companies?max_employees=12`);
    
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.companies[0].handle).toBe("apple");


    response = await request(app)
    .get(`/companies?min_employees=12&max_employees=12`);
    
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body.companies[0].handle).toBe("apple");
  });
  test('GET /companies with max_employees query param sad', async () => {
    const response = await request(app)
    .get(`/companies?min_employees=100&max_employees=12`);
    
    expect(response.statusCode).toEqual(400);
  });
});

describe('POST', () => {
  test('POST new company happy path (also GET)', async () => {
    // check that it was added
    let response = await request(app).get("/companies");
    expect(response.body.companies.length).toBe(1);
    
    response = await request(app).post('/companies').send({
      "handle": "mapple",
      "name": "mapple",
      "num_employees": 123,
      "description": "nope",
      "logo_url": "w/e"
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.company).toHaveProperty("handle");
    expect(response.body.company).toHaveProperty("name");
    
    // check that it was added
    response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(2);

    // test GET /:handle on the company just made
    response = await request(app).get("/companies/mapple");
    expect(response.statusCode).toBe(200);
    expect(response.body.company).toHaveProperty("handle");
  });
  test('POST new company sad path', async () => {
    let response = await request(app).post('/companies').send({
      "num_employees": 123,
      "description": "nope",
      "logo_url": "w/e"
    });
    expect(response.statusCode).toBe(400);
    
  });
});
describe('PATCH', () => {
  test('PATCH happy path', async () => {
    let response = await request(app).patch(`/companies/${handle}`)
    .send({
      "num_employees": 123
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.company.num_employees).toBe(123);
  });
  test('PATCH sad path', async () => {
    let response = await request(app).patch(`/companies/${handle}`)
    .send({
      "num_employees": "123",
    });
    expect(response.statusCode).toBe(400);
    
    response = await request(app).patch(`/companies/notcompany`)
    .send({
      "num_employees": 123,
    });
    expect(response.statusCode).toBe(404);
  });
});
describe('DELETE', () => {

  test('DELETE happy path', async () => {
    let response = await request(app).delete(`/companies/${handle}`);
    
    expect(response.statusCode).toBe(200);
    // check that it was deleted
    response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(0);
  });

  test('PATCH sad path', async () => {
    let response = await request(app).delete(`/companies/${handle}`);
    
    expect(response.statusCode).toBe(200);
    // check that it was deleted
    response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(0);

    // check that you can't delete it again
    response = await request(app).delete(`/companies/${handle}`);
    expect(response.statusCode).toBe(404);
    
    // check that you can't delete a non existing company
    response = await request(app).delete(`/companies/notcompany`);
    
    expect(response.statusCode).toBe(404);
  });
});

afterEach(async () => {
  await db.query(`DELETE FROM companies;`);
});
afterAll(async () => {
  await db.end();
});