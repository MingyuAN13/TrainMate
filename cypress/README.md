# How to use the testing environment
1. To start the program write: npx cypress open.
2. select the end-to-end testing.
3. Now select the environment which you want to test in.

Most custom functions has to be inside the describe function of cypress, unless stated otherwise.

# Example file
Under the folder presets-trainmate there is an example file which uses these custom functions

# User functions
These functions will be related to users.

## cy.createAdminUser(email, password)
This will create an admin user in the application.

**Input:**
- email (optional): put in the email of the account, if none defined it will create a random one.
- password (optional): put in the password of the account, if none defined it will create a random one.

**Returns (as object):**
- id: is the id of the created user.
- email: is the email of the created user.
- password: is the password of the created user.
- passwordHash: the hashed password
- salt: the salt used for hashing
- role: is the role of the created user.

## cy.createAiResearcherUser(email, password)
This will create an ai researcher user in the application.

**Input:**
- email (optional): put in the email of the account, if none defined it will create a random one.
- password (optional): put in the password of the account, if none defined it will create a random one.

**Returns (as object):**
- id: is the id of the created user.
- email: is the email of the created user.
- password: is the password of the created user.
- passwordHash: the hashed password
- salt: the salt used for hashing
- role: is the role of the created user.

## cy.createDataEngineerUser(email, password)
This will create an data engineer user in the application.

**Input:**
- email (optional): put in the email of the account, if none defined it will create a random one.
- password (optional): put in the password of the account, if none defined it will create a random one.

**Returns (as object):**
- id: is the id of the created user.
- email: is the email of the created user.
- password: is the password of the created user.
- passwordHash: the hashed password
- salt: the salt used for hashing
- role: is the role of the created user.

# Tag functions
These functions will be related to the tags.

## cy.createTag(name)
This will create a tag in the database.

**Input:**
- name: put in the name of the tag.

**Returns (as object):**
- id: is the id of the created user.
- name: is the name of the created tag.

# Main functions
These functions are general functions which will setup the environment.

## cy.resetDatabase()
This sets up the database for use. 

This function can only be used outside of the describe cypress function.

### Code suggesting
At the top of the file add 
```js
beforeEach(() => {
    cy.resetDatabase();
});
```


