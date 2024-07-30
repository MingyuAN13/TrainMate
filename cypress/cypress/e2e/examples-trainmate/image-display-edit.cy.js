beforeEach(() => {
  cy.resetDatabase();
});

describe("Data displaying", () => {
  it("Should filter on image name", () => {
    cy.createImage("visiontransformer", "library/visiontransformer", [
      "EPOCHS",
    ]);
    cy.createImage("resnet", "library/resnet", ["EPOCHS"]);
    cy.createMaintainerUserWithSession("maintainer@example.com");

    cy.visit(`app/images`);

    cy.get('[data-cy="image-table-wrapper"]').should("be.visible");
    cy.get('[data-cy="table-row"]').should("contain", "visiontransformer");
    cy.get('[data-cy="table-row"]').should("contain", "resnet");

    // Filter by email
    cy.get('[data-cy="image-search"]').should("be.visible").type("vision");

    cy.get('[data-cy="table-row"]').should("contain", "visiontransformer");
    cy.get('[data-cy="table-row"]').should("not.contain", "resnet");
  });

  it("Should open side menu when pressing on image row in table", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    cy.get('[data-cy="image-name-input"]').should(
      "have.attr",
      "placeholder",
      "visiontransformer"
    );

    cy.get('[data-cy="image-checkbox-group"]')
      .contains("AI Researcher")
      .should(($checkbox) => {
        // Get the value of the data-selected attribute
        const selected = $checkbox.attr("data-selected");

        // Ensure that the data-selected attribute is true
        expect(selected).to.equal("true");
      });
    cy.get('[data-cy="tag-container"]').contains("EPOCHS");
  });
});

describe("delete image", () => {
  it("Should delete image when pressing confirm button", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );
    cy.createImageWithRole(
      "imagetransformer",
      "library/imagetransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-action]").click();
    cy.get('[data-cy="table-row"]').should("not.contain", "visiontransformer");
  });

  it("Should cancel deletion of image when pressing cancel button", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-cancel]").click();
    cy.get('[data-cy="table-row"]').should("contain", "visiontransformer");
  });

  it("Should cancel deletion of image when pressing exit button", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-exit]").click();
    cy.get('[data-cy="table-row"]').should("contain", "visiontransformer");
  });
});

describe("Editing images", () => {
  it("Should edit the image name", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    // Edit image name
    cy.get('[data-cy="image-name-input"]').clear().type("newvisiontransformer");
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-action]").click();

    // Verify the name has been updated
    cy.get('[data-cy="table-row"]').should("contain", "newvisiontransformer");
  });

  it("Should assign newly selected roles to image", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    // Assign a new role
    cy.get('[data-cy="image-checkbox-group"]').contains("Admin").click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-action]").click();

    // Verify the new role has been assigned
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
    cy.get('[data-cy="table-row"]').should("contain", "AI Researcher");
  });

  it("Should remove a role from the image", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithTwoRoles(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      ["AI Researcher", "Admin"]
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    // Remove the AI Researcher role
    cy.get('[data-cy="image-checkbox-group"]')
      .contains("AI Researcher")
      .click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-action]").click();

    // Verify the role has been removed
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
    cy.get('[data-cy="table-row"]').should("not.contain", "AI Researcher");
  });
  it("Should cancel changes when pressing cancel button", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    cy.get('[data-cy="image-name-input"]').clear().type("newname");

    // Select a new role but cancel
    cy.get('[data-cy="image-checkbox-group"]').contains("Admin").click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-cancel]").click();

    // Verify the new role has not been assigned
    cy.get('[data-cy="table-row"]').should("not.contain", "Admin");
    cy.get('[data-cy="table-row"]').should("not.contain", "newname");
  });

  it("Should cancel changes when pressing exit button", () => {
    cy.createMaintainerUserWithSession("maintainer@example.com");
    cy.createImageWithRole(
      "visiontransformer",
      "library/visiontransformer",
      ["EPOCHS"],
      "AI Researcher"
    );

    cy.visit(`app/images`);

    cy.get('[data-cy="table-row"]').contains("visiontransformer").click();
    cy.get('[data-cy="image-sidemenu"]').should("be.visible");

    cy.get('[data-cy="image-name-input"]').clear().type("newname");

    // Select a new role but cancel
    cy.get('[data-cy="image-checkbox-group"]').contains("Admin").click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-exit]").click();

    // Verify the new role has not been assigned
    cy.get('[data-cy="table-row"]').should("not.contain", "Admin");
    cy.get('[data-cy="table-row"]').should("not.contain", "newname");
  });
});
