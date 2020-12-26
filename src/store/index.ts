import {
	Action,
	On,
	ActionReducer,
	createReducer,
	ActionCreator,
	ActionType,
	on,
} from '@ngrx/store';
import { Draft } from 'immer';

import { immerReducer } from 'ngrx-immer/shared';

/**
 * An immer reducer that allows a void return
 */
export interface ImmerOnReducer<
	State,
	AC extends ActionCreator[],
	D = Draft<State>
> {
	(state: D, action: ActionType<AC[number]>): void;
}

/**
 * Immer wrapper around `on` to mutate state
 */
export function immerOn<
	Creators extends ActionCreator[],
	State,
	Reducer extends ImmerOnReducer<State, Creators>
>(...args: [...creators: Creators, reducer: Reducer]): On<State> {
	const reducer = (args.pop() as Function) as ActionReducer<State>;
	return (on as any)(...(args as ActionCreator[]), immerReducer(reducer));
	// when NgRx 11 is released
	// return on(...(args as ActionCreator[]), immerReducer(reducer));
}

/**
 * Immer wrapper around `createReducer` to mutate state
 */
export function createImmerReducer<State, A extends Action = Action>(
	initialState: State,
	...ons: On<State>[]
): ActionReducer<State, A> {
	const reducer = createReducer(initialState, ...ons);
	return function reduce(state: State = initialState, action: A) {
		return immerReducer<State, A>(reducer)(state, action);
	};
}
