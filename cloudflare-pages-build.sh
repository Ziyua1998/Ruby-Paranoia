#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp index.html 404.html dist/
cp -R assets extras media world dist/

echo "Cloudflare Pages static bundle prepared in dist/"
