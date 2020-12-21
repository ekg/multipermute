import 'mocha';
import { expect } from 'chai';
import multipermute from '../src';
import { multisets } from './data';

function count_perms<T>(iter: Generator<T[]>) {
  const s = new Set<string>();
  let first = "";
  for (const p of iter){
    if (!first) first = p.join('');
    s.add(p.join(''));
  }
  return s.size;
}

describe("Check that we generate the correct number of permutations for selected multisets", () => {
  for (const [multiset, count] of multisets) {
    it(`Should produce ${ count } distinct permutations for ${ JSON.stringify(multiset) }`, () => {
      const size = count_perms(multipermute(multiset));
      expect(size).to.eql(count);
    });
  }
});

describe("Check that we generate the correct number of permutations for random multisets", () => {
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const multiset = Array.from({ length: i }, () => Math.floor(10 * Math.random()));
      const count = multipermute.count_multiset(multiset);
      it(`Should produce ${ count } distinct permutations for ${ JSON.stringify(multiset) }`, () => {
        const size = count_perms(multipermute(multiset));
        expect(size).to.eql(count);
      });
    }
  }
});

describe("Check that we generate the correct number of permutations for random multiplicity lists", () => {
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const mults = Array.from({ length: i }, () => Math.floor(4 * Math.random()));
      const count = multipermute.count_multiplicities(mults);
      if (count > 10000) {
        j--;
        continue;
      }
      it(`Should produce ${ count } distinct permutations for multiplicities ${ JSON.stringify(mults) }`, () => {
        const size = count_perms(multipermute.from_multiplicities(mults));
        expect(size).to.eql(count);
      });
    }
  }
});

describe("Generate permutations from element-multiplicity pairs", () => {
  const letters = 'abcde';
  for (let i = 1; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const elements = letters.split('').map<[string, number]>(l => [l, Math.floor(4*Math.random())]);
      const mults = elements.map(([_, m]) => m);
      const count = multipermute.count_multiplicities(mults);
      if (count > 10000) {
        j--;
        continue;
      }
      it(`Should produce ${ count } distinct permutations for ${ JSON.stringify(elements) }`, () => {
        const size = count_perms(multipermute.from_entries(elements));
        expect(size).to.eql(count);
      });
    }
  }
});