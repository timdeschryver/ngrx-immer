import { produce } from 'immer';

/**
 * Helper method that wraps a reducer with the Immer `produce` method
 * Kudos to Alex Okrushko {@link https://lookout.dev/rules/simple-immer-base-function-to-be-used-in-ngrx-store-or-componentstore-for-transforming-data-%22mutably%22}
 */
export function immerReducer<State, Next>(
	callback: (state: State, next: Next) => State | void,
) {
	return (state: State | undefined, next: Next) => {
		return produce(state, (draft: State) => callback(draft, next)) as State;
	};
}
