beforeEach(() => {
    cy.resetDatabase();
});

function generateRandomKey(
    length = 16,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
) {
    let key = "";
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsetLength);
        key += charset[randomIndex];
    }
    return key;
}

describe("information loading", () => {
    it("Should display all data correctly", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="task-name"]').should("contain", "Test Task");
                    cy.get('[data-cy="start-time"]').should("contain", "00:00:00");
                    cy.get('[data-cy="run-time"]').should("contain", "00:00:00");
                    cy.get('[data-cy="status-code"]').should("contain", "0");
                    cy.get('[data-cy="image"]').should("contain", "visiontransformer");
                    cy.get('[data-cy="status"]').then(($chip) => {
                        expect($chip.text()).to.contain("todo");
                    });
                    cy.get('[data-cy="table-row"]').should("contain", "EPOCHS");
                    cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                }
            );
        });
    });
});

describe("assigning/removing user tags", () => {
    it("should assign additional user tag when pressing submit", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createTag("airesearcher@example.com", "user");
        cy.createAiResearcherUserWithSession("user@example.com", "test").then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                    cy.get('[data-cy="user-tag-viewer"]')
                        .should("be.visible")
                        .type("airesearcher@example.com");
                    cy.get('[data-cy="user-tag-selector"]').should("be.visible").click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-action]").click();
                    cy.get('[data-cy="user-tag-viewer"]').should(
                        "contain",
                        "airesearcher@example.com"
                    );
                }
            );
        });
    });
    it("should remove deselected user tag when pressing submit", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithTwoUserTags(
                taskName,
                user.email,
                "airesearcher@example.com",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                cy.get('[data-cy="user-tag-viewer"]')
                    .contains("airesearcher@example.com")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "not.contain",
                    "airesearcher@example.com"
                );
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-action]").click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "not.contain",
                    "airesearcher@example.com"
                );
            });
        });
    });
    it("should not allow there to be zero user tags", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="user-tag-viewer"]')
                        .contains(user.email)
                        .parent()
                        .find("svg")
                        .click();
                    cy.get('[data-cy="user-tag-viewer"]').should(
                        "not.contain",
                        user.email
                    );
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-action]").click();
                    cy.get('[data-cy="submit-modal-cancel"]')
                        .should("be.visible")
                        .click();
                    cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                }
            );
        });
    });
    it("should not assign additional user tag when pressing cancel", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                    cy.get('[data-cy="user-tag-viewer"]')
                        .should("be.visible")
                        .type("airesearcher@example.com");
                    cy.get('[data-cy="user-tag-selector"]').should("be.visible").click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-cancel]").click();
                    cy.get('[data-cy="user-tag-viewer"]').should(
                        "not.contain",
                        "airesearcher@example.com"
                    );
                }
            );
        });
    });
    it("should not assign additional user tag when pressing exit", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                    cy.get('[data-cy="user-tag-viewer"]')
                        .should("be.visible")
                        .type("airesearcher@example.com");
                    cy.get('[data-cy="user-tag-selector"]').should("be.visible").click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-exit]").click();
                    cy.get('[data-cy="user-tag-viewer"]').should(
                        "not.contain",
                        "airesearcher@example.com"
                    );
                }
            );
        });
    });

    it("should not remove additional user tag when pressing cancel", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithTwoUserTags(
                taskName,
                user.email,
                "airesearcher@example.com",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                cy.get('[data-cy="user-tag-viewer"]')
                    .contains("airesearcher@example.com")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "not.contain",
                    "airesearcher@example.com"
                );
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-cancel]").click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "contain",
                    "airesearcher@example.com"
                );
            });
        });
    });
    it("should not remove additional user tag when pressing exit", () => {
        cy.createAiResearcherUser("airesearcher@example.com");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithTwoUserTags(
                taskName,
                user.email,
                "airesearcher@example.com",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="user-tag-viewer"]').should("contain", user.email);
                cy.get('[data-cy="user-tag-viewer"]')
                    .contains("airesearcher@example.com")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "not.contain",
                    "airesearcher@example.com"
                );
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-exit]").click();
                cy.get('[data-cy="user-tag-viewer"]').should(
                    "contain",
                    "airesearcher@example.com"
                );
            });
        });
    });
});

describe("assigning/removing custom tags", () => {
    it("should assign additional custom tag when pressing submit", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="custom-tag-viewer"]')
                        .should("be.visible")
                        .type("test");
                    cy.get('[data-cy="custom-tag-selector"]')
                        .should("be.visible")
                        .click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-action]").click();
                    cy.get('[data-cy="custom-tag-viewer"]').should("contain", "test");
                }
            );
        });
    });
    it("should assign additional custom tag when pressing cancel", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="custom-tag-viewer"]')
                        .should("be.visible")
                        .type("test");
                    cy.get('[data-cy="custom-tag-selector"]')
                        .should("be.visible")
                        .click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-cancel]").click();
                    cy.get('[data-cy="custom-tag-viewer"]').should("not.contain", "test");
                }
            );
        });
    });
    it("should not assign additional custom tag when pressing exit", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    // Now visit the task page and assert the information is displayed correctly
                    cy.visit(`/app/tasks/${task.token_id}`);
                    cy.get('[data-cy="custom-tag-viewer"]')
                        .should("be.visible")
                        .type("test");
                    cy.get('[data-cy="custom-tag-selector"]')
                        .should("be.visible")
                        .click();
                    cy.get('[data-cy="submit-button"]').should("be.visible").click();
                    cy.get("[data-cy=submit-modal-cancel]").click();
                    cy.get('[data-cy="custom-tag-viewer"]').should("not.contain", "test");
                }
            );
        });
    });
    it("should remove custom tag when pressing submit", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTagAndCustomTag(
                taskName,
                user.email,
                "test",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="custom-tag-viewer"]')
                    .contains("test")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="custom-tag-viewer"]')
                    .should("be.visible")
                    .type("exit");
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-action]").click();
                cy.get('[data-cy="custom-tag-viewer"]').should("not.contain", "test");
            });
        });
    });
    it("should not remove custom tag when pressing cancel", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTagAndCustomTag(
                taskName,
                user.email,
                "test",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="custom-tag-viewer"]')
                    .contains("test")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="custom-tag-selector"]').should("be.visible").click();
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-cancel]").click();
                cy.get('[data-cy="custom-tag-viewer"]').should("contain", "test");
            });
        });
    });
    it("should not remove custom tag when pressing exit", () => {
        cy.createTag("test");
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTagAndCustomTag(
                taskName,
                user.email,
                "test",
                sylabsPath,
                generateRandomKey()
            ).then((task) => {
                // Now visit the task page and assert the information is displayed correctly
                cy.visit(`/app/tasks/${task.token_id}`);
                cy.get('[data-cy="custom-tag-viewer"]')
                    .contains("test")
                    .parent()
                    .find("svg")
                    .click();
                cy.get('[data-cy="custom-tag-selector"]').should("be.visible").click();
                cy.get('[data-cy="submit-button"]').should("be.visible").click();
                cy.get("[data-cy=submit-modal-exit]").click();
                cy.get('[data-cy="custom-tag-viewer"]').should("contain", "test");
            });
        });
    });
});
