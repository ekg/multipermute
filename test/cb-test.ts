import 'mocha';
import { expect } from 'chai';
import multipermute from '../src';
import { multisets } from './data';

describe("Check that generation works properly with callbacks", () => {
  for (const [multiset, count] of multisets) {
    it(`Should produce ${ count } distinct permutations for ${ JSON.stringify(multiset) }`, () => {
      const s = new Set<string>();
      multipermute(multiset, p => s.add(p.join('')));
      expect(s.size).to.eql(count);
    });
  }
});
