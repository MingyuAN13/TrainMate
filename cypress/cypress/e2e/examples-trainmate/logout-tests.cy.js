const BASE_URL = `http://${Cypress.env("hostAddress")}:${Cypress.env(
  "frontPort"
)}`;
const LOGOUT_CHECK_URL = BASE_URL + "/api/auth/logout";
const LOGIN_CHECK_URL = BASE_URL + "/api/auth/login";

beforeEach(() => {
  cy.resetDatabase();
});

it("should logout the user if the users has a session", () => {
  // Check if the session cookie does not exist
  cy.getCookie("session-id").should("not.exist");

  cy.createAdminUserWithSession().then(() => {
    cy.visit("/app/home");

    cy.getCookie("session-id").should("exist");

    cy.intercept("POST", LOGOUT_CHECK_URL).as("userLogoutRequest");

    // Click the logout button
    cy.get('[id="logout-btn"]').click();
    cy.get('[data-cy="logout-modal"]')
      .should("be.visible")
      .get('[data-cy="action-button"]')
      .click();

    cy.wait("@userLogoutRequest").then((interception) => {
      assert.equal(
        interception.response.statusCode,
        200,
        "User logout successful"
      );

      // Assert that the user is redirected to the login page
      cy.url().should("include", "/login");

      // Check if the session cookie is deleted
      cy.getCookie("session-id").should("not.exist");
    });
  });
});
