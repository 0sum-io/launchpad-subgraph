# Launchpad Subgraph

## Setup

1\. Follow this guide to set up the Graph node:  
[https://docs.moonbeam.network/node-operators/indexer-nodes/thegraph-node/](https://docs.moonbeam.network/node-operators/indexer-nodes/thegraph-node/)

2\. Update the RPC address of the mainnet in `docker-compose.yml`.  
Modify the section:  
`ethereum: 'mbase:http://127.0.0.1:9944'`

3\. Update the Graph node and IPFS addresses in the `package.json` of your subgraph project.

For example: `"deploy-dev": "graph deploy launchpad --ipfs http://161.35.48.172:5001/ --node http://161.35.48.172:8020/",`

4\. Update the contract addresses in your subgraph project:

- In `subgraph.yaml`, update the addresses for the 
    - `Uni V3 Factory`: 0x07DE5780b0e6E6Ac52d292bac2c8037CB9Abd0D1
    - `PresaleManager`: 0x35d02CA89bcBD2421E0B049347AD43308bFA0747

![](https://github.com/user-attachments/assets/d58528de-f474-455b-955e-1b027d2b6cf5)
![](https://github.com/user-attachments/assets/aa5705ae-a6f0-4eea-9aef-51df80392563)

- In `chains.ts`, update the `factoryAddress`.

5\. Use the `yarn deploy-dev` command to deploy the subgraph.

![](https://github.com/user-attachments/assets/25462178-7190-4d82-ae69-f63740a01c36)


## Subgraph Endpoint

Synced at: https://thegraph.com/hosted-service/subgraph/ianlapham/uniswap-v3-subgraph?selected=playground

Pending Changes at same URL

## Running Unit Tests

1. Install [Docker](https://docs.docker.com/get-docker/) if you don't have it already
2. Install postgres: `brew install postgresql`
3. `yarn run build:docker`
4. `yarn run test`

## Adding New Chains

1. Create a new subgraph config in `src/utils/chains.ts`. This will require adding a new `<NETWORK_NAME>_NETWORK_NAME` const for the corresponding network.
2. Add a new entry in `networks.json` for the new chain. The network name should be derived from the CLI Name in The Graph's [supported networks documenation](https://thegraph.com/docs/en/developing/supported-networks/). The factory address can be derived from Uniswap's [deployments documentation](https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments).
3. To deploy to Alchemy, run the following command:

```
yarn run deploy:alchemy --
  <SUBGRAPH_NAME>
  --version-label <VERSION_LABEL>
  --deploy-key <DEPLOYMENT_KEY>
  --network <NETWORK_NAME>
```
