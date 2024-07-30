import "cypress-file-upload";

Cypress.Commands.add("query", (query) => {
    return cy.task("runQuery", query);
});

Cypress.Commands.add("queryExists", (query) => {
    return cy.query(query).then((result) => {
        expect(result.rowCount).to.be.greaterThan(0);
    });
});

Cypress.Commands.add("resetDatabase", () => {
    let allTables = [
        // Joining tables
        "users_roles",
        "files_tags",
        "images_tags",
        "images_roles",
        "tasks_tags",
        // Base tables
        "sessions_table",
        "users_table",
        "files_table",
        "images_table",
        "roles_table",
        "tags_table",
        "tasks_table",
    ];

    for (let table of allTables) {
        const query = `DELETE FROM ${table}`;
        cy.query(query);
    }

    let allRoles = ["Admin", "AI Researcher", "Data Engineer", "Maintainer"];

    for (let i = 0; i < allRoles.length; i++) {
        const role = allRoles[i];
        cy.query(
            `INSERT INTO roles_table (id, name) VALUES (${i + 1}, '${role}')`
        );
    }

    cy.log("Database reset");
});
