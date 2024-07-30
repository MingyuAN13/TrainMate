beforeEach(() => {
    cy.resetDatabase();
});

//These tests do all table/filtering
describe("table functionality", () => {
    it("Should filter on tag name", () => {
        cy.createTag("testing");
        cy.createTag("filtering");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="tag-table-wrapper"]').should("be.visible");
        cy.get('[data-cy="table-row"]').should("contain", "testing");
        cy.get('[data-cy="table-row"]').should("contain", "filtering");

        // Filter by email
        cy.get('[data-cy="tag-search"]').should("be.visible").type("test");

        cy.get('[data-cy="table-row"]').should("contain", "testing");
        cy.get('[data-cy="table-row"]').should("not.contain", "filtering");
    });
});

//These tests do deletion of new tags
describe("delete tag", () => {
    it("Should delete tag when pressing confirm button", () => {
        cy.createTag("testing");
        cy.createTag("filtering");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="table-row"]').contains("testing").click();
        cy.get('[data-cy="delete-button"]').click();
        cy.get('[data-cy="delete-modal"]').should("be.visible");
        cy.get("[data-cy=delete-modal-action]").click();
        cy.get('[data-cy="table-row"]').should("not.contain", "testing");
    });

    it("Should cancel deletion of tag when pressing cancel button", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession("admin@example.com");

        cy.visit(`app/tags`);

        cy.get('[data-cy="table-row"]').contains("testing").click();
        cy.get('[data-cy="delete-button"]').click();
        cy.get('[data-cy="delete-modal"]').should("be.visible");
        cy.get("[data-cy=delete-modal-cancel]").click();
        cy.get('[data-cy="table-row"]').should("contain", "testing");
    });

    it("Should cancel deletion of tag when pressing exit button", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="table-row"]').contains("testing").click();
        cy.get('[data-cy="delete-button"]').click();
        cy.get('[data-cy="delete-modal"]').should("be.visible");
        cy.get("[data-cy=delete-modal-exit]").click();
        cy.get('[data-cy="table-row"]').should("contain", "testing");
    });
});

//These tests do creation of tags
describe("create tag", () => {
    it("Should create tag when pressing confirm button", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="add-button"]').click();
        cy.get('[data-cy="add-modal"]').should("be.visible");
        cy.get('[data-cy="tag-input"]').should("be.visible").type("filtering");
        cy.get('[data-cy="add-modal-action"]').click();
        cy.get('[data-cy="table-row"]').should("contain", "filtering");
    });

    it("Should throw error if tag name is not unique", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession("admin@example.com");

        cy.visit(`app/tags`);

        cy.get('[data-cy="add-button"]').click();
        cy.get('[data-cy="add-modal"]').should("be.visible");
        cy.get('[data-cy="tag-input"]').should("be.visible").type("testing");
        cy.get('[data-cy="add-modal-action"]').click();
        cy.get('[data-cy="tag-error"]').should("be.visible");
    });

    it("Should cancel deletion of tag when pressing cancel button", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="add-button"]').click();
        cy.get('[data-cy="add-modal"]').should("be.visible");
        cy.get('[data-cy="tag-input"]').should("be.visible").type("filtering");
        cy.get('[data-cy="add-modal-cancel"]').click();
        cy.get('[data-cy="table-row"]').should("not.contain", "filtering");
    });

    it("Should cancel deletion of tag when pressing exit button", () => {
        cy.createTag("testing");
        cy.createAdminUserWithSession();

        cy.visit(`app/tags`);

        cy.get('[data-cy="add-button"]').click();
        cy.get('[data-cy="add-modal"]').should("be.visible");
        cy.get('[data-cy="tag-input"]').should("be.visible").type("filtering");
        cy.get('[data-cy="add-modal-exit"]').click();
        cy.get('[data-cy="table-row"]').should("not.contain", "filtering");
    });
});
