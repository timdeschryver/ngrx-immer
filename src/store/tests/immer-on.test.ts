import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { createReducer, createAction, props } from '@ngrx/store';
import { immerOn } from 'ngrx-immer/store';

const addItem = createAction('add item', props<{ item: string }>());
const deleteItem = createAction('delete item', props<{ index: number }>());
const addOtherItem = createAction('add other item', props<{ item: string }>());

const reducer = createReducer<{ items: string[]; otherItems: string[] }>(
	{
		items: [],
		otherItems: [],
	},
	immerOn(addItem, (state, { item }) => {
		if (item === 'noop') return;
		state.items.push(item);
	}),
	immerOn(deleteItem, (state, { index }) => {
		state.items.splice(index, 1);
	}),
	immerOn(addOtherItem, (state, { item }) => {
		state.otherItems.push(item);
	}),
);

test('returns the same instance when not modified', () => {
	const initialState = { items: [], otherItems: [] };
	const state = reducer(initialState, addItem({ item: 'noop' }));
	assert.is(state, initialState);
});

test('returns a different instance when modified', () => {
	const initialState = { items: [], otherItems: [] };
	const state = reducer(initialState, addItem({ item: 'item one' }));
	assert.is.not(state, initialState);
});

test('only updates affected properties', () => {
	const initialState = { items: [], otherItems: [] };
	const state = reducer(initialState, addItem({ item: 'item one' }));
	assert.is.not(state.items, initialState.items);
	assert.is(state.otherItems, initialState.otherItems);
});

test('smoketest', () => {
	const initialState = { items: [], otherItems: [] };
	const actions = [
		addItem({ item: 'item one' }),
		addItem({ item: 'item two' }),
		addItem({ item: 'item three' }),
		addOtherItem({ item: 'other item one' }),
		deleteItem({ index: 1 }),
	];
	const state = actions.reduce(reducer, initialState);
	assert.equal(state, {
		items: ['item one', 'item three'],
		otherItems: ['other item one'],
	});
});

test.run();
