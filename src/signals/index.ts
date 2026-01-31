import { PartialStateUpdater, patchState, WritableStateSource } from '@ngrx/signals';
import { immerReducer } from 'ngrx-immer';
import { on } from '@ngrx/signals/events';
import { produce } from 'immer';

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

export function immerOn<State, ActionCreator extends { type: string } & ((...args: any[]) => any)>(
	creator: ActionCreator,
	reducer: (state: State, action: any) => void
): any {
	return on(creator, (action, state) => produce(state, (draft: State) => reducer(draft, action)));
}