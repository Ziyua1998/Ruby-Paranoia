#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp index.html 404.html dist/
cp amai-portrait.png dist/
cp -R assets extras media world characters texts music film gallery author dist/

echo "Cloudflare Pages static bundle prepared in dist/"
