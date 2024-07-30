beforeEach(() => {
    cy.resetDatabase();
});

const links = {
    userOverview: {
        url: "/app/users",
        label: "Users Overview",
    },
    tagsOverview: {
        url: "/app/tags",
        label: "Tags Overview",
    },
    filesOverview: {
        url: "/app/files",
        label: "Files Overview",
    },
    tasksOverview: {
        url: "/app/tasks",
        label: "Tasks Overview",
    },
    imageOverview: {
        url: "/app/images",
        label: "Images Overview",
    },
};

const roles = {
    admin: {
        links: ["userOverview", "tagsOverview"],
        roleId: 1,
    },
    aiResearcher: {
        links: ["filesOverview", "tasksOverview"],
        roleId: 2,
    },
    dataEngineer: {
        links: ["filesOverview", "tasksOverview"],
        roleId: 3,
    },
    maintainer: {
        links: ["imagesOverview"],
        roleId: 4,
    },
    noRole: {
        links: [],
        roleId: 0,
    },
};

Object.keys(roles).forEach((role) => {
    const roleInfo = roles[role];
    const roleId = roleInfo.roleId;
    describe(`Sidebar Navigation Feature - ${role}`, () => {
        Object.keys(links).forEach((link) => {
            const linkInfo = links[link];
            const canView = roleInfo.links.includes(link);

            if (canView) {
                it(`redirects to the ${linkInfo.label} page when clicked`, () => {
                    cy.createUserWithSessionAndRole(null, null, roleId);
                    cy.visit("/app/home");
                    cy.get('[data-cy="sidebar-link"]').contains(linkInfo.label).click();
                    cy.url().should("include", linkInfo.url);
                });
            } else {
                it(`does not show the ${linkInfo.label} link`, () => {
                    cy.createUserWithSessionAndRole(null, null, roleId);
                    cy.visit("/app/home");
                    cy.get('[data-cy="sidebar"]').contains(linkInfo.label).should("not.exist");
                });
            }
        });
    });
});

it("redirects to the home page upon clicking on the logo container", () => {
    cy.createAdminUserWithSession().then(() => {
        cy.visit("/app/users");

        // get the logo container and click on it
        cy.get("[id=\"logo-container\"]").click();

        // there must be a redirect to the home page after pressing the logo
        cy.url().should("include", "/app/home")
    });
});
