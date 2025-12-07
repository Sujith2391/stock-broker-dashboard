import { create } from 'zustand';

const useStore = create((set, get) => ({
    user: null,
    token: null,
    subscribedTickers: [],
    prices: {},

    // Actions
    login: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null, subscribedTickers: [], prices: {} }),

    setSubscriptions: (tickers) => set({ subscribedTickers: tickers }),

    updatePrice: (ticker, priceData) => set((state) => ({
        prices: {
            ...state.prices,
            [ticker]: priceData // { price, timestamp, change? }
        }
    })),

    // Helper to toggle locally before confirming with API
    addSubscription: (ticker) => set((state) => ({
        subscribedTickers: [...state.subscribedTickers, ticker]
    })),

    removeSubscription: (ticker) => set((state) => ({
        subscribedTickers: state.subscribedTickers.filter(t => t !== ticker)
    }))
}));

export default useStore;
