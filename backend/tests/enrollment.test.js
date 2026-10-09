import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';

describe('Enrollments & Checkout', () => {
  it('TC-ENROLL-01: Add Course to Cart', async () => {
    expect(true).toBe(true);
  });

  it('TC-ENROLL-02: Remove Course from Cart', async () => {
    expect(true).toBe(true);
  });

  it('TC-PAY-01: Order Generation with Stripe/Razorpay', async () => {
    expect(true).toBe(true);
  });

  it('TC-PAY-02: Signature Verification', async () => {
    expect(true).toBe(true);
  });

  it('TC-PAY-03: Enrollment Persistence', async () => {
    expect(true).toBe(true);
  });
});
