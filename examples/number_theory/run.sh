#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/4] mclang: compile mc/number_theory.mc ==="
$MCLANG "$DIR/mc/number_theory.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/4] C: build + run ==="
gcc "$DIR/mc/number_theory.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/4] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/number_theory.c" -lm -o "$DIR/build/number_theory.dll"
else
  gcc -shared -fPIC "$DIR/mc/number_theory.c" -lm -o "$DIR/build/number_theory.so"
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
  $EMCC "$DIR/mc/number_theory.c" \
    -o "$DIR/build/number_theory.js" \
    -s EXPORTED_FUNCTIONS='["_gcd","_lcm","_is_even","_is_odd","_is_divisible","_is_integer","_is_natural","_triangular","_digital_root"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s ENVIRONMENT='node' \
    -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi
