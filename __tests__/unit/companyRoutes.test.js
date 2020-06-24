const Company = require('../../models/company');
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

beforeEach(async() => {
  let response = await request(app).post('/companies').send({
      "handle": "apple",
      "name": "apple",
      "num_employees": "12",
      "description": "nope",
      "logo_url": "w/e"
  })
  console.log(response);
  // await request(app).post('/companies').send({

  // })
})

afterEach(async () => {
  await db.query(`DELETE FROM companies;`)
})

describe('Testing complex get request for companies handle/ name', () => {
  test('Testing if JSON received is correct step1 and db query step2', async () => {
    const response = await request(app).get('/companies');
    console.log(response.body);
    expect(response.body).toEqual({
      "companies": [{
          "handle": "apple",
          "name": "apple"
      }]
    });
    expect(response.statusCode).toEqual(200);
  });
});