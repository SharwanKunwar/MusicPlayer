import { create } from "zustand";

const useMusicStore = create((set) => ({
  songs: [],
  showList: true,

  setSongs: (songs) => set({ songs }),
  toggleList: () => set((state) => ({ showList: !state.showList })),
}));

export default useMusicStore;