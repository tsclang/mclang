#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/6] mclang: compile mc/transforms_3d.mc ==="
$MCLANG "$DIR/mc/transforms_3d.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/6] C: build + run ==="
gcc "$DIR/mc/transforms_3d.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/6] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/transforms_3d.c" -lm -o "$DIR/build/transforms_3d.dll"
else
  gcc -shared -fPIC "$DIR/mc/transforms_3d.c" -lm -o "$DIR/build/transforms_3d.so"
fi
python3 "$DIR/src/python/main.py"

echo ""
echo "=== [4/6] JS: build wasm + run ==="
EMCC=""
if command -v emcc &>/dev/null; then
  EMCC="emcc"
elif [ -f "/c/emsdk/upstream/emscripten/emcc.py" ]; then
  EMCC="python3 /c/emsdk/upstream/emscripten/emcc.py"
fi
if [ -n "$EMCC" ]; then
  $EMCC "$DIR/mc/transforms_3d.c" \
    -o "$DIR/build/transforms_3d.js" \
    -s EXPORTED_FUNCTIONS='["_euler_w","_euler_x","_euler_y","_euler_z","_qnorm","_qnorm_w","_qnorm_x","_qnorm_y","_qnorm_z","_qmul_w","_qmul_x","_qmul_y","_qmul_z","_axisangle_w","_axisangle_x","_axisangle_y","_axisangle_z","_rot_vx","_rot_vy","_rot_vz","_qdist","_rmat_00","_rmat_01","_rmat_02","_rmat_10","_rmat_11","_rmat_12","_rmat_20","_rmat_21","_rmat_22","_slerp_w","_slerp_x","_slerp_y","_slerp_z"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s ENVIRONMENT='node' \
    -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi

echo ""
echo "=== [5/6] Node (native addon): build + run ==="
$MCLANG "$DIR/mc/transforms_3d.mc" --target node
if npx node-gyp --version &>/dev/null 2>&1; then
  (cd "$DIR/mc" && npx node-gyp configure build -q 2>/dev/null)
  node "$DIR/src/node/main.js"
else
  echo "  (skipped — node-gyp not available)"
fi

echo ""
echo "=== [6/6] Rust: build + run ==="
$MCLANG "$DIR/mc/transforms_3d.mc" --target rust
if command -v cargo &>/dev/null; then
  (cd "$DIR/src/rust" && cargo run --release -q)
else
  echo "  (skipped — cargo not found)"
fi
