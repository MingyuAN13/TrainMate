beforeEach(() => {
  cy.resetDatabase();
});

describe("run container", () => {
  it("will run the model and check API request", () => {
    cy.intercept("POST", "/api/tasks").as("createTask");
    cy.createAiResearcherUserWithSession("test@example.com");

    cy.getTagUserID("test@example.com", "user").then((tag) => {
      cy.createFile("file1").then((file) => {
        cy.relationFileToTags(file.id, tag);
      });
    });

    const sylabsPath = "library/visiontransformer";
    cy.createImage("Model1", sylabsPath, ["EPOCHS"]);
    cy.createTaskWithUserTag("Model1", "test@example.com", sylabsPath);

    cy.visit("app/tasks/run");

    cy.get('[data-cy="filter-image"]').focus();
    cy.get('[data-cy="filter-dropdown-image"]').should("be.visible");
    cy.get('[data-cy="checkbox-group-image"]').contains("Model1").click();

    cy.get('[data-cy="parameter-input"]').each((input) => {
      cy.wrap(input).type("300");
    });

    cy.get('[data-cy="file-row"]').contains("file1").click();

    cy.get('[data-cy="output"]').type("myContainer");

    cy.get('[data-cy="filter-button"]').eq(1).click();

    cy.get('[data-cy="tag-selector-item"]').first().click();
    cy.get('[data-cy="filter-button"]').eq(1).click();

    cy.get('[data-cy="submitButton"]').click();

    cy.wait("@createTask").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
  });
});

describe("run container with previous value", () => {
  it("will run the model with previous parameters and check API request", () => {
    cy.createAiResearcherUserWithSession("test@example.com");

    cy.getTagUserID("test@example.com", "user").then((tag) => {
      cy.createFile("file1").then((file) => {
        cy.relationFileToTags(file.id, tag);
      });
    });

    const sylabsPath = "library/visiontransformer";
    cy.createImage("Model1", sylabsPath, ["EPOCHS"]);
    cy.createTaskWithUserTag("Task1", "test@example.com", sylabsPath);

    cy.visit("app/tasks/run");

    cy.get('[data-cy="filter-image"]').focus();
    cy.get('[data-cy="filter-dropdown-image"]').should("be.visible");
    cy.get('[data-cy="checkbox-group-image"]').contains("Model1").click();

    cy.get('[data-cy="filter-previous"]').focus();
    cy.get('[data-cy="filter-dropdown-previous"]').should("be.visible");
    cy.get('[data-cy="checkbox-group-previous"]').contains("Task1").click();

    cy.get('[data-cy="file-row"]').contains("file1").click();

    cy.get('[data-cy="output"]').type("myContainer");

    cy.get('[data-cy="filter-button"]').eq(1).click();
    cy.get('[data-cy="tag-selector-item"]').first().click();
    cy.get('[data-cy="filter-button"]').eq(1).click();

    cy.intercept("POST", "/api/tasks").as("createTask");

    cy.get('[data-cy="submitButton"]').click();

    cy.wait("@createTask").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
  });
});

describe("fails running container", () => {
  it("will fail", () => {
    cy.createAiResearcherUserWithSession("test@example.com");

    cy.getTagUserID("test@example.com", "user").then((tag) => {
      cy.createFile("file1").then((file) => {
        cy.relationFileToTags(file.id, tag);
      });
    });

    const sylabsPath = "library/visiontransformer";
    cy.createImage("Model1", sylabsPath, ["EPOCHS"]);
    cy.createTaskWithUserTag("Model1", "test@example.com", sylabsPath);

    cy.visit("app/tasks/run");

    cy.get('[data-cy="filter-image"]').focus();
    cy.get('[data-cy="filter-dropdown-image"]').should("be.visible");
    cy.get('[data-cy="checkbox-group-image"]').contains("Model1").click();

    cy.get('[data-cy="parameter-input"]').each((input) => {
      cy.wrap(input).type("1000");
    });

    cy.get('[data-cy="output"]').type("myContainer");

    cy.get('[data-cy="filter-button"]').eq(1).click();
    cy.get('[data-cy="tag-selector-item"]').first().click();
    cy.get('[data-cy="filter-button"]').eq(1).click();

    cy.intercept("POST", "/api/tasks").as("createTask");

    cy.get('[data-cy="submitButton"]').click();

    cy.wait("@createTask").then((interception) => {
      expect(interception.response.statusCode).to.equal(406);
    });

    cy.get('[data-cy="error-message"]').should("be.visible");
  });
});
