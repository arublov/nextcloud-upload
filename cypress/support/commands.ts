/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-file-upload'

Cypress.Commands.add(
	'shouldHaveTrimmedText',
	{ prevSubject: true },
	(subject: JQuery<HTMLElement>, text: string) => {
		cy.wrap(subject)
			.should(element => expect(element.text().trim()).to.equal(text))
	},
)
