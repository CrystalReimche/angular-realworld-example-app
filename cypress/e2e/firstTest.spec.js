/// <reference types="cypress" />

describe('Test with backend', () => {
  
	beforeEach('login to the app', () => {
		// this mock data must be implemented before any API calls are made
		cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'mockTags.json'})
		cy.loginToApplication()
	})

	// verify that our API actually made a request to create the article and a response was returned
	it('verify correct request and response', () => {

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
	})

	it('verify popular tags are displayed', () => {
		cy.log('we logged in')
		cy.get('.tag-list')
		.should('contain', 'cypress')
		.and('contain', 'automation')
		.and('contain', 'testing')
	})

	it.only('verify global feed likes are counted', () => {
		// the * wildcard will accept any url that's after 'feed'
		// last parameter is stubbing in dummy data
		cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0} )
		cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'})

		cy.contains('Global Feed').click()
		cy.get('app-article-list button').then( heartList => {
			expect(heartList[0]).to.contain('1')
			expect(heartList[1]).to.contain('5')
		})

		// use cy.fixture to access and modify predefined mock data
		cy.fixture('articles.json').then(file => {
			const articleLink = file.articles[1].slug
			file.articles[1].favoritesCount = 6
			cy.intercept('POST', 'https://api.realworld.io/api/articles/' + articleLink + '/favorite', file)
		})

		cy.get('app-article-list button').eq(1).click().should('contain', '6')
	})
})