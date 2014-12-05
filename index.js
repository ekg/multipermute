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

[h, i, j] ← init(E) 
visit(h) 
while j.n ≠ φ orj.v <h.v do
    if j.n ≠    φ and i.v ≥ j.n.v then 
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

var List = require('just-a-list')

List.prototype.nth = function(n) {
  var o = this.head
  var i = 0
  while (i < n && o.next) {
    o = o.next
    ++i
  }
  return o
}

function init(multiset) {
  multiset.sort()
  var h = new List()
  for (var i = 0; i < multiset.length; ++i) {
    h.insertBeginning(multiset[i])
  }
  return [h.head, h.nth(multiset.length - 2), h.nth(multiset.length - 1)]  
}

function visit(h) {
  var o = h
  var l = []
  while (o) {
    l.push(o.data)
    o = o.next
  }
  return l
}

function multipermute(multiset, cb) {
  var l = init(multiset)
  var h=l[0], i=l[1], j=l[2], s
  cb(visit(h))
  while (j.next || j.data < h.data) {
    if (j.next && i.data >= j.next.data) {
      s = j
    } else {
      s = i
    }
    var t = s.next
    s.next = t.next
    t.next = h
    if (t.data < h.data) {
      i = t
    }
    j = i.next
    h = t
    cb(visit(h))
  }
}

module.exports = multipermute
