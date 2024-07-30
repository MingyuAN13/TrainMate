// This function has to be called at the beginning of the test to setup the database
// This emtpies the database and creates roles
beforeEach(() => {
    cy.resetDatabase();
});


// This example shows how to create users with custom email and password
// It also shows how to use the object its variables
describe('creating users', () => {
    it('will create users with custom email and password', () => {
        cy.createAdminUser('admin@email.com', 'password1234').then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 1`);
        });

        cy.createAiResearcherUser('researcher@email.com', 'mysecretpassword').then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 2`);
        });

        cy.createDataEngineerUser('engineer@email.com', 'supersecurepassword').then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 3`);
        });
    });

    it('will create users with random email and password', () => {
        cy.createAdminUser().then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 1`);
        });

        cy.createAiResearcherUser().then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 2`);
        });

        cy.createDataEngineerUser().then((user) => {
            cy.log(JSON.stringify(user));
            cy.queryExists(`SELECT * FROM users_table WHERE email = '${user.email}'`);
            cy.queryExists(`SELECT * FROM users_roles WHERE user_id = ${user.id} AND role_id = 3`);
        });
    });
});

// This example shows how to create tags
describe('creating tags', () => {
    it('will create tags', () => {
        cy.createTag('My own tag').then((tag) => {
            cy.log(JSON.stringify(tag));
            cy.queryExists(`SELECT * FROM tags_table WHERE name = '${tag.name}'`);
        });
    });
});

// This example shows how to navigate to the login page
describe('navigating to the login page', () => {
    it('will navigate to the login page', () => {
        cy.visit('/login');
    });
});
