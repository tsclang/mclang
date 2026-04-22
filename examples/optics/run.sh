#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MC="$SCRIPT_DIR/mc"
BUILD="$SCRIPT_DIR/build"
mkdir -p "$BUILD"

echo "=== Step 1: Compile wave_base.mc → C ==="
node "$ROOT/dist/cli/index.js" "$MC/wave_base.mc"

echo "=== Step 2: Compile optics.mc (imports wave_base) → C ==="
node "$ROOT/dist/cli/index.js" "$MC/optics.mc"

echo "=== Step 3: C demo ==="
gcc "$MC/optics.c" "$SCRIPT_DIR/src/c/main.c" -lm -o "$BUILD/demo"
"$BUILD/demo"

echo ""
echo "=== Step 4: Shared library for Python/Node ==="
gcc -shared -fPIC "$MC/optics.c" -lm -o "$MC/optics.so"

echo "=== Step 5: Python demo ==="
python3 "$SCRIPT_DIR/src/python/main.py"

echo ""
echo "=== Step 6: Wasm (requires emcc) ==="
if command -v emcc &>/dev/null; then
  EXPORTS=$(grep '^mc_num ' "$MC/optics.h" | sed 's/mc_num \([a-zA-Z_][a-zA-Z0-9_]*\).*/\1/' | sed 's/^/"_/' | sed 's/$/"/' | paste -sd,)
  emcc "$MC/optics.c" -O2 -s WASM=1 \
    -s EXPORTED_FUNCTIONS="[$EXPORTS]" \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -o "$MC/optics.js"
  node "$SCRIPT_DIR/src/js/main.js"
else
  echo "emcc not found — skipping Wasm"
fi
