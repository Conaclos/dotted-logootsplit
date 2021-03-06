import test from "ava"

import { ReplicableLinkedList } from "../../src/list/replicablelinkedlist"
import { SimpleBlockFactory } from "../../src/position/simpleblockfactory"
import { SimplePosition } from "../../src/position/simpleposition"
import { Insertion, Deletion } from "../../src/core/localoperation"

function newSeq (factory: SimpleBlockFactory): ReplicableLinkedList<SimplePosition, string> {
    return new ReplicableLinkedList(factory, "")
}

const seed = "dotted-logootsplit"

const factoryA = SimpleBlockFactory.from(1, "dotted-logootsplit")
const factoryB = SimpleBlockFactory.from(2, "dotted-logootsplit")
const factoryC = SimpleBlockFactory.from(3, "dotted-logootsplit")

// insertAt

test("insertAt_append", (t) => {
    const seqA = newSeq(factoryA)
    seqA.insertAt(0, "ab")
    seqA.insertAt(2, "cd")

    t.is(seqA.concatenated(""), "abcd")
})

test("insertAt_before", (t) => {
    const seqA = newSeq(factoryA)
    seqA.insertAt(0, "cd")
    seqA.insertAt(0, "ab")

    t.is(seqA.concatenated(""), "abcd")
})

test("insertAt_splitting", (t) => {
    const seqA = newSeq(factoryA)
    seqA.insertAt(0, "ac")
    seqA.insertAt(1, "b")

    t.is(seqA.concatenated(""), "abc")
})

// insert

test("insert_single-insertion", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")

    const abLocal = seqB.insert(ab)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab")
    t.deepEqual(abLocal, [new Insertion(0, "ab")])
})

test("insert_append", (t) => {
    const [seqA, seqB, seqC] = [factoryA, factoryB, factoryC].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const cd = seqA.insertAt(2, "cd")

    seqB.insert(ab)
    const cdLocal = seqB.insert(cd)

    seqC.insert(ab.append(cd))

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.deepEqual(seqA.sentinel, seqC.sentinel)
    t.is(seqA.concatenated(""), "abcd")
    t.deepEqual(cdLocal, [new Insertion(2, "cd")])
})

test("insert_prepend", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const cd = seqA.insertAt(2, "cd")

    seqB.insert(cd)
    const abLocal = seqB.insert(ab)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcd")
    t.deepEqual(abLocal, [new Insertion(0, "ab")])
})

test("insert_append-before", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const cd = seqA.insertAt(2, "cd")

    seqB.insert(ab)
    const _12 = seqB.insertAt(2, "12")
    const cdLocal = seqB.insert(cd)

    seqA.insert(_12)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcd12")
    t.deepEqual(cdLocal, [new Insertion(2, "cd")])
})

test("insert_append-prepend", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const cd = seqA.insertAt(2, "cd")
    const ef = seqA.insertAt(4, "ef")

    seqB.insert(ab)
    seqB.insert(ef)
    const cdLocal = seqB.insert(cd)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcdef")
    t.deepEqual(cdLocal, [new Insertion(2, "cd")])
})

test("insert_after", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")

    seqB.insert(ab)
    const _12 = seqB.insertAt(2, "12")

    const _12Local = seqA.insert(_12)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab12")
    t.deepEqual(_12Local, [new Insertion(2, "12")])
})

test("insert_before", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")

    seqB.insert(ab)
    const _12 = seqB.insertAt(0, "12")

    const _12Local = seqA.insert(_12)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "12ab")
    t.deepEqual(_12Local, [new Insertion(0, "12")])
})

test("insert_splitting", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")

    seqB.insert(ab)
    const _12 = seqB.insertAt(1, "12")

    const _12Local = seqA.insert(_12)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "a12b")
    t.deepEqual(_12Local, [new Insertion(1, "12")])
})

test("insert_splitted", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ac = seqA.insertAt(0, "ac")
    const b = seqA.insertAt(1, "b")

    seqB.insert(b)
    const acLocals = seqB.insert(ac)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abc")
    t.deepEqual(acLocals, [new Insertion(0, "a"), new Insertion(2, "c")])
})

test("insert_splitted-parts", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ac = seqA.insertAt(0, "ac")
    const b = seqA.insertAt(1, "b")

    seqB.insert(b)
    const aLocal = seqB.insert(ac.leftSplitAt(1))
    const cLocal = seqB.insert(ac.rightSplitAt(1))

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abc")
    t.deepEqual(aLocal, [new Insertion(0, "a")])
    t.deepEqual(cLocal, [new Insertion(2, "c")])
})

