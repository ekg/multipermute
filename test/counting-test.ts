import 'mocha';
import { expect } from 'chai';
import multipermute from '../src';
import { multisets } from './data';

describe("Check permutation count calculations", () => {
  for (const [multiset, count] of multisets) {
    it(`Should count permutations for ${ JSON.stringify(multiset) }`, () => {
      expect(multipermute.count_multiset(multiset)).to.eql(count);
    });
  }
});
