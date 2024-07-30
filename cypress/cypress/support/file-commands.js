import { faker } from "@faker-js/faker";

/**
 * Creates a fake file that only exists in the database and **NOT** on the webdav server.
 * @param {string} name The name of the file. If not given, a random name will be generated.
 */
Cypress.Commands.add("createFakeFile", (name = "", type = "directory") => {
    if (!name) {
        name = faker.system.commonFileName();
    }

    const insertQuery = `INSERT INTO files_table (index, type) VALUES ('${name}', '${type}')`;

    cy.query(insertQuery);

    return cy
        .query(`SELECT * FROM files_table WHERE index = '${name}'`)
        .then((result) => {
            expect(result.rowCount).to.be.greaterThan(0);
            return {
                id: result.rows[0].id,
                index: result.rows[0].index,
            };
        });
});

/**
 * Connects a tag to a file.
 * @param {string} fileId The id of the file.
 * @param {string} tagId The id of the tag.
 */
Cypress.Commands.add("addTagToFile", (fileId, tagId) => {
    const insertQuery = `INSERT INTO files_tags (file_id, tag_id) VALUES (${fileId}, ${tagId})`;

    cy.query(insertQuery);
    return cy
        .query(
            `SELECT * FROM files_tags WHERE file_id = '${fileId}' AND tag_id = '${tagId}'`
        )
        .then((result) => {
            expect(result.rowCount).to.equals(1);
            return {
                id: result.rows[0].id,
                fileId: fileId,
                tagId: tagId,
            };
        });
});

/**
 * Creats a fake file and adds the give tags to it.
 * @param {string} name The name of the file. If not given, a random name will be generated.
 * @param {{name: string, type: string}[]} tags The tags to add to the file.
 */
Cypress.Commands.add(
    "createFakeFileWithTags",
    (name = "", tags = [], file_type = "directory") => {
        if (!name) {
            name = faker.system.commonFileName();
        }

        cy.createFakeFile(name, file_type).then((file) => {
            tags.forEach((tag) => {
                cy.createTag(tag.name, tag.type).then((tagData) => {
                    cy.addTagToFile(file.id, tagData.id);
                });
            });
        });

        return cy
            .query(`SELECT * FROM files_table WHERE index = '${name}'`)
            .then((result) => {
                expect(result.rowCount).to.be.greaterThan(0);
                return {
                    id: result.rows[0].id,
                    index: result.rows[0].index,
                };
            });
    }
);



/**
 * Checks if a file with the correct tags and index exists
 * @param {string} index The index of the file
 * @param {{id: number, name: string, type: string}[]} tags The tags to add to the file.
 */
Cypress.Commands.add("checkFileExists", (index = "", tags = []) => {
    cy.query(
        `SELECT ft.tag_id FROM files_tags ft JOIN files_table f ON ft.file_id = f.id WHERE f.index = '${index}'`
    ).then((result) => {
        console.log(result);
        const ids = tags.map((id) => {
            return {
                tag_id: id,
            };
        });
        console.log(ids);
        expect(result.rows.sort()).to.deep.equal(ids.sort());
    });
});
