#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/4] mclang: compile mc/math.mc (imports shapes2d + shapes3d) ==="
$MCLANG "$DIR/mc/math.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/4] C: build + run ==="
gcc "$DIR/mc/math.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/4] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/math.c" -lm -o "$DIR/build/math.dll"
else
  gcc -shared -fPIC "$DIR/mc/math.c" -lm -o "$DIR/build/math.so"
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
  $EMCC "$DIR/mc/math.c" \
    -o "$DIR/build/math.js" \
    -s EXPORTED_FUNCTIONS='["_s2__area","_s2__perimeter","_s2__rect_area","_s2__rect_perimeter","_s2__tri_area","_s3__area","_s3__volume","_s3__cube_area","_s3__cube_volume","_s3__cyl_area","_s3__cyl_volume"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s ENVIRONMENT='node' \
    -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi
