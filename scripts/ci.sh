#!/bin/bash
set -x
set -e
# Start in scripts/ even if run from root directory
cd "$(dirname "$0")"
# Run everything from root of repo
cd ..

if [ "$TRAVIS_TAG" ]; then
  echo "Tag build $TRAVIS_TAG"
  echo "========"
  echo "START: deploy"
  echo "========"
  ./scripts/create-knapsack-deploy/deploy.sh;
  echo "========"
  echo "END: deploy"
  echo "========"

else

  echo "Not tag build"

  echo "========"
  echo "START: yarn build:all"
  echo "========"
  yarn build:all
  echo "========"
  echo "END: yarn build:all"
  echo "========"

  echo "========"
  echo "START: yarn test"
  echo "========"
  yarn test
  echo "========"
  echo "END: yarn test"
  echo "========"

  if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "========"
    echo "START: e2e-simple"
    echo "========"
    git checkout $TRAVIS_BRANCH
    ./scripts/test-publish.sh
    echo "========"
    echo "END: e2e-simple"
    echo "========"
  else
    echo "Not doing e2e testing for this build"
  fi

  if [[ "$TRAVIS_BRANCH" == "master" && "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    echo "On master branch"
    echo "========"
    echo "START: release"
    echo "========"
    ./scripts/release.sh
    git pull origin "$TRAVIS_BRANCH"
    git push origin "$TRAVIS_BRANCH" --follow-tags --no-verify
    echo "========"
    echo "END: release"
    echo "========"
  fi

fi
