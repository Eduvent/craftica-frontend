/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      mockAuthenticatedUser(): Chainable<void>
      clearAuth(): Chainable<void>
    }
  }
}

import './commands'

export {}