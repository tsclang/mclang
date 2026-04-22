#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/6] mclang: compile mc/colorimetry.mc ==="
$MCLANG "$DIR/mc/colorimetry.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/6] C: build + run ==="
gcc "$DIR/mc/colorimetry.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/6] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/colorimetry.c" -lm -o "$DIR/build/colorimetry.dll"
else
  gcc -shared -fPIC "$DIR/mc/colorimetry.c" -lm -o "$DIR/build/colorimetry.so"
fi
python3 "$DIR/src/python/main.py"

echo ""
echo "=== [4/6] JS: build wasm + run ==="
EMCC=""
if command -v emcc &>/dev/null; then EMCC="emcc"
elif [ -f "/c/emsdk/upstream/emscripten/emcc.py" ]; then EMCC="python3 /c/emsdk/upstream/emscripten/emcc.py"
fi
if [ -n "$EMCC" ]; then
  $EMCC "$DIR/mc/colorimetry.c" -o "$DIR/build/colorimetry.js" \
    -s EXPORTED_FUNCTIONS='["_srgb_to_linear","_linear_to_srgb","_xyz_x","_xyz_y","_xyz_z","_lab_L","_lab_a","_lab_b","_delta_e76","_delta_e94","_chroma","_hue_angle","_wcag_lum","_contrast_ratio"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s ENVIRONMENT='node' -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi

echo ""
echo "=== [5/6] Node (native addon): build + run ==="
$MCLANG "$DIR/mc/colorimetry.mc" --target node
if npx node-gyp --version &>/dev/null 2>&1; then
  (cd "$DIR/mc" && npx node-gyp configure build -q 2>/dev/null)
  node "$DIR/src/node/main.js"
else
  echo "  (skipped — node-gyp not available)"
fi

echo ""
echo "=== [6/6] Rust: build + run ==="
$MCLANG "$DIR/mc/colorimetry.mc" --target rust
if command -v cargo &>/dev/null; then
  (cd "$DIR/src/rust" && cargo run --release -q)
else
  echo "  (skipped — cargo not found)"
fi
