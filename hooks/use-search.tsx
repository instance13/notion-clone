import { create } from "zustand";

// type for the initial global state 
type SearchStore = {
  isOpen: boolean;
  // functions that change isOpen value
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
};

// create having a defined type.
export const useSearch = create<SearchStore>((set, get) => ({ 
  // initial global state with a function of type Initializer which is also of type StateCreator.
  isOpen: false,
  onOpen: () => set({isOpen: true}),
  onClose: () => set({ isOpen: false }),
  // get() refers to the actual state and .isOpen is just accesing the property isOpen of the mentioned state.
  toggle: () => set({isOpen: !get().isOpen}),
}))