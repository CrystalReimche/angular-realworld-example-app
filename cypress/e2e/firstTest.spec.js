/// <reference types="cypress" />

describe('Test with backend', () => {
  
	beforeEach('login to the app', () => {
		cy.loginToApplication()
	})

	// verify that our API actually made a request to create the article and a response was returned
	it.only('verify correct request and response', () => {

		// first define what you want to intercept
		// request method, request url, store it in an alias
		cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticle')

		// then you make the action
		cy.contains('New Article').click()
		cy.get('[formcontrolname="title"]').type('This is the title - 9112023')
		cy.get('[formcontrolname="description"]').type('This is the description - 9112023')
		cy.get('[formcontrolname="body"]').type('This is the body - 9112023')
		cy.contains('Publish Article').click()

		// then you make the assertion
		// Cypress will automatically wait until the call is complete before looking into it
		cy.wait('@postArticle').then(xhr => {
			console.log(xhr)
			expect(xhr.response.statusCode).to.equal(201)
			expect(xhr.request.body.article.body).to.equal('This is the body - 9112023')
			expect(xhr.response.body.article.description).to.equal('This is the description - 9112023')
		})
	});
})