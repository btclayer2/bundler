#!/bin/bash -e
cd `cd \`dirname $0\`;pwd`

#need to preprocess first to have the Version.js
test -z $NOBUILD && yarn preprocess

test -z "$VERSION" && VERSION=`jq -r .version ../../packages/bundler/package.json`
echo version=${VERSION}-arm64

IMAGE=btclayer2/bundler

#build docker image of bundler
#rebuild if there is a newer src file:
find ./dbuild.sh ../../packages/*/src/ -type f -newer dist/bundler.js 2>&1 | head -2 | grep  . && {
	echo webpacking..
	npx webpack
}

docker buildx build \
  --platform linux/arm64 \
  --push \
  -t $IMAGE:latest-arm64 \
  -t $IMAGE:${VERSION}-arm64 \
  . || {
    echo "Failed to build/push image"
    exit 1
  }

echo "== Images have been built and pushed:"
echo "   $IMAGE:latest-arm64"
echo "   $IMAGE:${VERSION}-arm64"