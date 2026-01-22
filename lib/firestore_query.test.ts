import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeToUserPlants } from './firestore';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(() => 'mock-collection-ref'),
    query: vi.fn(() => 'mock-query-ref'),
    orderBy: vi.fn(() => 'mock-orderby-constraint'),
    limit: vi.fn(() => 'mock-limit-constraint'),
    onSnapshot: vi.fn(() => vi.fn()), // Returns unsubscribe function
    getFirestore: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    where: vi.fn(),
    startAfter: vi.fn(),
    Timestamp: {},
    serverTimestamp: vi.fn(),
  };
});

// Mock firebase config
vi.mock('./firebase.config', () => ({
  db: {}
}));

describe('subscribeToUserPlants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a query with default limit of 100', () => {
    const userId = 'test-user';
    const callback = vi.fn();

    subscribeToUserPlants(userId, callback);

    // Verify query was called
    expect(firestore.query).toHaveBeenCalled();

    // Get the arguments passed to query
    const queryArgs = vi.mocked(firestore.query).mock.calls[0];

    // First arg is collection ref, others are constraints
    const constraints = queryArgs.slice(1);

    // Verify constraints include orderBy AND limit
    expect(constraints).toContain('mock-orderby-constraint');
    expect(constraints).toContain('mock-limit-constraint');

    // Verify limit was called with 100
    expect(firestore.limit).toHaveBeenCalledWith(100);
  });

  it('should allow custom limit', () => {
    const userId = 'test-user';
    const callback = vi.fn();

    subscribeToUserPlants(userId, callback, 50);

    // Verify limit was called with 50
    expect(firestore.limit).toHaveBeenCalledWith(50);
  });
});
