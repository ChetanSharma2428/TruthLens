import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkSensational,
  checkShouting,
  checkUnsourced,
  analyzeRisk,
  RISK_FLAGS,
  RISK_LEVELS
} from '../src/services/riskAnalyzer.js';

describe('Risk Engine — Deterministic Unit Tests', () => {
  describe('Rule 1: Sensational Keywords', () => {
    it('detects "breaking" in lower, upper, and mixed case', () => {
      assert.equal(checkSensational('This is breaking news now'), true);
      assert.equal(checkSensational('BREAKING: Major event reported'), true);
      assert.equal(checkSensational('BrEaKiNg updates coming in'), true);
    });

    it('detects "shocking" in lower, upper, and mixed case', () => {
      assert.equal(checkSensational('A shocking revelation today'), true);
      assert.equal(checkSensational('SHOCKING new details emerged'), true);
    });

    it('detects "share before deleted" with flexible whitespace', () => {
      assert.equal(checkSensational('Secret document leaked! Share before deleted!'), true);
      assert.equal(checkSensational('SHARE   BEFORE   DELETED immediately'), true);
    });

    it('does not flag calm, objective text without sensational terms', () => {
      assert.equal(checkSensational('The weather forecast predicts rain tomorrow morning.'), false);
      assert.equal(checkSensational('Quarterly revenue grew by 3 percent year over year.'), false);
    });

    it('handles edge cases: empty strings, null, undefined, numbers', () => {
      assert.equal(checkSensational(''), false);
      assert.equal(checkSensational(null), false);
      assert.equal(checkSensational(undefined), false);
    });
  });

  describe('Rule 2: Shouting (>50% CAPS)', () => {
    it('flags text where >50% of alphabetic characters are uppercase', () => {
      // 10 uppercase out of 10 letters = 100%
      assert.equal(checkShouting('EVERYTHING IS URGENT!'), true);
      // 16 uppercase out of 20 letters = 80%
      assert.equal(checkShouting('URGENT NOTICE TO ALL citizens!'), true);
    });

    it('does not flag normal casing or <=50% uppercase', () => {
      // Exactly 50% or less should NOT trigger >50% rule
      assert.equal(checkShouting('HalfUP halfdn'), false); // 6 upper, 6 lower = 50%
      assert.equal(checkShouting('Standard sentence case statement with facts.'), false);
    });

    it('ignores numbers, emojis, and punctuation when calculating alpha ratio', () => {
      // Letters: "ACT NOW" -> 6 uppercase / 6 = 100%
      assert.equal(checkShouting('1234567890 !!! ??? ⚠️ ACT NOW ⚠️'), true);
    });

    it('handles empty or non-alphabetic inputs safely', () => {
      assert.equal(checkShouting('1234567890!@#$%^&*()'), false);
      assert.equal(checkShouting(''), false);
      assert.equal(checkShouting(null), false);
    });
  });

  describe('Rule 3: Unsourced Claims', () => {
    it('flags missing, null, undefined, or empty string URLs as unsourced', () => {
      assert.equal(checkUnsourced(null), true);
      assert.equal(checkUnsourced(undefined), true);
      assert.equal(checkUnsourced(''), true);
      assert.equal(checkUnsourced('   '), true);
    });

    it('does not flag claims with a valid source URL', () => {
      assert.equal(checkUnsourced('https://www.reuters.com/article/123'), false);
      assert.equal(checkUnsourced('https://gov.in/press-release'), false);
    });
  });

  describe('Rule 4: High Risk Calculation (2+ Flags)', () => {
    it('returns NORMAL risk when 0 flags are triggered', () => {
      const result = analyzeRisk({
        text: 'The Ministry of Health released the annual immunization schedule.',
        sourceUrl: 'https://mohfw.gov.in/schedule'
      });
      assert.deepEqual(result.flags, []);
      assert.equal(result.riskLevel, RISK_LEVELS.NORMAL);
    });

    it('returns NORMAL risk when only 1 flag is triggered (e.g. unsourced only)', () => {
      const result = analyzeRisk({
        text: 'The municipal council will conduct road maintenance on Tuesday.',
        sourceUrl: null // UNSOURCED flag only
      });
      assert.deepEqual(result.flags, [RISK_FLAGS.UNSOURCED]);
      assert.equal(result.riskLevel, RISK_LEVELS.NORMAL);
    });

    it('returns HIGH risk when 2 flags are triggered (e.g. Sensational + Unsourced)', () => {
      const result = analyzeRisk({
        text: 'This is breaking news from an insider report.',
        sourceUrl: null // SENSATIONAL + UNSOURCED = 2 flags
      });
      assert.equal(result.flags.includes(RISK_FLAGS.SENSATIONAL), true);
      assert.equal(result.flags.includes(RISK_FLAGS.UNSOURCED), true);
      assert.equal(result.riskLevel, RISK_LEVELS.HIGH);
    });

    it('returns HIGH risk when all 3 flags are triggered', () => {
      const result = analyzeRisk({
        text: 'BREAKING SHOCKING CONSPIRACY EXPOSED! SHARE BEFORE DELETED!',
        sourceUrl: '' // SENSATIONAL + SHOUTING + UNSOURCED = 3 flags
      });
      assert.equal(result.flags.length, 3);
      assert.equal(result.riskLevel, RISK_LEVELS.HIGH);
    });
  });
});
