Cypress.Commands.add("createImage", (name, sylabs_path, parameters) => {
  const insertImageQuery = `INSERT INTO images_table (name, sylabs_path, parameters) VALUES ('${name}', '${sylabs_path}', '${JSON.stringify(
    parameters
  )}') RETURNING id`;

  cy.log("Inserting image with query:", insertImageQuery);

  return cy.query(insertImageQuery).then((result) => {
    cy.log("Insert image result:", result);
    expect(result.rowCount).to.be.greaterThan(0);
    const imageId = result.rows[0].id;

    const getRoleIdQuery = `SELECT id FROM roles_table WHERE name = 'AI Researcher'`;
    cy.log("Retrieving role ID with query:", getRoleIdQuery);

    return cy.query(getRoleIdQuery).then((roleResult) => {
      cy.log("Get role ID result:", roleResult);
      expect(roleResult.rowCount).to.be.greaterThan(0);
      const roleId = roleResult.rows[0].id;

      const insertAssociationQuery = `INSERT INTO images_roles (image_id, role_id) VALUES (${imageId}, ${roleId})`;
      cy.log("Inserting association with query:", insertAssociationQuery);

      return cy.query(insertAssociationQuery).then(() => {
        cy.log("Association inserted successfully");

        const verifyAssociationQuery = `SELECT * FROM images_roles WHERE image_id = ${imageId} AND role_id = ${roleId}`;
        cy.log("Verifying association with query:", verifyAssociationQuery);

        return cy.query(verifyAssociationQuery).then((verifyResult) => {
          cy.log("Verify association result:", verifyResult);
          expect(verifyResult.rowCount).to.be.greaterThan(0);

          return cy.wrap({
            id: imageId,
            name: name,
            sylabs_path: sylabs_path,
            parameters: parameters,
          });
        });
      });
    });
  });
});
