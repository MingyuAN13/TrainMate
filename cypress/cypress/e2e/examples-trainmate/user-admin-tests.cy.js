beforeEach(() => {
  cy.resetDatabase();
});

//These tests all table/filtering functionaliy for the user table
describe("table functionality", () => {
  it("Should filter on user email", () => {
    cy.createUser("someuser@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-table-wrapper"]').should("be.visible");
    cy.get('[data-cy="table-row"]').should("contain", "someuser@example.com");
    cy.get('[data-cy="table-row"]').should("contain", "admin@example.com");

    // Filter by email
    cy.get('[data-cy="user-search"]').should("be.visible").type("some");

    cy.get('[data-cy="table-row"]').should("contain", "someuser@example.com");
    cy.get('[data-cy="table-row"]').should("not.contain", "admin@example.com");
  });

  it("Should filter on user roles", () => {
    cy.createAiResearcherUser("someuser@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-table-wrapper"]').should("be.visible");
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
    cy.get('[data-cy="table-row"]').should("contain", "AI Researcher");

    // Click on the role filter to open the dropdown
    cy.get('[data-cy="filter-input"]').focus();
    cy.get('[data-cy="filter-dropdown"]').should("be.visible");

    // Check the checkbox for the desired role
    cy.get('[data-cy="checkbox-group"]').contains("Admin").click();

    // Assert that the user table contains the filtered role
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
    cy.get('[data-cy="table-row"]').should("not.contain", "AI Researcher");
  });

  it("Should filter on both user email and roles", () => {
    cy.createAiResearcherUser("airesearcher@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-table-wrapper"]').should("be.visible");
    cy.get('[data-cy="user-search"]').type("admin");
    // Click on the role filter to open the dropdown
    cy.get('[data-cy="filter-input"]').focus();
    cy.get('[data-cy="filter-dropdown"]').should("be.visible");

    // Check the checkbox for the desired role
    cy.get('[data-cy="checkbox-group"]').contains("Admin").click();
    // Check if user with searched email and role is in table
    cy.get('[data-cy="table-row"]').should("contain", "admin@example.com");
    cy.get('[data-cy="table-row"]').should(
      "not.contain",
      "airesearcher@example.com"
    );
    cy.get('[data-cy="table-row"]').should("contain", "Admin");
  });

  it("Should open side menu when pressing on user row in table", () => {
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="table-row"]').contains("Admin").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");

    cy.get('[type="email"]').should(
      "have.attr",
      "placeholder",
      "admin@example.com"
    );

    cy.get('[data-cy="roles-checkbox-group"]')
      .contains("Admin")
      .should(($checkbox) => {
        // Get the value of the data-selected attribute
        const selected = $checkbox.attr("data-selected");

        // Ensure that the data-selected attribute is true
        expect(selected).to.equal("true");
      });
  });
});

//These tests check deletion of users
describe("delete user", () => {
  it("Should delete user when pressing confirm button", () => {
    cy.createUser("someuser@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="table-row"]').contains("someuser@example.com").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-action]").click();
    cy.get('[data-cy="table-row"]').should(
      "not.contain",
      "someuser@example.com"
    );
  });

  it("Should cancel deletion of user when pressing cancel button", () => {
    cy.createUser("someuser@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="table-row"]').contains("someuser@example.com").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-cancel]").click();
    cy.get('[data-cy="table-row"]').should("contain", "someuser@example.com");
  });

  it("Should cancel deletion of user when pressing exit button", () => {
    cy.createUser("someuser@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="table-row"]').contains("someuser@example.com").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="delete-button"]').click();
    cy.get('[data-cy="delete-modal"]').should("be.visible");
    cy.get("[data-cy=delete-modal-exit]").click();
    cy.get('[data-cy="table-row"]').should("contain", "someuser@example.com");
  });
});

//These tests check assigning/removing roles to/from users
describe("assign/remove roles from user", () => {
  it("Should assign newly selected roles to user", () => {
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("Admin").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="roles-checkbox-group"]')
      .contains("AI Researcher")
      .click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-action]").click();
    cy.get('[data-cy="user-search"]').should("be.visible").clear();
    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("AI Researcher");
  });

  it("Should remove newly deselected roles to user", () => {
    cy.createAiResearcherUser("airesearcher@example.com");
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("airesearcher@example.com");
    cy.get('[data-cy="table-row"]').contains("AI Researcher").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="roles-checkbox-group"]')
      .contains("AI Researcher")
      .click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-action]").click();
    cy.get('[data-cy="user-search"]').should("be.visible").clear();
    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("airesearcher@example.com");
    cy.get('[data-cy="table-row"]')
      .contains("AI Researcher")
      .should("not.exist");
  });

  it("Should cancel deletion of user when pressing cancel button", () => {
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("Admin").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="roles-checkbox-group"]')
      .contains("AI Researcher")
      .click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-cancel]").click();
    cy.get('[data-cy="user-search"]').should("be.visible").clear();
    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("Admin");
  });

  it("Should cancel adding role to user when closing modal", () => {
    cy.createAdminUserWithSession("admin@example.com");

    cy.visit(`app/users`);

    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("Admin").click();
    cy.get('[data-cy="user-sidemenu"]').should("be.visible");
    cy.get('[data-cy="roles-checkbox-group"]')
      .contains("AI Researcher")
      .click();
    cy.get('[data-cy="submit-button"]').click();
    cy.get("[data-cy=submit-modal-exit]").click();
    cy.get('[data-cy="user-search"]').should("be.visible").clear();
    cy.get('[data-cy="user-search"]')
      .should("be.visible")
      .type("admin@example.com");
    cy.get('[data-cy="table-row"]').contains("Admin");
  });
});
