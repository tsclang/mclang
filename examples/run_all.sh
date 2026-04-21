#!/bin/bash
set -e
EXAMPLES_DIR="$(cd "$(dirname "$0")" && pwd)"

run_example() {
    local name="$1"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    (cd "$EXAMPLES_DIR/$name" && bash run.sh)
}

run_example ballistics
run_example statistics
run_example geometry
run_example number_theory

echo ""
echo "✓ All examples completed."
