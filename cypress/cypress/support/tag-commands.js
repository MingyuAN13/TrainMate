import { faker } from '@faker-js/faker';

Cypress.Commands.add("createTag", (name, type) => {
    if (!name) {
        name = faker.word.noun();
    }
    if (!type) {
        type = "custom";
    }

    const insertQuery = `INSERT INTO tags_table (name, type) VALUES ('${name}', '${type}') ON CONFLICT (name) DO NOTHING`;

    cy.query(insertQuery);
    return cy
        .query(`SELECT * FROM tags_table WHERE name = '${name}' AND type = '${type}'`)
        .then((result) => {
            expect(result.rowCount).to.be.greaterThan(0);
            return {
                id: result.rows[0].id,
                name: name,
                type: type,
            };
        });
});

Cypress.Commands.add("createTagUser", (name) => {
  const insertQuery = `INSERT INTO tags_table (name, type) VALUES ('${name}', 'user')`;

  cy.query(insertQuery);
  return cy
    .query(`SELECT * FROM tags_table WHERE name = '${name}'`)
    .then((result) => {
      expect(result.rowCount).to.be.greaterThan(0);
      return {
        id: result.rows[0].id,
        name: name,
        type: "user",
      };
    });
});

Cypress.Commands.add("getTagUserID", (name, type) => {
  const fetchTagQuery = `SELECT id FROM tags_table WHERE name = '${name}' AND type = '${type}'`;
  return cy.task("runQuery", fetchTagQuery).then((tagResult) => {
    if (tagResult.rowCount > 0) {
      return tagResult.rows[0].id;
    } else {
      const insertTagQuery = `INSERT INTO tags_table (name, type) VALUES ('${name}', '${type}') RETURNING id`;
      return cy.task("runQuery", insertTagQuery).then((insertTagResult) => {
        expect(insertTagResult.rowCount).to.be.greaterThan(0);
        return insertTagResult.rows[0].id;
      });
    }
  });
});