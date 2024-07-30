// Utility function to insert a new image into the images_table
function insertImage(name, sylabs_path, parameters) {
  const insertImageQuery = `INSERT INTO images_table (name, sylabs_path, parameters) VALUES ('${name}', '${sylabs_path}', '${JSON.stringify(
    parameters
  )}') RETURNING id`;
  return cy.task("runQuery", insertImageQuery).then((result) => {
    expect(result.rowCount).to.be.greaterThan(0);
    return result.rows[0].id;
  });
}

// Utility function to get the ID of a role by its name, or insert it if it doesn't exist
function getRoleIdByName(roleName) {
  const fetchRoleQuery = `SELECT id FROM roles_table WHERE name = '${roleName}'`;
  return cy.task("runQuery", fetchRoleQuery).then((roleResult) => {
    if (roleResult.rowCount > 0) {
      return roleResult.rows[0].id;
    } else {
      const insertRoleQuery = `INSERT INTO roles_table (name) VALUES ('${roleName}') RETURNING id`;
      return cy.task("runQuery", insertRoleQuery).then((insertRoleResult) => {
        expect(insertRoleResult.rowCount).to.be.greaterThan(0);
        return insertRoleResult.rows[0].id;
      });
    }
  });
}

// Utility function to associate an image with a role
function insertImageRoleRelation(imageId, roleId) {
  const insertAssociationQuery = `INSERT INTO images_roles (image_id, role_id) VALUES (${imageId}, ${roleId})`;
  return cy.task("runQuery", insertAssociationQuery);
}

Cypress.Commands.add(
  "createImageWithRole",
  (name, sylabs_path, parameters, roleName) => {
    // Step 1: Insert the image and get its ID
    insertImage(name, sylabs_path, parameters).then((imageId) => {
      // Step 2: Get the role ID (or insert the role if it doesn't exist)
      getRoleIdByName(roleName).then((roleId) => {
        // Step 3: Associate the image with the role
        insertImageRoleRelation(imageId, roleId).then(() => ({
          id: imageId,
          name: name,
          sylabs_path: sylabs_path,
          parameters: parameters,
          role: roleName,
        }));
      });
    });
  }
);

// Command to create an image with multiple roles
Cypress.Commands.add(
  "createImageWithTwoRoles",
  (name, sylabs_path, parameters, roleNames) => {
    // Step 1: Insert the image and get its ID
    insertImage(name, sylabs_path, parameters).then((imageId) => {
      // Step 2: Iterate through the roles and associate each with the image
      roleNames.forEach((roleName) => {
        getRoleIdByName(roleName).then((roleId) => {
          insertImageRoleRelation(imageId, roleId);
        });
      });
    });
  }
);
