#! /bin/bash

# set variables
RPC_URL="https://rpc-pepe-unchained-test-ypyaeq1krb.t.conduit.xyz"
START_BLOCK=961300
UNISWAP_V3_FACTORY="0x07DE5780b0e6E6Ac52d292bac2c8037CB9Abd0D1" # lowercased
PRESALE_MANAGER="0x35d02CA89bcBD2421E0B049347AD43308bFA0747" # lowercased

# if darwin, set port to 8000
if [[ "$OSTYPE" == "darwin"* ]]; then
    PORT=8000
else
    PORT=80
fi

# Function to run sed command based on OS
run_sed() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "$1" "$2"
    else
        # Linux and others
        sed -i "$1" "$2"
    fi
}

# Replace text in ./docker-compose.yml with RPC_URL
run_sed "s|<RPC_URL>|$RPC_URL|g" "./docker-compose.yml"

# Replace text in ./docker-compose.yml with PORT
run_sed "s|<PORT>|$PORT|g" "./docker-compose.yml"

# Replace text in ./subgraph.yaml with FACTORY_ADDRESS
run_sed "s|<UNISWAP_V3_FACTORY>|$UNISWAP_V3_FACTORY|g" "./subgraph.yaml"

# Replace text in ./subgraph.yaml with FACTORY_ADDRESS
run_sed "s|<PRESALE_MANAGER>|$PRESALE_MANAGER|g" "./subgraph.yaml"

# Replace text in ./subgraph.yaml with START_BLOCK
run_sed "s|<START_BLOCK>|$START_BLOCK|g" "./subgraph.yaml"

# Replace text in ./src/utils/chains.ts with FACTORY_ADDRESS
run_sed "s|<UNISWAP_V3_FACTORY>|$UNISWAP_V3_FACTORY|g" "./src/utils/chains.ts"

# install nodejs
if ! command -v node &> /dev/null
then
    echo "nodejs is not installed, installing nodejs"
    sudo apt install nodejs
fi

# install npm
if ! command -v npm &> /dev/null
then
    echo "npm is not installed, installing npm"
    sudo apt install npm
fi

# install yarn 
if ! command -v yarn &> /dev/null
then
    echo "yarn is not installed, installing yarn"
    sudo npm i -g yarn
fi

# install pm2
if ! command -v pm2 &> /dev/null
then
    echo "pm2 is not installed, installing pm2"
    sudo npm i -g pm2
fi

# install docker
if ! command -v docker &> /dev/null
then
    echo "docker is not installed, installing docker"
    curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
fi

# start docker containers
echo "starting docker containers"
if [[ "$OSTYPE" == "darwin"* ]]; then
    docker-compose up -d
else
    sudo docker compose up -d
fi

# pause seconds
echo "pausing..."
sleep 300

# deploy subgraph
echo $"yarn..."
sudo yarn && \
    sudo yarn codegen && \
    sudo yarn build && \
    sudo yarn create-local --access-token ad71fa84f01610bf913efceda5fd7bc3 && \
    sudo yarn deploy-local --access-token ad71fa84f01610bf913efceda5fd7bc3