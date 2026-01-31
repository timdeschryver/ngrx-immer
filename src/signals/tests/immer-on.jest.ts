import { signalStore, withState } from '@ngrx/signals';
import { event, withReducer, Dispatcher } from '@ngrx/signals/events';
import { immerOn } from 'ngrx-immer/signals';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';

describe('immerOn integration', () => {
    // Use example objects for type inference
    const addTodo = event('addTodo', { text: '' });
    const removeTodo = event('removeTodo', { index: 0 });
    const updateTodo = event('updateTodo', { index: 0, text: '' });

    interface TodoState {
        todos: string[];
    }

    const TodoStore = signalStore(
        withState({ todos: [] as string[] }),
        withReducer(
            immerOn(addTodo, (state: TodoState, { payload: { text } }) => {
                state.todos.push(text);
            }),
            immerOn(removeTodo, (state: TodoState, { payload: { index } }) => {
                state.todos.splice(index, 1);
            }),
            immerOn(updateTodo, (state: TodoState, { payload: { index, text } }) => {
                state.todos[index] = text;
            })
        )
    );

    it('updates state utilizing immer', () => {
        TestBed.runInInjectionContext(() => {
            const store = new TodoStore();
            const dispatcher = inject(Dispatcher);

            dispatcher.dispatch(addTodo({ text: 'test' }));
            expect(store.todos()).toEqual(['test']);

            dispatcher.dispatch(addTodo({ text: 'test2' }));
            expect(store.todos()).toEqual(['test', 'test2']);

            dispatcher.dispatch(updateTodo({ index: 0, text: 'updated' }));
            expect(store.todos()).toEqual(['updated', 'test2']);

            dispatcher.dispatch(removeTodo({ index: 1 }));
            expect(store.todos()).toEqual(['updated']);
        });
    });
});
