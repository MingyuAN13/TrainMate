beforeEach(() => {
    cy.resetDatabase();
});

const urls = [
    "/app/home",
    "/app/401",
    "/app/users",
    "/app/tags",
    "/app/images",
    "/app/files",
    "/app/files/upload",
    "/app/tasks",
    "/app/tasks/taskview",
    "/app/tasks/run",
];

const roleUrls = {
    admin: {
        urls: ["/app/home", "/app/401", "/app/users", "/app/tags"],
        roleId: 1,
    },
    aiResearcher: {
        urls: ["/app/home", "/app/401", "/app/files", "/app/files/upload", "/app/tasks", "/app/tasks/taskview", "/app/tasks/run"],
        roleId: 2,
    },
    dataEngineer: {
        urls: ["/app/home", "/app/401", "/app/files", "/app/files/upload", "/app/tasks", "/app/tasks/taskview", "/app/tasks/run"],
        roleId: 3,
    },
    maintainer: {
        urls: ["/app/home", "/app/401", "/app/images"],
        roleId: 4,
    },
    noRole: {
        urls: ["/app/home", "/app/401"],
        roleId: 0,
    },
};

Object.keys(roleUrls).forEach((role) => {
    const info = roleUrls[role];
    const acceptedUrls = info.urls;
    const roleId = info.roleId;
    describe(`Page Guarding Feature - ${role}`, () => {
        urls.forEach((url) => {
            const accepted = acceptedUrls.includes(url);
            const name = accepted ? `Allows ${url}` : `Blocks ${url}`;
            it(name, () => {
                cy.createUserWithSessionAndRole(null, null, roleId);
                cy.visit(url);
                cy.url().should(accepted ? "include" : "not.include", url);
            });
        });
    });
});

it("Redirect to login page when user is not logged in", () => {
    cy.visit("/app/home");
    cy.url().should("include", "/login");
});

