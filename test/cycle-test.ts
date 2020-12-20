import 'mocha';
import { expect } from 'chai';
import multipermute from '../src';
import { multisets } from './data';

describe("Check that we correctly reset for cycling", () => {
  for (const [multiset, count] of multisets) {
    it(`Should reproduce the first permutation after ${ count } permutations`, () => {
      let i = 0;
      let f!: number[];
      let p!: number[];
      for (p of multipermute(multiset, { cycle: true })) {
        if (!f) f = p;
        if (i++ === count) break;
      }
      expect(p).to.eql(f);
    });
  }
});
