/// <reference types="mocha" />
import { expect } from '@open-wc/testing';
import {
  addMonthsIso,
  buildMonthGrid,
  formatDate,
  localeDateOrder,
  localeDatePattern,
  parseDateText,
  parseIsoDate,
  parseRangeText,
  parseTimeText,
} from '../src/__internal/utils/date.js';

describe('date utils', () => {
  it('reads ISO dates and rejects impossible ones', () => {
    expect(parseIsoDate('2026-11-06')).to.deep.equal({
      year: 2026,
      month: 11,
      day: 6,
    });
    expect(parseIsoDate('2026-02-29')).to.be.null;
    expect(parseIsoDate('2028-02-29')).to.not.be.null;
    expect(parseIsoDate('2026-13-01')).to.be.null;
    expect(parseIsoDate('11/06/2026')).to.be.null;
  });

  it('knows the day order of a locale', () => {
    expect(localeDateOrder('en-US')).to.deep.equal(['month', 'day', 'year']);
    expect(localeDateOrder('en-GB')).to.deep.equal(['day', 'month', 'year']);
    expect(localeDatePattern('en-US')).to.equal('MM/DD/YYYY');
    expect(localeDatePattern('de-DE')).to.equal('DD.MM.YYYY');
  });

  it('parses typed dates in the locale order', () => {
    expect(parseDateText('11/6/2026', 'en-US')).to.equal('2026-11-06');
    expect(parseDateText('6/11/2026', 'en-GB')).to.equal('2026-11-06');
    expect(parseDateText('6.11.2026', 'de-DE')).to.equal('2026-11-06');
    expect(parseDateText('2026-11-06', 'de-DE')).to.equal('2026-11-06');
    expect(parseDateText('11/6/26', 'en-US')).to.equal('2026-11-06');
    expect(parseDateText('2/30/2026', 'en-US')).to.be.null;
    expect(parseDateText('tomorrow', 'en-US')).to.be.null;
  });

  it('parses typed ranges and orders their ends', () => {
    expect(parseRangeText('11/9/2026 – 11/3/2026', 'en-US')).to.equal(
      '2026-11-03/2026-11-09',
    );
    expect(parseRangeText('2026-11-03/2026-11-09', 'en-US')).to.equal(
      '2026-11-03/2026-11-09',
    );
    expect(parseRangeText('11/3/2026', 'en-US')).to.be.null;
  });

  it('parses typed times', () => {
    expect(parseTimeText('9:30')).to.equal('09:30');
    expect(parseTimeText('930')).to.equal('09:30');
    expect(parseTimeText('9:30 pm')).to.equal('21:30');
    expect(parseTimeText('12 am')).to.equal('00:00');
    expect(parseTimeText('21:30')).to.equal('21:30');
    expect(parseTimeText('9:30:15', true)).to.equal('09:30:15');
    expect(parseTimeText('25:00')).to.be.null;
    expect(parseTimeText('13 pm')).to.be.null;
  });

  it('formats dates for the locale', () => {
    expect(formatDate('2026-11-06', 'en-US')).to.equal('11/06/2026');
    expect(formatDate('2026-11-06', 'de-DE')).to.equal('06.11.2026');
  });

  it('clamps the day when adding months', () => {
    expect(addMonthsIso('2026-01-31', 1)).to.equal('2026-02-28');
    expect(addMonthsIso('2026-11-06', -12)).to.equal('2025-11-06');
  });

  it('builds a six-week grid starting on the first day of the week', () => {
    const sunday = buildMonthGrid(2026, 11, 0);
    expect(sunday).to.have.length(6);
    // November 2026 starts on a Sunday.
    expect(sunday[0][0]).to.deep.equal({
      iso: '2026-11-01',
      day: 1,
      inMonth: true,
    });
    const monday = buildMonthGrid(2026, 11, 1);
    expect(monday[0][0].iso).to.equal('2026-10-26');
    expect(monday[0][0].inMonth).to.be.false;
  });
});