test("insert_splitted-parts-reversed", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ac = seqA.insertAt(0, "ac")
    const b = seqA.insertAt(1, "b")

    seqB.insert(b)
    const cLocal = seqB.insert(ac.rightSplitAt(1))
    const aLocal = seqB.insert(ac.leftSplitAt(1))

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abc")
    t.deepEqual(cLocal, [new Insertion(1, "c")])
    t.deepEqual(aLocal, [new Insertion(0, "a")])
})

test("insert_included", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abcdef = seqA.insertAt(0, "abcdef")

    const cd = abcdef.rightSplitAt(2).leftSplitAt(2)
    console.assert(cd.items === "cd")

    seqB.insert(abcdef)
    const cdLocal = seqB.insert(cd)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcdef")
    t.deepEqual(cdLocal, [])
})

test("insert_including", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abcdef = seqA.insertAt(0, "abcdef")

    const cd = abcdef.rightSplitAt(2).leftSplitAt(2)
    console.assert(cd.items === "cd")

    seqB.insert(cd)
    const abcdeflocals = seqB.insert(abcdef)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcdef")
    t.deepEqual(abcdeflocals, [new Insertion(0, "ab"), new Insertion(4, "ef")])
})

test("insert_overlapping-before", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abcdef = seqA.insertAt(0, "abcdef")

    const abcd = abcdef.leftSplitAt(4)
    console.assert(abcd.items === "abcd")
    const cdef = abcdef.rightSplitAt(2)
    console.assert(cdef.items === "cdef")

    seqB.insert(cdef)
    const abcdLocal = seqB.insert(abcd)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcdef")
    t.deepEqual(abcdLocal, [new Insertion(0, "ab")])
})

test("insert_overlapping-after", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abcdef = seqA.insertAt(0, "abcdef")

    const abcd = abcdef.leftSplitAt(4)
    console.assert(abcd.items === "abcd")
    const cdef = abcdef.rightSplitAt(2)
    console.assert(cdef.items === "cdef")

    seqB.insert(abcd)
    const cdefLocal = seqB.insert(cdef)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "abcdef")
    t.deepEqual(cdefLocal, [new Insertion(4, "ef")])
})

test("insert_equal", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")

    seqB.insert(ab)
    const abLocal = seqB.insert(ab)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab")
    t.deepEqual(abLocal, [])
})

test("insert_insert-split-append", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "abcdef")
    const cd = seqA.insertAt(6, "mnopqr")

    seqB.insert(ab)
    const x = seqB.insertAt(2, "_")
    seqB.insert(cd)

    seqA.insert(x)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab_cdefmnopqr")
})

// removeAt

test("removeAt_all", (t) => {
    const seqA = newSeq(factoryA)
    const ab = seqA.insertAt(0, "abc")

    seqA.removeAt(0, ab.length)

    t.is(seqA.concatenated(""), "")
})

test("removeAt_first", (t) => {
    const seqA = newSeq(factoryA)
    const ab = seqA.insertAt(0, "abc")

    seqA.removeAt(0, 2)

    t.is(seqA.concatenated(""), "c")
})

test("removeAt_last", (t) => {
    const seqA = newSeq(factoryA)
    const ab = seqA.insertAt(0, "abc")

    seqA.removeAt(1, 2)

    t.is(seqA.concatenated(""), "a")
})

test("removeAt_inside", (t) => {
    const seqA = newSeq(factoryA)
    const ab = seqA.insertAt(0, "abc")

    seqA.removeAt(1, 1)

    t.is(seqA.concatenated(""), "ac")
})

// remove

test("remove_nothing", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const [abRemoval, ..._] = seqA.removeAt(0, ab.length)

    const abLocalRemoval = seqB.remove(abRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "")
    t.deepEqual(abLocalRemoval, [])
})

test("remove_nothing-after", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const cd = seqA.insertAt(2, "cd")
    const [cdRemoval, ..._] = seqA.removeAt(2, cd.length)

    seqB.insert(ab)
    const abLocalRemoval = seqB.remove(cdRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab")
    t.deepEqual(abLocalRemoval, [])
})

test("remove_all", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const [abRemoval, ..._] = seqA.removeAt(0, ab.length)

    seqB.insert(ab)
    const abLocalRemoval = seqB.remove(abRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "")
    t.deepEqual(abLocalRemoval, [new Deletion(0, 2)])
})

