import { PartialStateUpdater, patchState, WritableStateSource } from '@ngrx/signals';
import { immerReducer } from 'ngrx-immer';
import { on, EventCreator } from '@ngrx/signals/events';
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



type CaseReducer<
	State extends object,
	EventCreators extends EventCreator<string, any>[],
> = (
	event: { [K in keyof EventCreators]: ReturnType<EventCreators[K]> }[number],
	state: State
) =>
		| Partial<State>
		| PartialStateUpdater<State>
		| Array<Partial<State> | PartialStateUpdater<State>>;

type CaseReducerResult<State extends object, EventCreators extends EventCreator<string, any>[]> = {
	reducer: CaseReducer<State, EventCreators>;
	events: EventCreators;
};

export function immerOn<State extends object, EventCreators extends EventCreator<string, any>[]>(
	...args: [
		...events: EventCreators,
		reducer: (state: State, action: ReturnType<EventCreators[number]>) => void
	]
): CaseReducerResult<State, EventCreator<string, any>[]> {
	const reducer = args.pop() as (state: State, action: ReturnType<EventCreators[number]>) => void;
	const events = args as unknown as EventCreators;
	return (on as any)(...events, (action: any, state: any) => produce(state, (draft: any) => reducer(draft, action)));
}