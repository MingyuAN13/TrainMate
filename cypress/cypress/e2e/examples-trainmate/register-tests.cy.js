const BASE_URL = `http://${Cypress.env("hostAddress")}:${Cypress.env(
  "frontPort"
)}`;
const REGISTER_CHECK_URL = BASE_URL + "/api/auth/register";

beforeEach(() => {
  cy.resetDatabase();
  cy.visit("register");
});

// Test to register a user with a valid email and password
describe("user registration", () => {
  it("will register a new user", () => {
    cy.intercept("POST", `${REGISTER_CHECK_URL}`).as("checkRegisterRequest");

    cy.get('[type="email"]').type("newuser@example.com");
    cy.get('[type="password"]').type("password1234");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@checkRegisterRequest").then((interception) => {
      assert.equal(
        interception.response.statusCode,
        200,
        "Email validation should be successful"
      );
      assert.deepEqual(interception.response.body, {
        success: true,
        message: "User registered successfully.",
      });
    });

    cy.url().should("eq", `${BASE_URL}/login`);
  });

  // Test for registering user with invalid email
  it("will not register a user with an invalid email format", () => {
    cy.intercept("POST", `${REGISTER_CHECK_URL}`).as("checkRegisterRequest");

    cy.get('[type="email"]').type("invalid-email");
    cy.get('[type="password"]').type("password1234");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@checkRegisterRequest").then((interception) => {
      assert.equal(
        interception.response.statusCode,
        406,
        "Invalid email format should be rejected"
      );

      assert.deepEqual(interception.response.body, {
        success: false,
        message: "Invalid Email or Password",
      });
    });
  });

  // Test for registering user with invalid password
  it("will not register a user with an invalid password format", () => {
    cy.intercept("POST", `${REGISTER_CHECK_URL}`).as("checkRegisterRequest");

    cy.get('[type="email"]').type("newuser@example.com");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@checkRegisterRequest").then((interception) => {
      assert.equal(
        interception.response.statusCode,
        406,
        "Invalid password format should be rejected"
      );
      assert.deepEqual(interception.response.body, {
        success: false,
        message: "Invalid Email or Password",
      });
    });
  });

  // Test to register a user with an email that already exists
  it("will not register a user with an existing email", () => {
    cy.createAdminUser("existinguser@example.com", "password1234").then(() => {
      cy.intercept("POST", `${REGISTER_CHECK_URL}`).as("checkRegisterRequest");

      cy.get('[type="email"]').type("existinguser@example.com");
      cy.get('[type="password"]').type("password1234");
      cy.get('[data-cy="submit"]').click();

      cy.wait("@checkRegisterRequest").then((interception) => {
        assert.equal(
          interception.response.statusCode,
          406,
          "Existing email should be rejected"
        );
        assert.deepEqual(interception.response.body, {
          success: false,
          message: "Invalid Email or Password",
        });
      });
    });
  });

  // Test for registering user with an email that is too long
  it("will not register a user with an email that is too long", () => {
    cy.intercept("POST", `${REGISTER_CHECK_URL}`).as("checkRegisterRequest");
    const longEmail = "a".repeat(200) + "@email.com";
    cy.get('[type="email"]').type(longEmail);
    cy.get('[type="password"]').type("password1234");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@checkRegisterRequest").then((interception) => {
      assert.equal(
        interception.response.statusCode,
        406,
        "Invalid email length should be rejected"
      );
      assert.deepEqual(interception.response.body, {
        success: false,
        message: "Invalid Email or Password",
      });
    });
  });

  // Test if the login redirect link is working.
  it("redirects to the login page", () => {
    cy.get('[data-cy="link"]').click();
    cy.url().should("include", "/login");
  });
});
