const express = require("express");
const Company = require("../models/company");
const ExpressError = require('../expressError');
const router = new express.Router();
const jsonSchema = require('jsonschema');
const companySchema = require("../schemas/companySchema.json");
const companySchemaUpdate = require("../schemas/companySchemaUpdate.json");

/** GET / - get list of handles and names for all company objects
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next) =>  {
  try {
    const companies = await Company.all(req.query);
    
    return res.json({companies});
  } catch(err) {
    return next(err);
  }
});

/** POST / - add a new company
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.post("/", async (req, res, next) => {
  try {
    const result = jsonSchema.validate(req.body, companySchema);

    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    const company = await Company.create(req.body);
    return res.status(201).json({company});
  } catch(err) {
    return next(err);
  }
});

/** GET /:handle -  get a company by handle
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const company = await Company.getBy(handle);
    
    return res.json(company);
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:handle - update a company by handle
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.patch('/:handle', async (req, res, next) => {
  try {
    
    const result = jsonSchema.validate(req.body, companySchemaUpdate);
    if(!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    
    const { handle } = req.params;
    const company = await Company.update(handle, req.body);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /:handle - delete a company by handle
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.delete('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;

    const company = await Company.delete(handle);
    
    return res.json({message: `${company.handle} deleted`})
  } catch (err) {
    return next(err);
  }
});

module.exports = router;