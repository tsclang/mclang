#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/4] mclang: compile mc/statistics.mc ==="
$MCLANG "$DIR/mc/statistics.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/4] C: build + run ==="
gcc "$DIR/mc/statistics.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/4] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/statistics.c" -lm -o "$DIR/build/statistics.dll"
else
  gcc -shared -fPIC "$DIR/mc/statistics.c" -lm -o "$DIR/build/statistics.so"
fi
python3 "$DIR/src/python/main.py"

echo ""
echo "=== [4/4] JS: build wasm + run ==="
EMCC=""
if command -v emcc &>/dev/null; then
  EMCC="emcc"
elif [ -f "/c/emsdk/upstream/emscripten/emcc.py" ]; then
  EMCC="python3 /c/emsdk/upstream/emscripten/emcc.py"
fi
if [ -n "$EMCC" ]; then
  $EMCC "$DIR/mc/statistics.c" \
    -o "$DIR/build/statistics.js" \
    -s EXPORTED_FUNCTIONS='["_avg","_spread","_cv","_data_range","_z_score","_normalize","_malloc","_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap","HEAPF64"]' \
    -s ENVIRONMENT='node' \
    -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi
