/// <reference types="mocha" />
import { expect } from '@open-wc/testing';
import {
  boundsOf,
  edgeGeometry,
  elbowPoints,
  nearestInDirection,
  polylineMidpoint,
  roundedPath,
} from '../src/__internal/diagram/geometry.js';
import {
  markerInset,
  markerShapes,
} from '../src/__internal/diagram/markers.js';
import { History } from '../src/__internal/diagram/history.js';
import { DiagramSelection } from '../src/__internal/diagram/selection.js';

describe('diagram geometry', () => {
  it('routes a forward elbow through the midpoint', () => {
    expect(
      elbowPoints({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left'),
    ).to.deep.equal([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ]);
    expect(
      elbowPoints({ x: 0, y: 0 }, 'bottom', { x: 80, y: 200 }, 'top'),
    ).to.deep.equal([
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 80, y: 100 },
      { x: 80, y: 200 },
    ]);
  });

  it('draws aligned ports as a straight line', () => {
    expect(
      elbowPoints({ x: 0, y: 50 }, 'right', { x: 300, y: 50 }, 'left'),
    ).to.deep.equal([
      { x: 0, y: 50 },
      { x: 300, y: 50 },
    ]);
  });

  it('runs out of both ports when the target is behind the source', () => {
    const points = elbowPoints(
      { x: 200, y: 0 },
      'right',
      { x: 0, y: 100 },
      'left',
    );
    expect(points).to.have.length(6);
    expect(points[1]).to.deep.equal({ x: 224, y: 0 });
    expect(points[4]).to.deep.equal({ x: -24, y: 100 });
  });

  it('turns once between a side port and a top port that face the corner', () => {
    expect(
      elbowPoints({ x: 0, y: 0 }, 'right', { x: 100, y: 100 }, 'top'),
    ).to.deep.equal([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
  });

  it('rounds corners with true arcs, clamped to half of each leg', () => {
    const d = roundedPath(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 20 },
        { x: 200, y: 20 },
      ],
      32,
    );
    expect(d).to.equal(
      'M 0 0 L 90 0 A 10 10 0 0 1 100 10 L 100 10 A 10 10 0 0 0 110 20 L 200 20',
    );
  });

  it('finds the middle of a polyline and of an edge', () => {
    expect(
      polylineMidpoint([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
      ]),
    ).to.deep.equal({ x: 100, y: 0 });
    const g = edgeGeometry(
      'elbow',
      { x: 0, y: 0 },
      'right',
      { x: 200, y: 0 },
      'left',
      {
        endInset: 6,
      },
    );
    expect(g.d).to.equal('M 0 0 L 194 0');
    expect(g.endAngle).to.equal(0);
  });

  it('measures bounds and finds the nearest box in a direction', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 100, y: 0, width: 10, height: 10 };
    const c = { x: 0, y: 100, width: 10, height: 10 };
    expect(boundsOf([a, b, c])).to.deep.equal({
      x: 0,
      y: 0,
      width: 110,
      height: 110,
    });
    expect(boundsOf([])).to.equal(undefined);
    const items = [
      { id: 'b', rect: b },
      { id: 'c', rect: c },
    ];
    expect(nearestInDirection(a, items, 'right')?.id).to.equal('b');
    expect(nearestInDirection(a, items, 'down')?.id).to.equal('c');
    expect(nearestInDirection(a, items, 'left')).to.equal(undefined);
  });

  it('describes markers as shapes pointing along +x', () => {
    expect(markerShapes('none')).to.deep.equal([]);
    expect(markerShapes('arrow')[0].fill).to.equal('solid');
    expect(markerShapes('zero-or-many')).to.have.length(2);
    expect(markerInset('arrow')).to.be.greaterThan(0);
    expect(markerInset('many')).to.equal(0);
  });
});

describe('diagram history and selection', () => {
  it('undoes and redoes snapshots, and a new change clears redo', () => {
    const h = new History<number>();
    h.push(1);
    h.push(2);
    expect(h.undo(3)).to.equal(2);
    expect(h.undo(2)).to.equal(1);
    expect(h.redo(1)).to.equal(2);
    h.push(2);
    expect(h.canRedo).to.equal(false);
    expect(h.canUndo).to.equal(true);
  });

  it('keeps nodes and edges apart and drops ids that are gone', () => {
    let changes = 0;
    const s = new DiagramSelection(() => {
      changes += 1;
    });
    s.set([
      { kind: 'node', id: 'a' },
      { kind: 'edge', id: 'a' },
    ]);
    expect(s.ids('node')).to.deep.equal(['a']);
    expect(s.has('edge', 'a')).to.equal(true);
    s.retain('edge', new Set());
    expect(s.has('edge', 'a')).to.equal(false);
    s.set([{ kind: 'node', id: 'a' }]);
    expect(changes).to.equal(2);
  });
});
