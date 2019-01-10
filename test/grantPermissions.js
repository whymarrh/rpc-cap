const test = require('tape')
const LoginController = require('../')
const equal = require('fast-deep-equal')

// TODO: Standardize!
// Maybe submit to https://github.com/ethereum/wiki/wiki/JSON-RPC-Error-Codes-Improvement-Proposal
const USER_REJECTION_CODE = 5

test('grantPermissions with no permission creates no permissions', async (t) => {
  const expected = {}

  const ctrl = new LoginController({
  })

  const domain = 'login.metamask.io'
  const otherDomain = 'other.domain.com'
  let req = {
    method: 'grantPermissions',
    params: [
      otherDomain,
      {
        'restricted': {},
      }
    ]
  }
  let res = {}

  ctrl.providerMiddlewareFunction(domain, req, res, next, end)

  function next() {
    t.ok(false, 'next should not be called')
    t.end()
  }

  function end(reason) {
    t.ok(reason, 'error thrown')
    t.equal(reason.code, 1, 'Auth error returned')
    t.ok(equal(ctrl._getPermissions(otherDomain), expected), 'should have no permissions still')
    t.ok(equal(ctrl._getPermissions(domain), expected), 'should have no permissions still')
    t.end()
  }
})

test('grantPermissions with permission creates permission', async (t) => {
  const expected = {
     domains: {
      'login.metamask.io': {
        permissions: {
          'restricted': {
            date: '0',
          }
        }
      }
    }
  }

  const ctrl = new LoginController({
     domains: {
      'login.metamask.io': {
        permissions: {
          'restricted': {
            date: '0',
          }
        },
      }
    }
  })

  const domain = 'login.metamask.io'
  const otherDomain = 'other.domain.com'
  let req = {
    method: 'grantPermissions',
    params: [
      otherDomain,
      {
        'restricted': {},
      }
    ]
  }
  let res = {}

  ctrl.providerMiddlewareFunction(domain, req, res, next, end)

  function next() {
    t.ok(false, 'next should not be called')
    t.end()
  }

  function end(reason) {
    t.error(reason, 'error should not be thrown')
    t.notOk(reason, 'should throw no error')
    t.notOk(res.error, 'should assign no error')

    const otherPerms = ctrl._getPermissions(otherDomain)

    for (let key in req.params[1]) {
      t.ok(key in otherPerms, 'The requested permission was created.')
    }
    t.end()
  }
})


