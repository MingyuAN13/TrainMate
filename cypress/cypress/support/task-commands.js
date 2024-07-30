Cypress.Commands.add("saveDoc", (doc) => {
  return cy.task("saveDoc", { doc });
});

Cypress.Commands.add("getDoc", (id) => {
  return cy.task("getDoc", { id });
});

Cypress.Commands.add("deleteDoc", (id, rev) => {
  return cy.task("deleteDoc", { id, rev });
});

function createTaskInCouchDB(sylabsPath) {
  const jason = {
    type: "token",
    lock: 0,
    done: 0,
    scrub_count: 0,
    exit_code: "0",
    Input: "dCache:/projects/imagen/input_data/trello_logo.png",
    Output: "dCache:/projects/imagen/output_data",
    container_path: sylabsPath,
    Parameters: {
      EPOCHS: 1000,
    },
    start_time: "00:00:00",
    end_time: "00:00:00",
    time_taken: "00:00:00",
  };

  return cy.task("saveDoc", jason).then((response) => response.id);
}

function insertTaskInPostgreSQL(name, tokenId) {
  const insertTaskQuery = `INSERT INTO tasks_table (name, token_id) VALUES ('${name}', '${tokenId}') RETURNING id`;
  return cy.task("runQuery", insertTaskQuery).then((result) => {
    expect(result.rowCount).to.be.greaterThan(0);
    return result.rows[0].id;
  });
}

function getTagIdByName(name, type) {
  const fetchTagQuery = `SELECT id FROM tags_table WHERE name = '${name}' AND type = '${type}'`;
  return cy.task("runQuery", fetchTagQuery).then((tagResult) => {
    if (tagResult.rowCount > 0) {
      return tagResult.rows[0].id;
    } else {
      const insertTagQuery = `INSERT INTO tags_table (name, type) VALUES ('${name}', '${type}') RETURNING id`;
      return cy.task("runQuery", insertTagQuery).then((insertTagResult) => {
        expect(insertTagResult.rowCount).to.be.greaterThan(0);
        return insertTagResult.rows[0].id;
      });
    }
  });
}

function insertTaskTagRelation(taskId, tagId) {
  const insertTaskTagQuery = `INSERT INTO tasks_tags (task_id, tag_id) VALUES (${taskId}, ${tagId})`;
  return cy.task("runQuery", insertTaskTagQuery);
}

Cypress.Commands.add("createTaskWithUserTag", (name, userEmail, sylabsPath) => {
  createTaskInCouchDB(sylabsPath).then((tokenId) => {
    insertTaskInPostgreSQL(name, tokenId).then((taskId) => {
      getTagIdByName(userEmail, "user").then((userTagId) => {
        insertTaskTagRelation(taskId, userTagId).then(() => ({
          id: taskId,
          name: name,
          token_id: tokenId,
          tags: [userTagId],
        }));
      });
    });
  });
});

Cypress.Commands.add(
  "createTaskWithUserTagAndCustomTag",
  (name, userEmail, customTagName, sylabsPath) => {
    createTaskInCouchDB(sylabsPath).then((tokenId) => {
      insertTaskInPostgreSQL(name, tokenId).then((taskId) => {
        getTagIdByName(userEmail, "user").then((userTagId) => {
          getTagIdByName(customTagName, "custom").then((customTagId) => {
            const insertTaskTagQueries = `
            INSERT INTO tasks_tags (task_id, tag_id) VALUES (${taskId}, ${userTagId});
            INSERT INTO tasks_tags (task_id, tag_id) VALUES (${taskId}, ${customTagId});
          `;
            cy.task("runQuery", insertTaskTagQueries).then(() => ({
              id: taskId,
              name: name,
              token_id: tokenId,
              tags: [userTagId, customTagId],
            }));
          });
        });
      });
    });
  }
);

Cypress.Commands.add(
  "createTaskWithTwoUserTags",
  (name, userEmail1, userEmail2, sylabsPath) => {
    createTaskInCouchDB(sylabsPath).then((tokenId) => {
      insertTaskInPostgreSQL(name, tokenId).then((taskId) => {
        getTagIdByName(userEmail1, "user").then((userTagId1) => {
          getTagIdByName(userEmail2, "user").then((userTagId2) => {
            const insertTaskTagQueries = `
            INSERT INTO tasks_tags (task_id, tag_id) VALUES (${taskId}, ${userTagId1});
            INSERT INTO tasks_tags (task_id, tag_id) VALUES (${taskId}, ${userTagId2});
          `;
            cy.task("runQuery", insertTaskTagQueries).then(() => ({
              id: taskId,
              name: name,
              token_id: tokenId,
              tags: [userTagId1, userTagId2],
            }));
          });
        });
      });
    });
  }
);
