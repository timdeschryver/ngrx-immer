import { PartialStateUpdater, patchState, WritableStateSource } from '@ngrx/signals';
import { immerReducer } from 'ngrx-immer';

export type ImmerStateUpdater<State extends object> = (state: NoInfer<State>) => void;

function toFullStateUpdater<State extends object>(updater: PartialStateUpdater<State & {}> | ImmerStateUpdater<State & {}>): (state: State) => State | void {
	return (state: State) => {
		const patchedState = updater(state);
		if (patchedState) {
			return ({ ...state, ...patchedState });
		}
		return;
	};
}
export function immerPatchState<State extends object>(
	stateSource: WritableStateSource<State>, 
	...updaters: Array<
		Partial<NoInfer<State>> | PartialStateUpdater<NoInfer<State>> | ImmerStateUpdater<State>
	>): void {
	const immerUpdaters = updaters.map(updater => {
		if (typeof updater === 'function') {
			return immerReducer(toFullStateUpdater(updater)) as unknown as PartialStateUpdater<State & {}>;
		}
		return updater;
	});
	patchState(stateSource, ...immerUpdaters);
}
