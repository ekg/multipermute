/*
This module encodes functions to generate the permutations of a multiset
following this algorithm:

Algorithm 1 
Visits the permutations of multiset E. The permutations are stored
in a singly-linked list pointed to by head pointer h. Each node in the linked
list has a value field v and a next field n. The init(E) call creates a
singly-linked list storing the elements of E in non-increasing order with h, i,
and j pointing to its first, second-last, and last nodes, respectively. The
null pointer is given by φ. Note: If E is empty, then init(E) should exit.
Also, if E contains only one element, then init(E) does not need to provide a
value for i.

A linked list must be used instead of an array because, as long as we keep a
reference to the nodes at the removal and insertion points, arbitrary shifts
(rotations of sub-lists) can be performed in constant time; this is what h, i,
and j are for.

[h, i, j] ← init(E) 
visit(h) 
while j.n ≠ φ or j.v < h.v do
    if j.n ≠ φ and i.v ≥ j.n.v then 
        s←j
    else
        s←i 
    end if
    t←s.n 
    s.n ← t.n 
    t.n ← h 
    if t.v < h.v then
        i←t 
    end if
    j←i.n 
    h←t 
    visit(h)
end while
*/

type ListNode = { n: ListNode | null; v: number };

function visit<T>(h: ListNode, remap: T[], l: number) {
  const p: T[] = [];
  for (let i = l - 1; i >= 0; i--) {
    p[i] = remap[h.v];
    h = h.n as ListNode;
  }
  return p;
}

// p must be sorted in ascending order
function * mp_gen<T>(p: number[], remap: T[], cycle: boolean) {
  const l = p.length;

  // If the input is empty, exit.
  // There is only one permutation of the empty set.
  if (l === 0) {
    yield [];
    return;
  }

  // Init
  let h: ListNode = { v: p[0], n: null };
  let i: ListNode = h; // penultimate node
  let j: ListNode = h; // final node
  if (l > 1) h = i = { v: p[1], n: h };
  for (let k = 2; k < l; ++k) {
    h = { v: p[k], n: h };
  }

  for(;;) {

    // Visit permutations of the list
    yield visit(h, remap, l);
    let s: ListNode;
    for (;;) {
      if (j.n) s = i.v >= j.n.v ? j : i;
      else if (j.v >= h.v) break;
      else s = i;

      const t = s.n as ListNode;
      s.n = t.n;
      t.n = h;
      if (t.v < h.v) {
        i = t;
      }
      j = i.n as ListNode;
      h = t;
      yield visit(h, remap, l);
    }

    if (cycle) {
      // Reset
      // This is different from initialization
      // because we don't need to allocate new
      // list nodes.
      i = h; // penultimate node
      j = h; // final node

      for (let k = l - 1; k > 0; k--) {
        j.v = p[k];
        i = j;
        j = j.n as ListNode;
      }
      j.v = p[0];
    } else return;
  }
}

function multiplicity2sorted(mults: number[]) {
  const n = mults.length;
  const permutation: number[] = [];
  for (let k = 0; k < n; k++) {
    for (let m = mults[k]; m > 0; m--) {
      permutation.push(k);
    }
  }

  return permutation;
}

type FMOptions<T> = ((p: T[]) => void) | {
  cb?: (p: T[]) => void;
  elements?: Iterable<T>;
  cycle?: boolean;
}

function from_multiplicities(multiplicities: Iterable<number>): Generator<number[]>;
function from_multiplicities(multiplicities: Iterable<number>, cb: (p: number[]) => void): void;
function from_multiplicities<T>(multiplicities: Iterable<number>, opts: { elements: Iterable<T>; cycle?: boolean; }): Generator<T[]>;
function from_multiplicities(multiplicities: Iterable<number>, opts: { cb: (p: number[]) => void; cycle?: boolean; }): void;
function from_multiplicities<T>(multiplicities: Iterable<number>, opts: { elements: Iterable<T>; cb: (p: T[]) => void; cycle?: boolean; }): void;
function from_multiplicities<T>(multiplicities: Iterable<number>, opts: FMOptions<T> = {}) {
  let elements: Iterable<T> | undefined;
  let cb: ((p: T[]) => void) | undefined;
  let cycle = false;
  if (typeof opts === 'function') cb = opts;
  else ({ elements, cb, cycle = false } = opts);

  const mults = Array.isArray(multiplicities) ? multiplicities : [...multiplicities];
  const permutation = multiplicity2sorted(mults);
  const remap = elements ?
    (Array.isArray(elements) ? elements : [...elements]) : 
    Array.from(mults, (_, k) => k as unknown as T);
  if (typeof cb !== 'function') return mp_gen(permutation, remap, cycle);
  for (const p of mp_gen(permutation, remap, cycle)) cb(p);
  return;
}

