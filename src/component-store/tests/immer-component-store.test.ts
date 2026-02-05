import '@angular/compiler';
import { describe, it, expect } from 'vitest';

import { skip, take } from 'rxjs/operators';
import { ImmerComponentStore } from 'ngrx-immer/component-store';

const initialState: { shows: string[] } = {
	shows: [],
};

describe('ImmerComponentStore', () => {
	it('updater mutates state', () => {
		const cs = new ImmerComponentStore(initialState);
		const addShow = cs.updater((state, show: string) => {
			state.shows.push(show);
		});

		let newState = {};
		cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
			newState = state;
		});

		addShow('The queens gambit');

		expect(newState).toEqual({
			shows: ['The queens gambit'],
		});
		expect(newState).not.toBe(initialState);
	});

	it('setState callback mutates state', () => {
		const cs = new ImmerComponentStore(initialState);

		let newState = {};
		cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
			newState = state;
		});

		cs.setState((state) => {
			state.shows = ['The queens gambit'];
		});

		expect(newState).toEqual({
			shows: ['The queens gambit'],
		});
		expect(newState).not.toBe(initialState);
	});

	it('setState value mutates state', () => {
		const cs = new ImmerComponentStore(initialState);

		let newState = {};
		cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
			newState = state;
		});

		cs.setState({
			shows: ['The queens gambit'],
		});

		expect(newState).toEqual({
			shows: ['The queens gambit'],
		});
		expect(newState).not.toBe(initialState);
	});
});
