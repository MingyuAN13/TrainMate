beforeEach(() => {
    cy.resetDatabase();
});

const userTagData = { name: "user@example.com", type: "user" };

describe("File Overview Feature", () => {
    it("Should display an error when the user does not have access", () => {
        cy.createAdminUserWithSession();
        cy.visit("/app/files");
        cy.url().should('include', '/app/401');
    });

    it("Should display an empty message when there are no files", () => {
        cy.createAiResearcherUserWithSession();
        cy.visit("/app/files");

        cy.get('[data-cy="file-explorer"]').find("h3").should('have.text', 'No files found');
    });

    it("Should not show files that the user does not have access to", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("visible-file", [userTagData]);
        cy.createFakeFileWithTags("hidden-file", []);
        cy.visit("/app/files");
        cy.get('[data-cy="file-name"]').contains('visible-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('hidden-file').should('not.exist');
    });

    it("Should allow the users to infinitly scroll through the table when there are many files", () => {
        cy.intercept("GET", "/api/files?").as("fetchFiles");
        cy.createAiResearcherUserWithSession("user@example.com");
        for (let i = 0; i < 25; i++) {
            cy.createFakeFileWithTags(`file-${i}`, [userTagData]);
        }
        cy.visit("/app/files");
        cy.wait("@fetchFiles");
        cy.get('[data-cy="file-name"]').should('have.length', 20);

        cy.get('[data-cy="file-explorer"]').parent().scrollTo("bottom", { ensureScrollable: false });

        cy.get('[data-cy="file-name"]').should('have.length', 25);
    });

    it("Should allow the users to filter the files by name", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("some-simple-file", [userTagData]);
        cy.createFakeFileWithTags("another-file", [userTagData]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('some-simple-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('be.visible');

        cy.get('[data-cy="search-input"]').type('simple');
        cy.get('[data-cy="file-name"]').contains('some-simple-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('not.exist');
    });

    it("Should allow the users to filter the files by custom tags", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "some-tag", type: "custom" }]);
        cy.createFakeFileWithTags("another-file", [userTagData, { name: "another-tag", type: "custom" }]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('be.visible');

        cy.get('[data-cy="filter-button"]').contains("Filter Tags").click();
        cy.get('[data-cy="filter-popover"]').contains('some-tag').click();
        cy.get('[data-cy="filter-button"]').contains("some-tag").click();

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('not.exist');
    });

    it("Should allow the users to filter the files by users", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createDataEngineerUser("data-engineer@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "data-engineer@example.com", type: "user" }]);
        cy.createFakeFileWithTags("another-file", [userTagData]);

        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('be.visible');

        cy.get('[data-cy="filter-button"]').contains("Filter Users").click();
        cy.get('[data-cy="filter-popover"]').contains('data-engineer@example.com').click();
        cy.get('[data-cy="filter-button"]').contains("data-engineer@example.com").click();

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('another-file').should('not.exist');
    });

    it("Should allow the users to filter the files by both name and tags", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createDataEngineerUser("data-engineer@example.com");

        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "primary-tag", type: "custom" }, { name: "data-engineer@example.com", type: "user" }]);
        cy.createFakeFileWithTags("not-correctly-named-file", [userTagData, { name: "primary-tag", type: "custom" }]);
        cy.createFakeFileWithTags("similar-primary-file", [userTagData, { name: "non-used-tag", type: "custom" }]);
        cy.createFakeFileWithTags("different-file", [userTagData, { name: "non-used-tag", type: "custom" }]);
        cy.createFakeFileWithTags("primary-file-without-user-tag", [userTagData, { name: "primary-tag", type: "custom" }]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('not-correctly-named-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('similar-primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('different-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('primary-file-without-user-tag').should('be.visible');

        cy.get('[data-cy="search-input"]').type("primary");
        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('not-correctly-named-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('similar-primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('different-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('primary-file-without-user-tag').should('be.visible');

        cy.get('[data-cy="filter-button"]').contains("Filter Tags").click();
        cy.get('[data-cy="filter-popover"]').contains('primary-tag').click();
        cy.get('[data-cy="filter-button"]').contains("primary-tag").click();

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('not-correctly-named-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('similar-primary-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('different-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('primary-file-without-user-tag').should('be.visible');

        cy.get('[data-cy="filter-button"]').contains("Filter Users").click();
        cy.get('[data-cy="filter-popover"]').contains('data-engineer@example.com').click();
        cy.get('[data-cy="filter-button"]').contains("data-engineer@example.com").click();

        cy.get('[data-cy="file-name"]').contains('primary-file').should('be.visible');
        cy.get('[data-cy="file-name"]').contains('not-correctly-named-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('similar-primary-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('different-file').should('not.exist');
        cy.get('[data-cy="file-name"]').contains('primary-file-without-user-tag').should('not.exist');
    });

    it("Should redirect the user to the upload page when the user clicks on the upload button", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.visit("/app/files");
        cy.get('[data-cy="upload-button"]').click();
        cy.url().should('include', '/app/files/upload');
    });
});

describe("File Overview Inspector Tests", () => {
    it("Should display the correct information when the user clicks on a file", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "some-tag", type: "custom" }]);
        cy.visit("/app/files");
        cy.get('[data-cy="file-name"]').contains('primary-file').click();

        cy.get('[data-cy="file-sidemenu"]').as("inspector");

        cy.get('[data-cy="file-inspector-name"]').contains('primary-file');
        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('some-tag');
    });

    it("Should add the tag to the file when the adds a tag", () => {
        cy.createAiResearcherUserWithSession("user@example.com");

        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "some-tag", type: "custom" }]);
        cy.createTag("another-tag", "custom");

        cy.visit("/app/files");
        cy.get('[data-cy="file-name"]').contains('primary-file').click();

        cy.get('[data-cy="file-sidemenu"]').as("inspector");
        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('some-tag');

        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').type('another-tag');
        cy.get('@inspector').get('[data-cy="file-tag-selector"]').contains('another-tag').click();

        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('some-tag');
        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('another-tag');

        cy.get('[data-cy="file-explorer"]').contains('some-tag');
        cy.get('[data-cy="file-explorer"]').contains('another-tag');
    });

    it("Should remove the tag from the file when the removes a tag", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "some-tag", type: "custom" }, { name: "another-tag", type: "custom" }]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').click();


        cy.get('[data-cy="file-sidemenu"]').as("inspector");
        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('another-tag').next().click();
        cy.get('@inspector').get('[data-cy="file-inspector-name"]').click();

        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('some-tag');
        cy.get('@inspector').get('[data-cy="file-tag-viewer"]').contains('another-tag').should('not.exist');

        cy.get('[data-cy="file-explorer"]').contains('some-tag');
        cy.get('[data-cy="file-explorer"]').contains('another-tag').should('not.exist');
    });

    it("Should grant the user access to the file when another user adds them", () => {
        cy.createAiResearcherUser("user@example.com").then((user) => {
            cy.createFakeFileWithTags("primary-file", [userTagData]);

            cy.createDataEngineerUserWithSession().then((otherUser) => {
                cy.createTag(otherUser.email, "user");
                cy.visit("/app/files");

                cy.get('[data-cy="file-explorer"]').contains('No files found').should('not.exist');

                cy.createSessionForUser(user);
                cy.visit("/app/files");
                cy.get('[data-cy="file-name"]').contains('primary-file').click();

                cy.get('[data-cy="file-sidemenu"]').as("inspector");

                cy.get('@inspector').get('[data-cy="filter-user"]').type(otherUser.email);
                cy.get('@inspector').get('[data-cy="checkbox-group"]').contains(otherUser.email).click();


                cy.get('@inspector').get('[data-cy="file-inspector-name"]').click();

                cy.get('@inspector').contains(otherUser.email);

                cy.get('[data-cy="file-explorer"]').contains(user.email);
                cy.get('[data-cy="file-explorer"]').contains(otherUser.email);

                cy.createSessionForUser(otherUser);
                cy.visit("/app/files");

                cy.get('[data-cy="file-name"]').contains('primary-file').should("be.visible");
            });
        });
    });

    it("Should revoke the user access to the file when another user removes them", () => {
        cy.createAiResearcherUser("user@example.com").then((user) => {
            cy.createDataEngineerUserWithSession("data-engineer@example.com").then((otherUser) => {
                cy.createFakeFileWithTags("primary-file", [userTagData, { name: otherUser.email, type: "user" }]);
                cy.visit("/app/files");

                cy.get('[data-cy="file-name"]').contains('primary-file').should("be.visible");

                cy.createSessionForUser(user);
                cy.visit("/app/files");
                cy.get('[data-cy="file-name"]').contains('primary-file').click();

                cy.get('[data-cy="file-sidemenu"]').as("inspector");

                cy.get('@inspector').get('[data-cy="filter-user"]').type(otherUser.email);
                cy.get('@inspector').get('[data-cy="checkbox-group"]').contains(otherUser.email).click();


                cy.get('@inspector').get('[data-cy="file-inspector-name"]').click();

                cy.get('@inspector').contains(otherUser.email).should('not.exist');

                cy.get('[data-cy="file-explorer"]').contains(user.email);
                cy.get('[data-cy="file-explorer"]').contains(otherUser.email).should('not.exist');

                cy.createSessionForUser(otherUser);
                cy.visit("/app/files");

                cy.get('[data-cy="file-explorer"]').contains('No files found').should('be.visible');
            });
        });
    });

    it("Should delete the file when the user deletes it", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').click();

        cy.get('[data-cy="delete-file-button"]').click();
        cy.get('[data-cy="file-delete-modal-action"]').click();

        cy.get('[data-cy="file-explorer"]').contains('No files found').should('be.visible');
    });

    it("Should not delete the file when they cancel the delete", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("primary-file", [userTagData, { name: "primary-tag", type: "custom" }]);
        cy.visit("/app/files");

        cy.get('[data-cy="file-name"]').contains('primary-file').click();
        cy.get('[data-cy="delete-file-button"]').click()
        cy.get('[data-cy="file-delete-modal-cancel"]').click();

        cy.query("SELECT * FROM files_table WHERE index = 'primary-file'").then((result) => {
            expect(result.rowCount).to.be.greaterThan(0);
        });
    });

    it("Should download the file when the user clicks on the download button", () => {
        cy.createAiResearcherUserWithSession("user@example.com");
        cy.createFakeFileWithTags("/primary-file", [userTagData, { name: "primary-tag", type: "custom" }], "file").then((file) => {
            cy.intercept('GET', `/api/files/download/${file.id}`, (req) => {
                req.continue((res) => {
                    expect(res.headers['content-disposition']).to.equal('attachment; filename=primary-file');
                    console.log(res.headers['content-disposition'])
                });
            }).as('fileDownloadRequest');

            cy.visit("/app/files");

            cy.get('[data-cy="file-name"]').contains('primary-file').click();
            cy.get('[data-cy="download-file-link"]').click();

            cy.wait('@fileDownloadRequest');
        });
    });
});