function entries2multiset<T>(elements: Iterable<[T, number]>) {
  const remap: T[] = [];
  const permutation: number[] = [];
  let id = 0;
  for (let [e, m] of elements) {
    remap.push(e);
    while (m-- > 0) permutation.push(id);
    id++;
  }

  return { remap, permutation };
}

type FEOptions<T> = ((p: T[]) => void) | {
  cb?: (p: T[]) => void;
  cycle?: boolean;
}

function from_entries<T>(elements: Iterable<[T, number]>): Generator<T[]>;
function from_entries<T>(elements: Iterable<[T, number]>, cb: (p: T[]) => void): void;
function from_entries<T>(elements: Iterable<[T, number]>, opts: { cycle?: boolean; }): Generator<T[]>;
function from_entries<T>(elements: Iterable<[T, number]>, opts: { cb: (p: T[]) => void; cycle?: boolean; }): void;
function from_entries<T>(elements: Iterable<[T, number]>, opts: FEOptions<T> = {}) {
  let cb: ((p: T[]) => void) | undefined;
  let cycle = false;
  if (typeof opts === 'function') cb = opts;
  else ({ cb, cycle = false } = opts);
  
  const { remap, permutation } = entries2multiset(elements);
  if (typeof cb !== 'function') return mp_gen(permutation, remap, cycle);
  for (const p of mp_gen(permutation, remap, cycle)) cb(p);
  return;
}

function ms2multiplicities<T>(multiset: Iterable<T>, eq?: (a: T, b: T) => boolean) {
  const remap: T[] = [];
  const mults: number[] = [];
  if (eq) {
    // If we have a custom equality function,
    // fall back on an implicity n^2 map.
    outer: for (const e of multiset) {
      for (let i = remap.length - 1; i >= 0; i--) {
        if (eq(remap[i], e)) {
          mults[i]++;
          continue outer;
        }
      }
      remap.push(e);
      mults.push(1);
    }
  } else {
    // Otherwise, we can use the native map,
    // with implied === comparison.
    const m = new Map<T, number>();
    for (const e of multiset) {
      m.set(e, (m.get(e)||0)+1);
    }
    for (const e of multiset) {
      if (!m.has(e)) continue;
      remap.push(e);
      mults.push(m.get(e) as number);
      m.delete(e);
    }
  }

  return { remap: remap, mults };
}

function ms2permutation<T>(multiset: Iterable<T>, eq?: (a: T, b: T) => boolean) {
  const { remap, mults } = ms2multiplicities(multiset, eq);
  return { remap, permutation: multiplicity2sorted(mults) };
}

function count_multiplicities(multiplicities: Iterable<number>): number {
  let x = 1;
  let r = 1;
  for (let n of multiplicities) {
    if (n === 0) continue;
    for (let i = 0; i < n; i++) r *= x++;
    let f = n;
    while (--n > 1) f *= n;
    r /= f;
  }
  return r;
}

function count_multiset<T>(elements: Iterable<T>, eq?: (a: T, b: T) => boolean) {
  const { mults } = ms2multiplicities(elements, eq);
  return count_multiplicities(mults);
}

type MPOptions<T> = ((p: T[]) => void) | {
  cb?: (p: T[]) => void;
  eq?: (a: T, b: T) => boolean;
  cycle?: boolean;
}

function multipermute<T>(multiset: Iterable<T>, opts: { cb: (p: T[]) => void; eq?: (a: T, b: T) => boolean; cycle?: boolean; }): void
function multipermute<T>(multiset: Iterable<T>, opts: { eq?: (a: T, b: T) => boolean; cycle?: boolean; }): Generator<T[]>; 
function multipermute<T>(multiset: Iterable<T>, cb: (p: T[]) => void): void; 
function multipermute<T>(multiset: Iterable<T>): Generator<T[]>; 
function multipermute<T>(multiset: Iterable<T>, opts: MPOptions<T> = {}) {
  let cb: ((p: T[]) => void) | undefined;
  let eq: ((a: T, b: T) => boolean) | undefined;
  let cycle = false;
  if (typeof opts === 'function') cb = opts;
  else ({ cb, eq, cycle = false } = opts);

  const { permutation, remap } = ms2permutation(multiset, eq);

  if (typeof cb !== 'function') return mp_gen(permutation, remap, cycle);
  for (const p of mp_gen(permutation, remap, cycle)) cb(p);
  return;
}

type Multipermute = typeof multipermute & {
  from_multiplicities: typeof from_multiplicities;
  from_entries: typeof from_entries;
  count_multiplicities: typeof count_multiplicities;
  count_multiset: typeof count_multiset;
};

(multipermute as unknown as Multipermute).from_multiplicities = from_multiplicities;
(multipermute as unknown as Multipermute).from_entries = from_entries;
(multipermute as unknown as Multipermute).count_multiplicities = count_multiplicities;
(multipermute as unknown as Multipermute).count_multiset = count_multiset;

export = multipermute as Multipermute;