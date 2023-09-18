// in the terminal, run the command 'npx cypress run' to run the tests headless and view video 

describe('Test log out', () => {

beforeEach('login to the app', () => {
    cy.loginToApplication()
});

    it('verify user can log out successfully', () => {
        cy.contains('Settings').click()
        cy.contains('Or click here to logout').click()
        cy.get('.navbar-nav').should('contain', 'Sign up')
    });
});