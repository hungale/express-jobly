const express = require("express");
const Company = require("../models/company");
const ExpressError = require('../expressError');
const router = new express.Router();

/** GET / - get list of handles and names for all company objects
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async (req, res, next) =>  {
  try {

    const companies = await Company.all(req.query);
    return res.json({companies})
  } catch(err) {
    return next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    return res.status(201).json({company});
  } catch(err) {
    return next(err);
  }
});

router.get('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const company = await Company.getBy(handle);
    return res.json({ company })

  } catch (err) {
    return next(err);
  }
})

router.patch('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const company = await Company.update(handle, req.body);
    return res.json({ company });
  } catch (err) {
  }
})

router.delete('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;
    const company = await Company.delete(handle);
    return res.json({message: `${company.handle} deleted`})
  } catch (err) {
    return next(err);
  }
})

module.exports = router;