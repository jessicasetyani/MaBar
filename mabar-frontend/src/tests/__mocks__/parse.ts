// Mock Parse SDK for testing
export const Parse = {
  User: {
    current: vi.fn(),
    logIn: vi.fn(),
    logOut: vi.fn(),
    signUp: vi.fn(),
  },
  Object: {
    extend: vi.fn(() => ({
      save: vi.fn().mockResolvedValue({}),
      fetch: vi.fn().mockResolvedValue({}),
      destroy: vi.fn().mockResolvedValue({}),
    })),
  },
  Query: vi.fn(() => ({
    find: vi.fn().mockResolvedValue([]),
    first: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
  })),
  initialize: vi.fn(),
  serverURL: '',
}

export default Parse
