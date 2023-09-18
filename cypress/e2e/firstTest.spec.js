// TO START THE LOCALHOST, RUN NPM START IN POWERSHELL TERMINAL
// TO START CYPRESS, RUN NPX CYPRESS OPEN IN POWERSHELL TERMINAL
// NAVIGATE TO http://localhost:4200/pages


/// <reference types="cypress" />

describe('Test with backend', () => {
  
	beforeEach('login to the app', () => {
		// this mock data must be implemented before any API calls are made
		cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'mockTags.json'})
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

	
	it.skip('intercepting and modifying the request and response', () => {

		// This will override .type('This is the description - 9112023') to "This is a modified description" when posting
		// cy.intercept({method: 'POST', path: 'articles'}, (request) => {
		// 	request.body.article.description = "This is a modified description"
		// }).as('postArticle')

		// This will grab the posted description and modify it
		cy.intercept({method: 'POST', path: 'articles'}, (request) => {
			request.reply( request => {
				expect(request.body.article.description).to.equal("This is the description - 9112023")
				request.body.article.description = "This is a modified description"
			})
			
		}).as('postArticle')

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
			expect(xhr.response.body.article.description).to.equal('This is a modified description')
		})
	})

	it('verify popular tags are displayed', () => {
		cy.log('we logged in')
		cy.get('.tag-list')
		.should('contain', 'cypress')
		.and('contain', 'automation')
		.and('contain', 'testing')
	})

	it('verify global feed likes are counted', () => {
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

	it('delete a new article in global feed', () => {

		const bodyRequest = {
			"article": {
				"tagList": [],
				"title": "Request from API - 9122023",
				"description": "API testing is easy",
				"body": "This is the body"
			}
		}

		// make an API request and grab the token for that user
		// @token comes from commands.js file
		cy.get('@token').then(token => {

			// once logged in, make a POST request to create a new article
			cy.request({
				url: 'https://api.realworld.io/api/articles/',
				headers: { 'Authorization': 'Token ' + token },
				method: 'POST',
				body: bodyRequest
			}).then (response => {
				expect(response.status).to.equal(201)
			})

			// delete the article that was just created
			cy.contains('Global Feed').click()	
            cy.get('.article-preview').first().click()
			cy.contains('Request from API').click()
            cy.get('.article-actions').contains('Delete Article').click()

			// make a GET request and check that the article was actually deleted by checking title
			cy.request({
				url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
				headers: { 'Authorization': 'Token ' + token },
				method: 'GET'
			}).its('body').then( body => {
				expect(body.articles[0].title).not.to.equal('Request from API - 9122023')
			})
		})
	})
})