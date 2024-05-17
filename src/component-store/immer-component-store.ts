import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ComponentStore, INITIAL_STATE_TOKEN } from '@ngrx/component-store';

import { immerReducer } from 'ngrx-immer/shared';
import { produce } from 'immer';

/**
 * Immer wrapper around `ImmerComponentStore` to mutate state
 * with `updater` and `setState`
 */
@Injectable()
export class ImmerComponentStore<
	State extends object
> extends ComponentStore<State> {
	constructor(@Optional() @Inject(INITIAL_STATE_TOKEN) defaultState?: State) {
		super(produce(defaultState, s => s));
	}

	updater<
		ProvidedType = void,
		OriginType = ProvidedType,
		ValueType = OriginType,
		ReturnType = OriginType extends void
			? () => void
			: (observableOrValue: ValueType | Observable<ValueType>) => Subscription
	>(updaterFn: (state: State, value: OriginType) => void | State): ReturnType {
		return super.updater(immerReducer(updaterFn));
	}

	setState(stateOrUpdaterFn: State | ((state: State) => void | State)): void {
		super.setState(stateOrUpdaterFn as State | ((state: State) => State));
	}
}
