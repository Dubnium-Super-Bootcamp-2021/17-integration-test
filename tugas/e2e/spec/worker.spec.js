describe('Worker Page', () => {
  it('Bisa buka halaman worker', () => {
    cy.visit('/worker.html');
    cy.get('ul')
      .children()
      .eq(0)
      .children()
      .should('have.attr', 'href', 'worker.html');
    cy.get('ul')
      .children()
      .eq(1)
      .children()
      .should('have.attr', 'href', 'tasks.html');
    cy.get('ul')
      .children()
      .eq(2)
      .children()
      .should('have.attr', 'href', 'performance.html');
  });

  describe('Menampilkan list pekerja', () => {
    it('Seharusnya bisa menampilkan data pekerja', () => {
      cy.intercept('/list', { fixture: 'listWorker.json' }).as('getWorker');
      cy.intercept('/photo/1612516523349-613.jpeg', {
        fixture: '1612516523349-613.jpeg',
      }).as('getImageWorker');
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get('#list').children().as('workerList');
      cy.get('@workerList').should('have.length', '3');
      cy.get('@workerList').eq(0).should('contain.text', 'Angga');
      cy.get('@workerList')
        .eq(0)
        .find('img')
        .should('have.attr', 'src')
        .should(
          'include',
          'http://localhost:7001/photo/1612516523349-613.jpeg'
        );
      cy.get('@workerList').eq(1).should('contain.text', 'Dika');
      cy.get('@workerList')
        .eq(0)
        .find('img')
        .should('have.attr', 'src')
        .should(
          'include',
          'http://localhost:7001/photo/1612516523349-613.jpeg'
        );
      cy.get('@workerList').eq(2).should('contain.text', 'Putra');
      cy.get('@workerList')
        .eq(0)
        .find('img')
        .should('have.attr', 'src')
        .should(
          'include',
          'http://localhost:7001/photo/1612516523349-613.jpeg'
        );
    });

    it('Seharusnya error ketika server mati', () => {
      cy.intercept(
        {
          pathname: '/list',
          method: 'GET',
        },
        {
          statusCode: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      ).as('getWorker');
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get('#error-text').should('have.text', 'gagal memuat daftar pekerja');
    });
  });

  describe('Menambah list pekerja', () => {
    beforeEach(() => {
      cy.intercept('/list', { fixture: 'listWorker.json' }).as('getWorker');
      cy.intercept('/photo/1612516523349-613.jpeg', {
        fixture: '1612516523349-613.jpeg',
      }).as('photoWorker');
    });

    it('Seharusnya pekerja bertambah ketika form disubmit ', () => {
      cy.intercept('/register', { fixture: 'registerWorker.json' }).as(
        'registerWorker'
      );
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get('#name').type('Dani');
      cy.get('#age').type('23');
      cy.get('#photo').attachFile('1612516523349-613.jpeg');
      cy.get('#bio').type('Hello World!!!');
      cy.get('#address').type('Jakarta');
      cy.get('#form').submit();
      cy.wait('@registerWorker');
      cy.get('#list').children().as('wokerList');
      cy.get('@wokerList').should('have.length', 4);
    });

    it('Seharusnya reset ketika form disubmit', () => {
      cy.intercept('/register', { fixture: 'registerWorker.json' }).as(
        'registerWorker'
      );
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get('#name').type('Dani');
      cy.get('#age').type('23');
      cy.get('#photo').attachFile('1612516523349-613.jpeg');
      cy.get('#bio').type('Hello World!!!');
      cy.get('#address').type('Jakarta');
      cy.get('#form').submit();
      cy.get('#name').should('be.empty');
      cy.get('#age').should('be.empty');
      cy.get('#photo').should('be.empty');
      cy.get('#bio').should('be.empty');
      cy.get('#address').should('be.empty');
    });

    it('Error ketika form tidak lengkap', () => {
      cy.intercept(
        {
          pathname: '/register',
          method: 'POST',
        },
        {
          statusCode: 401,
          headers: {
            'content-type': 'application/json',
          },
        }
      ).as('registerWorker');
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get('#name').type('Dani');
      cy.get('#age').type('23');
      cy.get('#photo').attachFile('1612516523349-613.jpeg');
      cy.get('#bio').type('Hello World!!!');
      cy.get('#address').type('Jakarta');
      cy.get('#form').submit();
      cy.wait('@registerWorker');
      cy.get('#error-text').should('have.text', 'gagal mendaftarkan Dani');
    });
  });

  describe('Menghapus list pekerja', () => {
    beforeEach(() => {
      cy.intercept('/list', { fixture: 'listWorker.json' }).as('getWorker');
      cy.intercept('/photo/1612516523349-613.jpeg', {
        fixture: '1612516523349-613.jpeg',
      }).as('getImageWorker');
    });

    it('Seharusnya nama pekerja hilang ketika dihapus', () => {
      cy.intercept('DELETE', '/remove', { fixture: 'registerWorker.json' });
      cy.visit('/worker.html');
      cy.wait('@getWorker');
      cy.get(':nth-child(1) > button').click();
      cy.get('#list').children().as('wokerList');
      cy.get('@wokerList').should('have.length', 2);
    });

    it('Seharusnya error ketika gagal menghapus pekerja', () => {
      cy.intercept(
        {
          pathname: '/remove',
          method: 'DELETE',
        },
        {
          statusCode: 500,
          headers: {
            'content-type': 'application/json',
          },
        }
      ).as('deleteList');
      cy.visit('/worker.html');
      cy.get(':nth-child(1) > button').click();
      cy.wait('@deleteList');
      cy.get('#error-text').should('have.text', 'gagal menghapus pekerja');
    });
  });
});
