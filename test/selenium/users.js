const {Builder, By, Key, until} = require('selenium-webdriver')
const chai = require('chai');
const expect = chai.expect;
const _ = require('underscore');
const helpers = require('./helpers');

const host = 'http://localhost:8080';
const regularUser = 'notadmin';
const admin = 'casper';

describe('Users', function() {
  this.timeout('10s');
  let driver = null;
  before(async function() {
    driver = new Builder()
      .forBrowser('chrome')
      .build();
    // try {
    //   await driver.get(`${host}/devonly/fakelogin/${user}`);
    // }catch(err) {
    //   console.log(err);
    // }
  });
  
  after(() => {
    driver.quit();
  });

  //apparently we can't clear out the cookies
  // when running mocha-casperjs *.js
  //describe('Anonymously', function() {
  //  before(function() {
  //    phantom.clearCookies();
  //    casper.start(host+'/#/users');
  //    casper.thenOpen(host + '/#/users');
  //    casper.waitForSelector('a.user');
  //  });
  //
  //  function validateAnon(){
  //    it('should show various fields', function(){
  //      'Display Name'.should.be.textInDOM;
  //    });
  //  }

  //  describe('Visiting the users page', function() {
  //    it('there is only one user in the list', function() {
  //      "$('a.user').length".should.evaluate.to.equal(1);
  //      'a.user'.should.have.text('anon');
  //    });

  //    describe('clicking the user link', function() {
  //      before(function() {
  //        casper.click('a.user');
  //        casper.waitForSelector('article.user');
  //      });
  //      validateAnon();
  //    });
  //  });

  //  describe('Visiting a user page directly', function() {
  //    before(function() {
  //      casper.open(host + '/#/users/anon');
  //    });
  //    validateAnon();
  //  });

  //});
  
  describe('Logged in as a regular user', function() {
    before(async function() {
      await helpers.navigateAndWait(driver, `${host}/devonly/fakelogin/${regularUser}`, 'a.menu.users');
    });

    async function validateUsersPage(user){
      const shoulds = [regularUser, 'Name', 'Last Seen', 'Seen Tour', 'Username', 'Display Name'];
      for (let str of shoulds) {
        it(`${str} should be in DOM`, async function() {
          expect(await helpers.isTextInDom(driver, str)).to.be.true;
        });
      }
      it('edit user button should not be visible', async function() {
        expect(await helpers.isElementVisible(driver, 'button.editUser')).to.eql(false);
      });
    }
    
    describe('Visiting the users page', function() {
      before(async function() {
        try {
          await driver.findElement(By.css('a.menu.users')).click();
          await driver.wait(until.elementLocated(By.css('a.user')));
          //await driver.sleep(3000);
        }catch(err) {
          console.log(err);
        }
      });

      it('should have a list of users', async function() {
        expect(await helpers.getWebElements(driver, 'a.user')).to.have.lengthOf.at.least(10);
      });

      describe('clicking the user link', function() {
        before(async function() {
          await helpers.findAndClickElement(driver, `a[href$="${regularUser}"]`);
          await helpers.waitForSelector(driver, 'article.user');
          //await driver.sleep(3000);
        });
        describe('user info table', function() {
          validateUsersPage();
        });
      });

      describe('Visiting a user page directly', function() {
        before(async function() {
          await helpers.navigateAndWait(driver, `${host}/#/users/${regularUser}`, 'article.user');
        });
        describe('user info table', function() {
          validateUsersPage();
        });
        
      });
    });
  });
  
  describe('Logged in as an admin user', function() {
    before(async function() {
      await helpers.navigateAndWait(driver, `${host}/devonly/fakelogin/${admin}`, 'a.menu.users');
    });

    function validateUsersPage(){
      it('should show/hide various editable fields', async function(){
        
        expect(await helpers.isTextInDom(driver, admin)).to.be.true;
        
        await helpers.findAndClickElement(driver, 'button.editUser');
        // should there be an input to change username?
        expect(await helpers.isElementVisible(driver, 'input.userName')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'button.clearTour')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'input.isAdmin')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'input.isAuthorized')).to.be.true;

        await helpers.findAndClickElement(driver, 'button.saveUser');
      });
    }

    function validateNewUserPage() {
      it('should display the page title and form', async function() {
        expect(await helpers.isTextInDom(driver, 'Create New User')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'form#newUser')).to.be.true;
      });

      it('should show certain fields', async function() {
        expect(await helpers.isElementVisible(driver, 'input.displayName')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'input.userName')).to.be.true;
        expect(await helpers.isElementVisible(driver, 'input.isAuthorized')).to.be.true;
      });

      it('should let you create a new authorized user', async function() {
        let username = `${admin}test11`
        await helpers.findInputAndType(driver, 'form#newUser input.displayName', 'TEST');
        await helpers.findInputAndType(driver, 'form#newUser input.userName', username);
        await helpers.findAndClickElement(driver, 'button.newUser');
        await helpers.waitForSelector(driver, 'ul.listing');
        
        expect(await helpers.findAndGetText(driver, 'ul.listing>li.is-authorized:last-of-type')).to.contain(username);
      });
    }
  
    describe('Visiting the users page', function() {
      before(async function() {
        await helpers.navigateAndWait(driver, `${host}/#/users`, 'a.user');
      });
    
      it('should have a create new user link', async function() {
        expect(await helpers.isElementVisible(driver, 'a[href$="/users/new"]')).to.be.true;
      });

      it('should have a list of users', async function() {
        expect(await helpers.getWebElements(driver, 'a.user')).to.have.lengthOf.at.least(10);
      });

      describe('clicking the user link', function() {
        before(async function() {
          await helpers.findAndClickElement(driver, `a[href$="${admin}"]`);
          await helpers.waitForSelector(driver, 'article.user');
        });
        validateUsersPage();
      });

      describe('Visiting a user page directly', async function() {
        before(async function() {
          await helpers.navigateAndWait(driver, `${host}/#/users/${admin}`, 'article.user');
        });
        validateUsersPage();
      }); 

      describe('clicking the new user link', function() {
        before(async function() {
          await helpers.findAndClickElement(driver, 'a[href$="/users/new"]');
          await helpers.waitForSelector(driver, 'form#newUser');
        });
        validateNewUserPage();
      });
    });
  });
});