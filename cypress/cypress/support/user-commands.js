import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

Cypress.Commands.add("createUser", (email, password) => {
    if (!email) {
        email = faker.internet.email();
    }

    if (!password) {
        password = faker.internet.password();
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insertQuery = `INSERT INTO users_table (email, password_hash) VALUES ('${email}', '${hashedPassword}')`;

    cy.query(insertQuery);

    return cy
        .query(`SELECT * FROM users_table WHERE email = '${email}'`)
        .then((result) => {
            expect(result.rowCount).to.equals(1);
            const user = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                password: password,
                hashedPassword: result.rows[0].password,
                salt: result.rows[0].salt,
            };

            // Insert the user tag into the tags_table
            const insertTagQuery = `INSERT INTO tags_table (name, type) VALUES ('${email}', 'user')`;
            cy.query(insertTagQuery);

            // Verify that the tag is created
            const tagQuery = `SELECT * FROM tags_table WHERE name = '${email}' AND type = 'user'`;
            return cy.query(tagQuery).then((tagResult) => {
                expect(tagResult.rowCount).to.equals(1);
                return user;
            });
        });
});

Cypress.Commands.add("addRoleToUser", (userId, role) => {
    const insertQuery = `INSERT INTO users_roles (user_id, role_id) VALUES (${userId}, ${role})`;

    cy.query(insertQuery);

    return cy
        .query(
            `SELECT * FROM users_roles WHERE user_id = '${userId}' AND role_id = '${role}'`
        )
        .then((result) => {
            expect(result.rowCount).to.equals(1);
        });
});

Cypress.Commands.add("createUserWithRole", (email, password, role) => {
    return cy.createUser(email, password).then((user) => {
        if (!role) {
            return user;
        }
        return cy.addRoleToUser(user.id, role).then(() => {
            return {
                ...user,
                role: role,
            };
        });
    });
});

function addHoursToDate(date, hours) {
    const d = new Date(date);
    d.setTime(d.getTime() + hours * 60 * 60 * 60 * 1000);
    return d;
}

Cypress.Commands.add("createSessionForUser", (user) => {
    const expires = addHoursToDate(Date.now(), 1);
    const sessionToken = Math.random().toString(36).substring(2, 15);
    const query = `INSERT INTO sessions_table (session_token, expiration_datetime, user_id) VALUES ('${sessionToken}', '${expires.toISOString()}', '${user.id}')`;

    cy.setCookie("session-id", sessionToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
    });

    cy.query(query);

    return cy
        .query(
            `SELECT * FROM sessions_table WHERE session_token = '${sessionToken}'`
        )
        .then((result) => {
            expect(result.rowCount).to.equals(1);
            return {
                ...user,
                sessionToken: sessionToken,
                expires: expires,
            };
        });
});

Cypress.Commands.add("createAdminUser", (email, password) => {
    return cy.createUserWithRole(email, password, 1);
});

Cypress.Commands.add("createAiResearcherUser", (email, password) => {
    return cy.createUserWithRole(email, password, 2);
});

Cypress.Commands.add("createDataEngineerUser", (email, password) => {
    return cy.createUserWithRole(email, password, 3);
});

Cypress.Commands.add("createUserWithSession", (email, password) => {
    return cy.createUser(email, password).then((user) => {
        return cy.createSessionForUser(user);
    });
});

Cypress.Commands.add(
    "createUserWithSessionAndRole",
    (email, password, role) => {
        return cy.createUserWithRole(email, password, role).then((user) => {
            return cy.createSessionForUser(user);
        });
    }
);

Cypress.Commands.add("createAdminUserWithSession", (email, password) => {
    return cy.createUserWithSessionAndRole(email, password, 1);
});

Cypress.Commands.add("createAiResearcherUserWithSession", (email, password) => {
    return cy.createUserWithSessionAndRole(email, password, 2);
});

Cypress.Commands.add("createDataEngineerUserWithSession", (email, password) => {
    return cy.createUserWithSessionAndRole(email, password, 3);
});

Cypress.Commands.add("createMaintainerUserWithSession", (email, password) => {
    return cy.createUserWithSessionAndRole(email, password, 4);
});

Cypress.Commands.add(
    "createAiResearcherUserWithSessionAndTag",
    (email, password) => {
        cy.createUserWithSessionAndRole(email, password, 2).then((user) => {
            cy.createTag(user.email, "user").then((tag) => {
                return {
                    user: user,
                    tag: tag,
                };
            });
        });
    }
);
