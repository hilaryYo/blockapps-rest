import { BigNumber } from "bignumber.js";
import {
  Endpoint,
  constructMetadata,
  constructEndpoint,
  get,
  post,
  postue,
  getNodeUrl,
  setAuthHeaders
} from "./util/api.util";
import { TxPayloadType } from "./constants";

async function getUsers(args, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.USERS, options);
  return get(url, endpoint, setAuthHeaders(args, options));
}

async function getUser(args, options) {
  const url = getNodeUrl(options);
  const urlParams = {
    username: args.username
  };
  const endpoint = constructEndpoint(Endpoint.USER, options, urlParams);
  return get(url, endpoint, setAuthHeaders(args, options));
}

async function createUser(args, options) {
  const url = getNodeUrl(options);
  const data = {
    password: args.password
  };
  const urlParams = {
    username: args.username
  };
  const endpoint = constructEndpoint(Endpoint.USER, options, urlParams);
  return postue(url, endpoint, data, options);
}

async function fill(user, options) {
  const body = {};
  const url = getNodeUrl(options);
  const urlParams = {
    username: user.username,
    address: user.address
  };
  const endpoint = constructEndpoint(Endpoint.FILL, options, urlParams);
  return postue(url, endpoint, body, setAuthHeaders(user, options));
}

async function createContract(user, contract, options) {
  const payload = {
    contract: contract.name,
    src: contract.source,
    args: contract.args,
    metadata: constructMetadata(options, contract.name)
  };
  const body = {
    txs: [
      {
        payload,
        type: TxPayloadType.CONTRACT
      }
    ]
  };
  const pendingTxResult = await sendTransactions(user, body, options);
  return pendingTxResult;
}

async function createContractList(user, contracts, options) {
  const txs = contracts.map(contract => {
    const payload = {
      contract: contract.name,
      src: contract.source,
      args: contract.args,
      metadata: constructMetadata(options, contract.name)
    };
    const tx = {
      payload,
      type: TxPayloadType.CONTRACT
    };
    return tx;
  });
  const body = {
    txs
  };
  const pendingTxResultList = await sendTransactions(user, body, options);
  return pendingTxResultList;
}

async function blocResults(user, hashes, options) {
  // TODO untested code
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.TXRESULTS, options);
  return post(url, endpoint, hashes, setAuthHeaders(user, options));
}

async function getAccounts(user, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.ACCOUNT, options);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function getBalance(user, options) {
  let address = user.address;
  if (!address) {
    const response = await getKey(user, options);
    address = response.address;
  }
  const accounts = await getAccounts(user, {
    ...options,
    // this endpoint does not accept the resolve flag
    isAsync: true,
    query: {
      address
    }
  });
  if (accounts.length == 0) {
    return new BigNumber(0);
  }

  return new BigNumber(accounts[0].balance);
}

async function getState(user, contract, options) {
  const url = getNodeUrl(options);
  const urlParams = {
    name: contract.name,
    address: contract.address
  };
  const endpoint = constructEndpoint(Endpoint.STATE, options, urlParams);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function call(user, callMethodArgs, options) {
  const { contract, method, args, value } = callMethodArgs;
  const valueFixed = value instanceof BigNumber ? value.toFixed(0) : value;
  const payload = {
    contractName: contract.name,
    contractAddress: contract.address,
    value: valueFixed,
    method,
    args,
    metadata: constructMetadata(options, contract.name)
  };
  const tx = {
    payload,
    type: TxPayloadType.FUNCTION
  };
  const body = {
    txs: [tx]
  };
  const pendingTxResult = await sendTransactions(user, body, options);
  return pendingTxResult;
}

async function callList(user, callListArgs, options) {
  const txs = callListArgs.map(callArgs => {
    const { contract, method, args, value } = callArgs;
    const valueFixed = value instanceof BigNumber ? value.toFixed(0) : value;
    const payload = {
      contractName: contract.name,
      contractAddress: contract.address,
      value: valueFixed,
      method,
      args,
      metadata: constructMetadata(options, contract.name)
    };
    const tx = {
      payload,
      type: TxPayloadType.FUNCTION
    };
    return tx;
  });
  const body = {
    txs
  };
  const pendingTxResultList = await sendTransactions(user, body, options);
  return pendingTxResultList;
}

async function sendTransactions(user, body, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.SEND, options);
  return post(url, endpoint, body, setAuthHeaders(user, options));
}

async function send(user, sendTx, options) {
  const body = {
    txs: [
      {
        payload: sendTx,
        type: TxPayloadType.TRANSFER
      }
    ]
  };
  return sendTransactions(user, body, options);
}

async function getKey(user, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.KEY, options);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function createKey(user, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.KEY, options);
  const body = {};
  return post(url, endpoint, body, setAuthHeaders(user, options));
}

async function search(user, contract, options) {
  const url = getNodeUrl(options);
  const urlParams = {
    name: contract.name
  };
  const endpoint = constructEndpoint(Endpoint.SEARCH, options, urlParams);
  return get(url, endpoint, setAuthHeaders(user, options));
}

// TODO: check options.params and options.headers in axoos wrapper.
async function getChains(chainIds, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.CHAIN, {
    config: options.config,
    chainIds
  });
  return get(url, endpoint, options);
}

async function createChain(body, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.CHAIN, options);
  return await post(url, endpoint, body, options);
}

async function uploadExtStorage(body, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.EXT_UPLOAD, options);
  return await post(url, endpoint, body, options);
}

async function attestExtStorage(body, options) {
  const url = getNodeUrl(options);
  const endpoint = constructEndpoint(Endpoint.EXT_ATTEST, options);
  return await post(url, endpoint, body, options);
}

async function verifyExtStorage(user, contract, options) {
  const url = getNodeUrl(options);
  const params = {
    contractAddress: contract.address
  };
  const endpoint = constructEndpoint(Endpoint.EXT_VERIFY, options, params);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function downloadExtStorage(user, contract, options) {
  const url = getNodeUrl(options);
  const params = {
    contractAddress: contract.address
  };
  const endpoint = constructEndpoint(Endpoint.EXT_DOWNLOAD, options, params);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function listExtStorage(user, args, options) {
  const url = getNodeUrl(options);
  const { limit, offset } = args;
  const params = {
    limit,
    offset
  };
  const endpoint = constructEndpoint(Endpoint.EXT_LIST, options, params);
  return get(url, endpoint, setAuthHeaders(user, options));
}

async function pingOauth(user, options){
  const url = getNodeUrl(options)
  const endpoint = constructEndpoint(Endpoint.KEY, options)
  const result = await get(url, endpoint, setAuthHeaders(user, options))
  return result.status
}

export default {
  getAccounts,
  getBalance,
  getUsers,
  getUser,
  createUser,
  createContract,
  createContractList,
  fill,
  blocResults,
  getState,
  call,
  callList,
  send,
  sendTransactions,
  getKey,
  createKey,
  search,
  getChains,
  createChain,
  uploadExtStorage,
  attestExtStorage,
  verifyExtStorage,
  downloadExtStorage,
  listExtStorage,
  pingOauth
}
