const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe("partialUpdate()", () => {
  // it("should generate a proper partial update query with just 1 field",
  //     function () {

  //   // FIXME: write real tests!
  //   expect(false).toEqual(true);

  // });
  test("should generate a proper partial update query with just 1 field", 
    () => {
      const table = "whatever";
      const items = {
        _badValue: "Don't add",
        goodValue: "nothing",
        valueToChange: "something"
      }
      const key = "username";
      const id = "name";
      const response = sqlForPartialUpdate(table, items, key, id);
      console.log("SQL PATCH return: ", response);
  })
});