test("remove_then-append", (t) => {
    const [seqA, seqB, seqC] = [factoryA, factoryB, factoryC].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const x = seqA.insertAt(1, "x") // split
    const [xRemoval, ..._] = seqA.removeAt(1, 1)

    seqB.insert(ab)
    seqB.insert(x) // split
    const xLocalRemovalB = seqB.remove(xRemoval.toLengthBlock())

    seqC.insert(ab)
    const xLocalRemovalC = seqC.remove(x.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.deepEqual(seqA.sentinel, seqC.sentinel)
    t.is(seqA.concatenated(""), "ab")
    t.deepEqual(xLocalRemovalB, [new Deletion(1, 1)])
    t.deepEqual(xLocalRemovalC, [])
})

test("remove_splitted", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const ab = seqA.insertAt(0, "ab")
    const x = seqA.insertAt(1, "x") // split
    seqA.removeAt(0, 1) // remove a
    seqA.removeAt(1, 1) // remove b

    seqB.insert(ab)
    seqB.insert(x) // split
    const xLocalRemoval = seqB.remove(ab.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "x")
    t.deepEqual(xLocalRemoval, [new Deletion(0, 1), new Deletion(1, 1)])
})

test("remove_including", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    const [abcRemoval, ..._] = seqA.removeAt(0, abc.length)

    const b = abc.leftSplitAt(2).rightSplitAt(1)
    seqB.insert(b)
    const bLocalRemovals = seqB.remove(abcRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "")
    t.deepEqual(bLocalRemovals, [new Deletion(0, 1)])
})

test("remove_included", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    const [bRemoval, ..._] = seqA.removeAt(1, 1)

    seqB.insert(abc)
    const bLocalRemovals = seqB.remove(bRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ac")
    t.deepEqual(bLocalRemovals, [new Deletion(1, 1)])
})

test("remove_included-left", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    const [aRemoval, ..._] = seqA.removeAt(0, 1)

    seqB.insert(abc)
    const aLocalRemovals = seqB.remove(aRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "bc")
    t.deepEqual(aLocalRemovals, [new Deletion(0, 1)])
})

test("remove_included-right", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    const [cRemoval, ..._] = seqA.removeAt(2, 1)

    seqB.insert(abc)
    const cLocalRemovals = seqB.remove(cRemoval.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab")
    t.deepEqual(cLocalRemovals, [new Deletion(2, 1)])
})

test("remove_overlapping-before", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    seqA.removeAt(0, 2)

    seqB.insert(abc.rightSplitAt(1))
    const bLocalRemovals = seqB.remove(abc.leftSplitAt(2).toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "c")
    t.deepEqual(bLocalRemovals, [new Deletion(0, 1)])
})

test("remove_overlapping-after", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    seqA.removeAt(1, 2)

    seqB.insert(abc.leftSplitAt(2))
    const bLocalRemovals = seqB.remove(abc.rightSplitAt(1).toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "a")
    t.deepEqual(bLocalRemovals, [new Deletion(1, 1)])
})

// applyDelta

test("applyDelta_remove-all-then-insert", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    seqA.removeAt(0, 3)

    const abcLocalRemoval = seqB.applyDelta(abc.toLengthBlock())
    const abcLocalInsertion = seqB.applyDelta(abc)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "")
    t.deepEqual(abcLocalRemoval, [])
    t.deepEqual(abcLocalInsertion, [])
})

test("applyDelta_insert-then-remove-all", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    seqA.removeAt(0, 3)

    seqB.applyDelta(abc)
    seqB.applyDelta(abc.toLengthBlock())

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "")
})

test("applyDelta_remove-partial-then-insert", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abc = seqA.insertAt(0, "abc")
    seqA.removeAt(0, 2)

    seqB.applyDelta(abc.leftSplitAt(2).toLengthBlock())
    const abcLocalInsertion = seqB.applyDelta(abc)

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "c")
    t.deepEqual(abcLocalInsertion, [new Insertion(0, "c")])
})

test("insert_apply-its-own-deltas", (t) => {
    const [seqA, seqB] = [factoryA, factoryB].map(newSeq)

    const abcd = seqA.insertAt(0, "abcd")
    const cdRemoval = seqA.removeAt(2, 2)
    seqA.applyDelta(abcd)
    for (const d of cdRemoval) {
        seqA.applyDelta(d)
    }

    seqB.applyDelta(abcd)
    for (const d of cdRemoval) {
        seqB.applyDelta(d)
    }

    t.deepEqual(seqA.sentinel, seqB.sentinel)
    t.is(seqA.concatenated(""), "ab")
})
