beforeEach(() => {
  cy.resetDatabase();
});

describe("Image creation", () => {
  it("Should create image if all fields are filled correctly including parameters", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "New Image";
    const imagePath = "/path/to/image";
    const parameter = "parameter1";
    const role = "Admin";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);

    // Add parameters
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();

    // Select roles
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();

    cy.get('[data-cy="table-row"]').should("contain", "New Image");
    cy.get('[data-cy="table-row"]').should("contain", "/path/to/image");
    cy.get('[data-cy="table-row"]').should("contain", "parameter1");
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
  });
  it("Should create image if all fields are filled correctly excluding parameters", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "New Image";
    const imagePath = "/path/to/image";
    const role = "Admin";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);

    // Select roles
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();

    cy.get('[data-cy="table-row"]').should("contain", "New Image");
    cy.get('[data-cy="table-row"]').should("contain", "/path/to/image");
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
  });
  it("Should not allow creation if name is empty", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imagePath = "/path/to/image";
    const parameter = "parameter1";
    const role = "Admin";

    // Fill out the form
    cy.get("[data-cy=path-input]").type(imagePath);

    // Add parameters
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();

    // Select roles
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();
    cy.get("[data-cy=name-error]").should("contain", "Image Name is required");
  });
  it("Should not allow creation if path is empty", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "New Image";
    const parameter = "parameter1";
    const role = "Admin";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);

    // Add parameters
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();

    // Select roles
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();
    cy.get("[data-cy=path-error]").should("contain", "Sylabs Path is required");
  });
  it("Should not allow creation if roles are empty", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "New Image";
    const imagePath = "/path/to/image";
    const parameter = "parameter1";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);

    // Add parameters
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();
    cy.get("[data-cy=roles-error]").should(
      "contain",
      "At least one role must be selected"
    );
  });
  it("Should not allow creation if image name is not unique", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImage("Duplicate Image", "library/visiontransformer", ["EPOCHS"]);

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "Duplicate Image";
    const imagePath = "/unique/path";
    const parameter = "parameter1";
    const role = "Admin";

    // Create the first image
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();
    cy.get("[data-cy=add-modal-action]").click();

    cy.get("[data-cy=name-error]").should(
      "contain",
      "Image Name must be unique"
    );
  });
  it("Should not allow creation if path name is not unique", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImage("Duplicate Image", "library/visiontransformer", ["EPOCHS"]);

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "Duplicate Image";
    const imagePath = "library/visiontransformer";
    const parameter = "parameter1";
    const role = "Admin";

    // Create the first image
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();
    cy.get("[data-cy=add-modal-action]").click();

    cy.get("[data-cy=path-error]").should(
      "contain",
      "Sylabs Path must be unique"
    );
  });
  it("Should not allow creation if path length exceeds 150 characters", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "New Image";
    const longImagePath = "/".repeat(151);
    const parameter = "parameter1";
    const role = "Admin";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(longImagePath);
    cy.get("[data-cy=parameter-input]").type(parameter);
    cy.get("[data-cy=parameter-button]").click();
    cy.get("[data-cy=roles-checkbox-group]").contains(role).click();
    cy.get("[data-cy=add-modal-action]").click();

    cy.get("[data-cy=path-error]").should(
      "contain",
      "Sylabs Path must be between 1 and 150 characters"
    );
  });

  it("Should not allow creation if image name length exceeds 150 characters", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get("[data-cy=add-button]").click();
    cy.get("[data-cy=add-modal]").should("be.visible");

    const imageName = "a".repeat(151);
    const imagePath = "/path/to/image";
    const requiredRole = "Admin";

    // Fill out the form
    cy.get("[data-cy=name-input]").type(imageName);
    cy.get("[data-cy=path-input]").type(imagePath);

    // Add a long role name
    cy.get("[data-cy=roles-checkbox-group]").contains(requiredRole).click();

    // Submit the form
    cy.get("[data-cy=add-modal-action]").click();
    cy.get("[data-cy=name-error]").should(
      "contain",
      "Image Name must be between 1 and 150 characters"
    );
  });
});
