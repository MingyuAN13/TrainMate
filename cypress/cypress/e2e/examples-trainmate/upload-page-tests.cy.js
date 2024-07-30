beforeEach(() => {
    cy.resetDatabase();
});

const userTagData = { name: "user@example.com", type: "user" };

describe("File Upload Feature", () => {
    // it("Should display an error when the user does not have access", () => {
    //     cy.createAdminUserWithSession();
    //     cy.visit("/app/files/upload");
    //     cy.get("h1").should(
    //         "have.text",
    //         "401 : You do not have authorization to view this page."
    //     );
    // });
    it("Should display all fields as empty", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            cy.visit("/app/files/upload");
            cy.get('[data-cy="custom-tag-viewer"]').should("contain", "Add tags +");
            cy.get('[data-cy="user-viewer"]').should("contain", "No users selected");
        });
    });
    it("Should display custom tags", () => {
        cy.createAiResearcherUserWithSession();
        cy.createTag("custom", "custom");
        cy.createTag("user", "user");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="custom-tag-viewer"]')
            .should("be.visible")
            .type("custom");
        cy.get('[data-cy="custom-tag-selector"]').should("contain", "custom");
    });
    it("Should be able to add custom tags", () => {
        cy.createAiResearcherUserWithSession();
        cy.createTag("custom", "custom");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="custom-tag-viewer"]').click();
        cy.get('[data-cy="custom-tag-selector"]').contains("custom").click();
        cy.get('[data-cy="custom-tag-viewer"]').should("contain", "custom");
    });
    it("Should be able to remove custom tags", () => {
        cy.createAiResearcherUserWithSession();
        cy.createTag("custom", "custom");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="custom-tag-viewer"]').click();
        cy.get('[data-cy="custom-tag-selector"]').contains("custom").click();
        cy.get('[data-cy="custom-tag-viewer"]')
            .contains("custom")
            .parent()
            .find("svg")
            .click();
        cy.get('[data-cy="custom-tag-viewer"]').should("not.contain", "custom");
    });
    it("Should be able to filter custom tags", () => {
        cy.createAiResearcherUserWithSession();
        cy.createTag("aaaa", "custom");
        cy.createTag("bbbb", "custom");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="custom-tag-viewer"]').click().type("b");
        cy.get('[data-cy="custom-tag-selector"]').should("contain", "bbbb");
        cy.get('[data-cy="custom-tag-selector"]').should("not.contain", "aaaa");
    });
    it("Should display user tags", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.createTag("user@user.com", "user");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="filter-user"]').click();
        cy.get('[data-cy="checkbox-group"]').should("contain", "user@user.com");
    });
    it("Should be able to add user tags", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.createTag("user@user.com", "user");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="filter-user"]').click();
        cy.get('[data-cy="checkbox-group"]')
            .should("contain", "user@user.com")
            .click();
        cy.get('[data-cy="user-viewer"]').should("contain", "user@user.com");
    });
    it("Should be able to remove user tags", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.createTag("user@user.com", "user");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="filter-user"]').click();
        cy.get('[data-cy="checkbox-group"]')
            .should("contain", "user@user.com")
            .click();
        cy.get('[data-cy="user-viewer"]')
            .contains("user@user.com")
            .parent()
            .find("svg")
            .click();
        cy.get('[data-cy="user-viewer"]').should("not.contain", "user@user.com");
    });
    it("Should be able to filter user tags", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.createTag("aaaa", "user");
        cy.createTag("bbbb", "user");
        cy.visit("/app/files/upload");
        cy.get('[data-cy="filter-user"]').type("b");
        cy.get('[data-cy="checkbox-group"]').should("contain", "bbbb");
        cy.get('[data-cy="checkbox-group"]').should("not.contain", "aaaa");
    });
    it("Should be able to check file conversions", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.visit("/app/files/upload");
        cy.get('[data-cy="radio"]').contains("No Conversion").click();
        cy.get('[data-cy="radio"]')
            .contains("No Conversion")
            .should("have.attr", "data-selected");
        cy.get('[data-cy="radio"]').contains("Pickle").click();
        cy.get('[data-cy="radio"]')
            .contains("Pickle")
            .should("have.attr", "data-selected");
        cy.get('[data-cy="radio"]').contains("H5").click();
        cy.get('[data-cy="radio"]')
            .contains("H5")
            .should("have.attr", "data-selected");
        cy.get('[data-cy="radio"]').contains("JPEG").click();
        cy.get('[data-cy="radio"]')
            .contains("JPEG")
            .should("have.attr", "data-selected");
    });

    it("Should show files to be uploaded after selecting file", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.visit("/app/files/upload");
        cy.get('[data-cy="fileinput"]').attachFile("example.json", {
            force: true,
        });
        cy.get('[data-cy="upload-item-0"]').should("contain", "example.json");
    });

    it("Should allow selected files to be deslected", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.visit("/app/files/upload");
        cy.get('[data-cy="fileinput"]').attachFile("example.json", {
            force: true,
        });
        cy.get('[data-cy="item-remove-0"]').click();
        cy.get('[data-cy="upload-list"]').should("not.contain", "example.json");
    });

    it("Should successfully upload file, updating the database", () => {
        cy.createAiResearcherUserWithSessionAndTag().then((user) => {
            cy.createTag("custom", "custom").then((customTag) => {
                cy.createTag("user@user.com", "user").then((userTag) => {
                    cy.visit("/app/files/upload");
                    cy.get('[data-cy="fileinput"]').attachFile("example.json", {
                        force: true,
                    });
                    cy.get('[data-cy="custom-tag-viewer"]').click();
                    cy.get('[data-cy="custom-tag-selector"]').contains("custom").click();
                    cy.get('[data-cy="filter-user"]').click();
                    cy.get('[data-cy="checkbox-group"]')
                        .contains("user@user.com")
                        .click();
                    cy.get('[data-cy="upload-button"]').click({ force: true });
                    cy.wait(500);
                    cy.checkFileExists("/example.json", [
                        customTag.id,
                        userTag.id,
                        user.tag.id,
                    ]);
                });
            });
        });
    });

    it("Should return to files page after upload", () => {
        cy.createAiResearcherUserWithSessionAndTag();
        cy.visit("/app/files/upload");
        cy.get("[data-cy='fileinput']").attachFile("example.json", {
            force: true,
        });
        cy.get('[data-cy="upload-button"]').click();
        cy.url().should("include", "/app/files");
    });
});
