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

//Should display the task in the table correctly
describe("table functionality", () => {
    it("should show existing task in the table with correct status", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer";

            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey());
            cy.visit(`/app/tasks`);
            cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task");
            cy.get('[data-cy="status"]').then(($chip) => {
                expect($chip.text()).to.contain("todo");
            });
            cy.get('[data-cy="tag"]').then(($chip) => {
                expect($chip.text()).to.contain(user.email);
            });
        });
        //Should display the searched tasks correctly
        it("should show existing tasks when searched", () => {
            cy.createAiResearcherUserWithSession().then((user) => {
                const taskName1 = "Test Task 1";
                const taskName2 = "Test Task 2";
                const sylabsPath1 = "library/visiontransformer1";
                const sylabsPath2 = "library/visiontransformer2";

                cy.createImage("visiontransformer1", sylabsPath1, [
                    "EPOCHS",
                ]);

                cy.createImage("visiontransformer2", sylabsPath2, [
                    "EPOCHS",
                ]);

                cy.createTaskWithUserTag(taskName1, user.email, sylabsPath1, generateRandomKey());
                cy.createTaskWithUserTag(taskName2, user.email, sylabsPath2, generateRandomKey());
                cy.visit(`/app/tasks`);
                cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
                cy.get('[data-cy="table-row"]').should("be.visible");
                cy.get('[data-cy="table-row"]').should("contain", "Test Task 1");
                cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");
                cy.get('[data-cy="task-table-search"]').type("2");
                cy.get('[data-cy="table-row"]').should("not.contain", "Test Task 1");
                cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");
            });
        });
        //Filter component should filter on clicked tags
        it("should filter on tags", () => {
            cy.createAiResearcherUserWithSession().then((user) => {
                const taskName1 = "Test Task 1";
                const taskName2 = "Test Task 2";
                const tagName1 = "Tag 1";
                const tagName2 = "Tag 2";
                const sylabsPath1 = "library/visiontransformer1";
                const sylabsPath2 = "library/visiontransformer2";

                cy.createImage("visiontransformer1", sylabsPath1, [
                    "EPOCHS",
                ]);

                cy.createImage("visiontransformer2", sylabsPath2, [
                    "EPOCHS",
                ]);

                cy.createTaskWithUserTagAndCustomTag(
                    taskName1,
                    user.email,
                    tagName1,
                    sylabsPath1,
                    generateRandomKey()
                );
                cy.createTaskWithUserTagAndCustomTag(
                    taskName2,
                    user.email,
                    tagName2,
                    sylabsPath2,
                    generateRandomKey()
                )
                cy.visit(`/app/tasks`);
                cy.get('[data-cy="tag"]').then(($chip) => {
                    expect($chip.text()).to.contain(user.email);
                });
            });
        });

        //Filter component should filter on image name
        it("should filter on image name", () => {
            cy.createAiResearcherUserWithSession().then((user) => {
                const taskName1 = "Test Task 1";
                const taskName2 = "Test Task 2";
                const tagName1 = "Tag 1";
                const tagName2 = "Tag 2";
                const sylabsPath1 = "library/visiontransformer1"
                const sylabsPath2 = "library/visiontransformer2"

                cy.createImage("visiontransformer1", sylabsPath1, [
                    "EPOCHS",
                ]);

                cy.createImage("visiontransformer2", sylabsPath2, [
                    "EPOCHS",
                ]);

                cy.createTaskWithUserTagAndCustomTag(
                    taskName1,
                    user.email,
                    tagName1,
                    sylabsPath1,
                    generateRandomKey()
                );
                cy.createTaskWithUserTagAndCustomTag(
                    taskName2,
                    user.email,
                    tagName2,
                    sylabsPath2,
                    generateRandomKey()
                );
                cy.visit(`/app/tasks`);
                cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
                cy.get('[data-cy="table-row"]').should("contain", "Test Task 1");
                cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");

                //Filter by tags
                cy.get('[data-cy="filter-images"]').focus();
                cy.get('[data-cy="checkbox-group"]').should("be.visible");
                cy.get('[data-cy="checkbox-group"]').contains("visiontransformer2").click();
                cy.get('[data-cy="table-row"]').each(($row) => {
                    cy.wrap($row).should("contain", "visiontransformer2");
                    cy.wrap($row).should("not.contain", "visiontransformer1");
                });
            });
        });

        //Should redirect to the task view page when a row is clicked
        it("should redirect to task view when pressing on task row in table", () => {
            cy.createAiResearcherUserWithSession().then((user) => {
                const taskName = "Test Task";
                const sylabsPath = "library/visiontransformer"
                cy.createImage("visiontransformer", sylabsPath, [
                    "EPOCHS",
                ]);

                cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                    (task) => {
                        const tokenId = task.token_id;
                        cy.visit(`/app/tasks`);
                        cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
                        cy.get('[data-cy="table-row"]').should("be.visible");
                        cy.get('[data-cy="table-row"]').contains("Test Task").click();
                        cy.url().should("include", `/app/tasks/${tokenId}`);
                    }
                );
            });
        });
        //Should redirect to task run page when the "add new task" button is clicked
        it("should redirect to task run page when the 'Add New Task' button is clicked", () => {
            cy.visit(`/app/tasks`);
            cy.get('[data-cy="new-task-button"]').should("be.visible").click();
            // Check the URL
            cy.url().should("include", "/tasks/run");
        });
    });

    //Should display the searched tasks correctly
    it("should show existing tasks when searched", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName1 = "Test Task 1";
            const taskName2 = "Test Task 2";
            const sylabsPath1 = "library/visiontransformer1";
            const sylabsPath2 = "library/visiontransformer2";

            cy.createImage("visiontransformer1", sylabsPath1, [
                "EPOCHS",
            ]);

            cy.createImage("visiontransformer2", sylabsPath2, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName1, user.email, sylabsPath1, generateRandomKey());
            cy.createTaskWithUserTag(taskName2, user.email, sylabsPath2, generateRandomKey());
            cy.visit(`/app/tasks`);
            cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task 1");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");
            cy.get('[data-cy="task-table-search"]').type("2");
            cy.get('[data-cy="table-row"]').should("not.contain", "Test Task 1");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");
        });
    });

    //Filter component should filter on clicked tags
    it("should filter on tags", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName1 = "Test Task 1";
            const taskName2 = "Test Task 2";
            const tagName1 = "Tag 1";
            const tagName2 = "Tag 2";
            const sylabsPath1 = "library/visiontransformer1";
            const sylabsPath2 = "library/visiontransformer2";

            cy.createImage("visiontransformer1", sylabsPath1, [
                "EPOCHS",
            ]);

            cy.createImage("visiontransformer2", sylabsPath2, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTagAndCustomTag(
                taskName1,
                user.email,
                tagName1,
                sylabsPath1,
                generateRandomKey()
            );

            cy.createTaskWithUserTagAndCustomTag(
                taskName2,
                user.email,
                tagName2,
                sylabsPath2,
                generateRandomKey()
            );
            cy.visit(`/app/tasks`);
            cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("contain", "Tag 1");
            cy.get('[data-cy="table-row"]').should("contain", "Tag 2");

            //Filter by tags
            cy.get('[data-cy="filter-tags"]').focus();
            cy.get('[data-cy="checkbox-group"]').should("be.visible");
            cy.get('[data-cy="checkbox-group"]').contains("Tag 1").click();
            cy.get('[data-cy="table-row"]').each(($row) => {
                cy.wrap($row).should("contain", "Tag 1");
            });
        });
    });

    //Filter component should filter on image name
    it("should filter on image name", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName1 = "Test Task 1";
            const taskName2 = "Test Task 2";
            const tagName1 = "Tag 1";
            const tagName2 = "Tag 2";
            const sylabsPath1 = "library/visiontransformer1"
            const sylabsPath2 = "library/visiontransformer2"

            cy.createImage("visiontransformer1", sylabsPath1, [
                "EPOCHS",
            ]);

            cy.createImage("visiontransformer2", sylabsPath2, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTagAndCustomTag(
                taskName1,
                user.email,
                tagName1,
                sylabsPath1,
                generateRandomKey()
            );

            cy.createTaskWithUserTagAndCustomTag(
                taskName2,
                user.email,
                tagName2,
                sylabsPath2,
                generateRandomKey()
            );
            cy.visit(`/app/tasks`);
            cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task 1");
            cy.get('[data-cy="table-row"]').should("contain", "Test Task 2");

            //Filter by tags
            cy.get('[data-cy="filter-images"]').focus();
            cy.get('[data-cy="checkbox-group"]').should("be.visible");
            cy.get('[data-cy="checkbox-group"]').contains("visiontransformer2").click();
            cy.get('[data-cy="table-row"]').each(($row) => {
                cy.wrap($row).should("contain", "visiontransformer2");
                cy.wrap($row).should("not.contain", "visiontransformer1");
            });
        });
    });

    //Should redirect to the task view page when a row is clicked
    it("should redirect to task view when pressing on task row in table", () => {
        cy.createAiResearcherUserWithSession().then((user) => {
            const taskName = "Test Task";
            const sylabsPath = "library/visiontransformer"
            cy.createImage("visiontransformer", sylabsPath, [
                "EPOCHS",
            ]);

            cy.createTaskWithUserTag(taskName, user.email, sylabsPath, generateRandomKey()).then(
                (task) => {
                    const tokenId = task.token_id;
                    cy.visit(`/app/tasks`);
                    cy.get('[data-cy="task-table-wrapper"]').should("be.visible");
                    cy.get('[data-cy="table-row"]').should("be.visible");
                    cy.get('[data-cy="table-row"]').contains("Test Task").click();
                    cy.url().should("include", `/app/tasks/${tokenId}`);
                }
            );
        });
    });

    //Should redirect to task run page when the "add new task" button is clicked
    it("should redirect to task run page when the 'Add New Task' button is clicked", () => {
        cy.createAiResearcherUserWithSession();
        cy.visit(`/app/tasks`);
        cy.get('[data-cy="new-task-button"]').should("be.visible").click();

        // Check the URL
        cy.url().should("include", "/tasks/run");
    });
});
