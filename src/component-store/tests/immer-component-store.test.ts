import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { skip, take } from 'rxjs/operators';
import { ImmerComponentStore } from 'ngrx-immer/component-store';

const initialState: { shows: string[] } = {
	shows: [],
};

test('updater mutates state', () => {
	const cs = new ImmerComponentStore(initialState);
	const addShow = cs.updater((state, show: string) => {
		state.shows.push(show);
	});

	let newState = {};
	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		newState = state;
	});

	addShow('The queens gambit');

	assert.equal(newState, {
		shows: ['The queens gambit'],
	});
	assert.is.not(newState, initialState);
});

test('setState callback mutates state', () => {
	const cs = new ImmerComponentStore(initialState);

	let newState = {};
	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		newState = state;
	});

	cs.setState((state) => {
		state.shows = ['The queens gambit'];
	});

	assert.equal(newState, {
		shows: ['The queens gambit'],
	});
	assert.is.not(newState, initialState);
});

test('setState value mutates state', () => {
	const cs = new ImmerComponentStore(initialState);

	let newState = {};
	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		newState = state;
	});

	cs.setState({
		shows: ['The queens gambit'],
	});

	assert.equal(newState, {
		shows: ['The queens gambit'],
	});
	assert.is.not(newState, initialState);
});

test.run();
