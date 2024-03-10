import { PartialStateUpdater, patchState, signalStore, StateSignal, withState } from '@ngrx/signals';
import { immerReducer } from 'ngrx-immer';

const UserState = signalStore(withState({id: 1, name: {firstname: 'Konrad', lastname: 'Schultz'}, address: {city: 'Vienna', zip: '1010'}}));
const userState = new UserState();

function toFullStateUpdater<State extends object>(updater: PartialStateUpdater<State>)

export function immerPatchState<State extends object>(state: StateSignal<State>,   ...updaters: Array<Partial<State & {}> | PartialStateUpdater<State & {}>>) {
	const immerUpdaters = updaters.map(updater => {
		if (typeof updater === 'function') {
immerReducer(state, updater);
		}
		return typeof updater === 'function' ? immerReducer(updater) : updater;
	})
patchState(state, immerUpdaters);
}

immerPatchState(userState, {nummer: 1})