import { PartialStateUpdater, patchState, StateSignal } from '@ngrx/signals';
import { immerReducer } from 'ngrx-immer';

export type ImmerStateUpdater<State extends object> = (state: State) => void;

function toFullStateUpdater<State extends object>(updater: PartialStateUpdater<State & {}> | ImmerStateUpdater<State & {}>): (state: State) => State | void {
	return (state: State) => {
		const patchedState = updater(state);
		if (patchedState) {
			return ({ ...state, ...patchedState });
		}
		return;
	};
}

type Prettify<T> = { [K in keyof T]: T[K] } & {};
export function immerPatchState<State extends object>(state: StateSignal<State>, ...updaters: Array<Partial<Prettify<State>> | PartialStateUpdater<Prettify<State>> | ImmerStateUpdater<Prettify<State>>>) {
	const immerUpdaters = updaters.map(updater => {
		if (typeof updater === 'function') {
			return immerReducer(toFullStateUpdater(updater)) as unknown as PartialStateUpdater<State & {}>;
		}
		return updater;
	});
	patchState(state, ...immerUpdaters);
}
