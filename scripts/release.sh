#!/bin/bash
set -x
set -e
# Start in this directory even if ran elsewhere
cd "$(dirname "$0")"
cd ..

if [ -n "$(git status --porcelain)" ]; then
  echo "Your git status is not clean. Aborting.";
  exit 1;
fi

# git reset --hard HEAD && git checkout master
# if `~/.npmrc` does not exist, copy `./scripts/.npmrc-ci` there
#test -e ~/.npmrc || cp ./scripts/.npmrc-ci ~/.npmrc
# hmm.. that's not working; perhaps CI has `~/.npmrc`
git config --global user.email $GITHUB_EMAIL
git config --global user.name "Knapsack Bot"
cp ./scripts/.npmrc-ci ~/.npmrc
PREV_VERSION=`git describe --abbrev=0`
# see `lerna.json` for options
GH_TOKEN=$GITHUB_TOKEN ./node_modules/.bin/lerna version --github-release --conventional-commits --yes
echo 'done with lerna version'
echo ''
./node_modules/.bin/lerna publish --yes
CURRENT_VERSION=`git describe --abbrev=0`
echo "Previous version: $PREV_VERSION Current Version: $CURRENT_VERSION"
echo "changelog test output:"
CHANGES="`git show $PREV_VERSION:CHANGELOG.md | diff -u - CHANGELOG.md | grep '^\+' | grep -v '^\++' | sed -E 's/^\+//'`"
#echo "Creating GitHub release and announcing to issues"
echo "$CHANGES"
#echo "$CHANGES" | node ./scripts/create-github-release.js "$CURRENT_VERSION"
echo "END: changelog"
