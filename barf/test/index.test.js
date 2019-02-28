const RestStatus = require('http-status-codes')
const { rest } = require('../index')
const { assert } = require('./assert')
const util = require('../util')
const fsUtil = require('../fsUtil')
const factory = require('./factory')

const { cwd } = util

const config = fsUtil.getYaml(`${cwd}/barf/test/config.yaml`)

describe('contracts', () => {
  let admin
  const options = { config }

  before(async () => {
    const uid = util.uid()
    admin = await factory.createAdmin(uid, options)
  })

  it('create contract - async', async () => {
    const uid = util.uid()
    const contractArgs = factory.createContractArgs(uid)
    const asyncOptions = { config, isAsync: true }
    const { hash } = await rest.createContract(admin, contractArgs, asyncOptions)
    assert.isOk(util.isHash(hash), 'hash')
  })

  it('create contract - sync', async () => {
    const uid = util.uid()
    const contractArgs = factory.createContractArgs(uid)
    const contract = await rest.createContract(admin, contractArgs, options)
    assert.equal(contract.name, contractArgs.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
  })

  it('create contract - sync - detailed', async () => {
    const uid = util.uid()
    const contractArgs = factory.createContractArgs(uid)
    options.isDetailed = true
    const contract = await rest.createContract(admin, contractArgs, options)
    assert.equal(contract.name, contractArgs.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
    assert.isDefined(contract.src, 'src')
    assert.isDefined(contract.bin, 'bin')
    assert.isDefined(contract.codeHash, 'codeHash')
    assert.isDefined(contract.chainId, 'chainId')
  })

  it('create contract - sync - BAD_REQUEST', async () => {
    const uid = util.uid()
    const contractArgs = factory.createContractSyntaxErrorArgs(uid)
    await assert.restStatus(async () => {
      return rest.createContract(admin, contractArgs, options)
    }, RestStatus.BAD_REQUEST, /line (?=., column)/)
  })

  it('create contract - constructor args', async () => {
    const uid = util.uid()
    const constructorArgs = { arg_uint: 1234 }
    const contractArgs = factory.createContractConstructorArgs(uid, constructorArgs)
    const contract = await rest.createContract(admin, contractArgs, options)
    assert.equal(contract.name, contractArgs.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
  })

  it('create contract - constructor args missing - BAD_REQUEST', async () => {
    const uid = util.uid()
    const contractArgs = factory.createContractConstructorArgs(uid)
    await assert.restStatus(async () => {
      return rest.createContract(admin, contractArgs, options)
    }, RestStatus.BAD_REQUEST, /argument names don't match:/)
  })
})

describe('state', () => {
  let admin
  const options = { config }

  before(async () => {
    const uid = util.uid()
    admin = await factory.createAdmin(uid, options)
  })

  it('get state', async () => {
    const uid = util.uid()
    const constructorArgs = { arg_uint: 1234 }
    const contractArgs = factory.createContractConstructorArgs(uid, constructorArgs)
    const contract = await rest.createContract(admin, contractArgs, options)
    const state = await rest.getState(contract, options)
    assert.equal(state.var_uint, constructorArgs.arg_uint)
  })

  it('get state - BAD_REQUEST - bad contract name', async () => {
    const uid = util.uid()
    await assert.restStatus(async () => {
      return rest.getState({ name: uid, address: 0 }, options)
    }, RestStatus.BAD_REQUEST, /Couldn't find/)
  })

  it('get state - large array', async () => {
    const MAX_ARRAY_SIZE = 100
    const SIZE = MAX_ARRAY_SIZE * 2 + 30
    const uid = util.uid()
    const constructorArgs = { size: SIZE }
    const contractArgs = await factory.createContractFromFile(`${cwd}/barf/test/fixtures/LargeArray.sol`, uid, constructorArgs)
    const contract = await rest.createContract(admin, contractArgs, options)
    {
      options.stateQuery = { name: 'array' }
      const state = await rest.getState(contract, options)
      assert.isDefined(state[options.stateQuery.name])
      assert.equal(state.array.length, MAX_ARRAY_SIZE)
    }
    {
      options.stateQuery = { name: 'array', length: true }
      const state = await rest.getState(contract, options)
      assert.isDefined(state[options.stateQuery.name])
      assert.equal(state.array, SIZE, 'array size')
    }
  })

})

describe('user', () => {
  const options = { config }

  it('get all users', async () => {
    const args = {}
    const result = await rest.getUsers(args, options)
    assert.equal(Array.isArray(result), true, 'return value is an array')
  })

  it('create user', async () => {
    const uid = util.uid()
    const username = `user_${uid}`
    const args = { username, password }
    const options = { config }
    const { address, user } = await rest.createUser(args, options)
    const isAddress = util.isAddress(address)
    assert.equal(isAddress, true, 'user is valid eth address')
    assert.equal(user.username, args.username, 'username')
    assert.equal(user.password, args.password, 'password')
    assert.equal(user.address, address, 'address')
  })

  it('get user', async () => {
    // create a new user
    const uid = util.uid()
    const username = `user_${uid}`
    const args = { username, password }
    const { user } = await rest.createUser(args, options)
    // get the user
    const args2 = { username }
    const address = await rest.getUser(args2, options)
    assert.equal(address, user.address, 'user is valid eth address')
  })
})

describe('include rest', () => {
  it('testAsync', async () => {
    const args = { a: 'b' }
    const result = await rest.testAsync(args)
    assert.deepEqual(result, args, 'test async')
  })

  it('testPromise', async () => {
    const args = { success: true }
    const result = await rest.testPromise(args)
    assert.deepEqual(result, args, 'test promise')

    args.success = false
    try {
      await rest.testPromise(args)
    } catch (err) {
      assert.deepEqual(err, args, 'test promise')
    }
  })
})
