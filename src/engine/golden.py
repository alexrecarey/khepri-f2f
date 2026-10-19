"""Reference results of f2f.py for the WASM engine to match: src/engine/engine.golden.json.

The app runs khepri's engine compiled to WebAssembly (src/engine/wasm/, built from icepool-rs's icepool-khepri crate).
f2f.py stays the reference: this file runs a fixed set of engine inputs through it, engine.test.mjs checks that the
WASM gives exactly the same results, and test_golden.py checks that the JSON is still what f2f.py says.

    uv run --python 3.12 --with icepool==2.2.2 python src/engine/golden.py    # rewrite engine.golden.json
"""
import json
import os
import random

from f2f import calculate

HERE = os.path.dirname(os.path.abspath(__file__))
GOLDEN = os.path.join(HERE, 'engine.golden.json')


def side(sv=13, burst=1, bonus=0, template=False, save=10, saves=1, crit=True, wpf=1, cont=False, secondary=None):
    return {'successValue': sv, 'burst': burst, 'bonusBurst': bonus, 'template': template, 'saveValue': save,
            'saves': saves, 'critSave': crit and saves > 0, 'woundsPerFailure': wpf, 'cont': cont,
            'secondarySave': secondary}


def engine_input(a, b, fixed=False):
    return {**{k + 'A': v for k, v in a.items()}, **{k + 'B': v for k, v in b.items()}, 'fixedFaceToFace': fixed}


def random_side(r):
    saves = r.choice([0, 1, 1, 1, 2, 3])
    return side(sv=r.choice([0, 1, 5, 8, 10, 11, 12, 13, 14, 15, 17, 19, 20, 21, 23, 26, 30]),
                burst=r.choice([0, 1, 1, 2, 2, 3, 3, 4, 5]), bonus=r.choice([0, 0, 0, 1, 2]),
                save=r.randint(0, 20), saves=saves, crit=r.random() < 0.85, wpf=r.choice([1, 1, 1, 2]),
                cont=r.random() < 0.15, secondary=r.randint(0, 20) if r.random() < 0.1 else None)


def cases():
    """Hand-picked corners first, then seeded random matchups (the same list on every run)."""
    named = [
        engine_input(side(13, 3), side(11, 1)),                                     # typical
        engine_input(side(15, 4, saves=2), side(12, 2)),                            # mid, DA
        engine_input(side(25, 6, 2, saves=3, cont=True), side(22, 6, 2, saves=3, cont=True)),  # heavy
        engine_input(side(13, 2, template=True), side(12, 1)),                      # template vs Dodge
        engine_input(side(13, 2), side(12, 3, template=True)),                      # attack vs template
        engine_input(side(13, 2, template=True), side(12, 0)),                      # template, nobody dodges
        engine_input(side(15, 3), side(12, 2), fixed=True),                         # fixed Face to Face
        engine_input(side(0, 3), side(0, 1)),                                       # both always fail
        engine_input(side(13, 0), side(13, 2)),                                     # no active roll
        engine_input(side(14, 2, saves=1, secondary=8), side(11, 1, wpf=2)),        # Plasma vs T2
        engine_input(side(30, 3, crit=False), side(20, 1, saves=0)),                # crits, Dodge
    ]
    r = random.Random(20261018)
    rest = []
    while len(rest) < 150:
        a, b = random_side(r), random_side(r)
        if a['burst'] + a['bonusBurst'] + b['burst'] + b['bonusBurst'] > 10:
            a['cont'] = b['cont'] = False  # keep the reference quick to compute
        rest.append(engine_input(a, b))
    return named + rest


def golden():
    rows = []
    for p in cases():
        out = calculate(p)
        # rolls can pass 2**53, where JS numbers lose digits: store it as a string.
        rows.append({'input': p, 'rolls': str(out['rolls']), 'outcomes': out['outcomes']})
    return rows


if __name__ == '__main__':
    with open(GOLDEN, 'w') as f:
        json.dump(golden(), f, separators=(',', ':'))
        f.write('\n')
    print(f'wrote {GOLDEN}')
