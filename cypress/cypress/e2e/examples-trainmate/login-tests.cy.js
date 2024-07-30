const BASE_URL = `http://${Cypress.env("hostAddress")}:${Cypress.env(
  "frontPort"
)}`;
const LOGIN_CHECK_URL = BASE_URL + "/api/auth/login";

beforeEach(() => {
  cy.resetDatabase();
  cy.visit(`login`, { timeout: 30000 });
});

// This example shows how to create tags
describe("user sign in", () => {
  // should be successful with valid credentials
  it("will be successful upon correct credentials", () => {
    cy.createAdminUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(user.email);
      cy.get('[type="password"]').type(user.password);
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest").then((intercept) => {
        assert.equal(intercept.response.statusCode, 200);
      });
    });
  });

  // should fail with invalid email
  it("will fail upon wrong email", () => {
    cy.createAdminUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(`${user.email}wrong`);
      cy.get('[type="password"]').type(user.password);
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest").then((intercept) => {
        assert.equal(intercept.response.statusCode, 406);
        assert.equal(
          intercept.response.body.message,
          "Invalid Email or Password"
        );
      });
    });
  });

  // should fail with invalid password
  it("will fail upon wrong password", () => {
    cy.createAdminUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(user.email);
      cy.get('[type="password"]').type(`${user.password}wrong`);
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest").then((intercept) => {
        assert.equal(intercept.response.statusCode, 406);
        assert.equal(
          intercept.response.body.message,
          "Invalid Email or Password"
        );
      });
    });
  });

  // should fail with invalid email and password
  it("will fail upon wrong email and password", () => {
    cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

    cy.get('[type="email"]').type("a.com");
    cy.get('[type="password"]').type("p");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@loginRequest").then((intercept) => {
      assert.equal(intercept.response.statusCode, 406);
      assert.equal(
        intercept.response.body.message,
        "Invalid Email or Password"
      );
    });
  });

  // should fail with too long email
  it("will fail upon entering too long of an email", () => {
    cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

    cy.get('[type="email"]').type("a".repeat(200));
    cy.get('[type="password"]').type("p");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@loginRequest").then((intercept) => {
      assert.equal(intercept.response.statusCode, 406);
      assert.equal(
        intercept.response.body.message,
        "Invalid Email or Password"
      );
    });
  });

  // should fail with too long password
  it("will fail upon entering too long of a password", () => {
    cy.createAdminUser().then((user) => {
      cy.intercept("POST", `${LOGIN_CHECK_URL}`).as("loginRequest");

      cy.get('[type="email"]').type(user.email);
      cy.get('[type="password"]').type("a".repeat(200));
      cy.get('[data-cy="submit"]').click();

      cy.wait("@loginRequest").then((intercept) => {
        assert.equal(intercept.response.statusCode, 406);
        assert.equal(
          intercept.response.body.message,
          "Invalid Email or Password"
        );
      });
    });
  });

  // should load the register page when clicking the register link
  it("will redirect to register page upon pressing the register link", () => {
    cy.get('[data-cy="link"]').click();
    cy.url().should("include", "/register");
  });
});
