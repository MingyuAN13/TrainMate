const BASE_URL = `http://${Cypress.env("hostAddress")}:${Cypress.env(
  "frontPort"
)}`;
const ROLE_CHECK_URL = BASE_URL + "/api/users/roles";
const LOGIN_CHECK_URL = BASE_URL + "/api/auth/login";

beforeEach(() => {
  cy.resetDatabase();
  cy.visit(`login`);
});

describe("Redirect Landing Page", () => {
  it("will redirect - no roles", () => {
    cy.createUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(user.email);
      cy.get('[type="password"]').type(user.password);
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest", { timeout: 30000 }).then((intercept) => {
        expect(intercept.response.statusCode).to.equal(200);
      });

      cy.url().should("eq", `${BASE_URL}/app/home`);

      cy.contains(
        "h1",
        "Please contact the system admin to assign you role(s)!"
      ).should("be.visible");
    });
  });

  it("will redirect - has role", () => {
    cy.createDataEngineerUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(user.email);
      cy.get('[type="password"]').type(user.password);
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest", { timeout: 30000 }).then((intercept) => {
        expect(intercept.response.statusCode).to.equal(200);
      });

      cy.url().should("eq", `${BASE_URL}/app/home`);

      cy.contains("h1", "Welcome to Trainmate!").should("be.visible");
    });
  });
});
