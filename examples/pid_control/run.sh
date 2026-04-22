#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
MCLANG="node $ROOT/dist/cli/index.js"

echo "=== [1/6] mclang: compile mc/pid_control.mc ==="
$MCLANG "$DIR/mc/pid_control.mc"

mkdir -p "$DIR/build"

echo ""
echo "=== [2/6] C: build + run ==="
gcc "$DIR/mc/pid_control.c" "$DIR/src/c/main.c" -lm -o "$DIR/build/demo"
"$DIR/build/demo"

echo ""
echo "=== [3/6] Python: build shared lib + run ==="
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  gcc -shared "$DIR/mc/pid_control.c" -lm -o "$DIR/build/pid_control.dll"
else
  gcc -shared -fPIC "$DIR/mc/pid_control.c" -lm -o "$DIR/build/pid_control.so"
fi
python3 "$DIR/src/python/main.py"

echo ""
echo "=== [4/6] JS: build wasm + run ==="
EMCC=""
if command -v emcc &>/dev/null; then EMCC="emcc"
elif [ -f "/c/emsdk/upstream/emscripten/emcc.py" ]; then EMCC="python3 /c/emsdk/upstream/emscripten/emcc.py"
fi
if [ -n "$EMCC" ]; then
  $EMCC "$DIR/mc/pid_control.c" -o "$DIR/build/pid_control.js" \
    -s EXPORTED_FUNCTIONS='["_pid_p","_pid_i_step","_pid_d","_pid_out","_pid_integral_clamped","_sp_error","_pid_delta","_crossover_freq","_zn_kp","_zn_ki","_zn_kd","_itae_kp","_itae_ki","_itae_kd"]' \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s ENVIRONMENT='node' -lm
  node "$DIR/src/js/main.js"
else
  echo "  (skipped — emcc not found)"
fi

echo ""
echo "=== [5/6] Node (native addon): build + run ==="
$MCLANG "$DIR/mc/pid_control.mc" --target node
if npx node-gyp --version &>/dev/null 2>&1; then
  (cd "$DIR/mc" && npx node-gyp configure build -q 2>/dev/null)
  node "$DIR/src/node/main.js"
else
  echo "  (skipped — node-gyp not available)"
fi

echo ""
echo "=== [6/6] Rust: build + run ==="
$MCLANG "$DIR/mc/pid_control.mc" --target rust
if command -v cargo &>/dev/null; then
  (cd "$DIR/src/rust" && cargo run --release -q)
else
  echo "  (skipped — cargo not found)"
fi
