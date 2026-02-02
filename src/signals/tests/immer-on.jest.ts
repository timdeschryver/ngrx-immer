import { signalStore, signalStoreFeature, type, withState } from '@ngrx/signals';
import { event, withReducer, Dispatcher, eventGroup } from '@ngrx/signals/events';
import { immerOn } from 'ngrx-immer/signals';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';

describe('immerOn integration', () => {
    export const todoEvents = eventGroup({
        source: 'Todo',
        events: {
            addTodo: type<{ text: string}>(),
            removeTodo: type<{ index: number }>(),
            updateTodo: type<{ index: number, text: string }>(),
        },
    });


    interface TodoState {
        todos: string[];
    }

    function withTodoReducer() {
        return signalStoreFeature(
            type<{ state: TodoState }>(),
            withReducer(
                immerOn(todoEvents.addTodo, (state, { payload: { text } }) => {
                    state.todos.push(text);
                }),
                immerOn(todoEvents.removeTodo, (state, { payload: { index } }) => {
                    state.todos.splice(index, 1);
                }),
                immerOn(todoEvents.updateTodo, (state, { payload: { index, text } }) => {
                    state.todos[index] = text;
                })
            )
        )
    }

    const TodoStore = signalStore(
        withState<TodoState>({ todos: [] }),
        withTodoReducer()
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
