# engine.golden.json must still be what f2f.py computes (engine.test.mjs holds the WASM engine to the same file).
# Rewrite it with: uv run --python 3.12 --with icepool==2.2.2 python src/engine/golden.py
import json

from golden import GOLDEN, golden


def test_golden_file_matches_f2f():
    with open(GOLDEN) as f:
        assert json.load(f) == golden()
