import { signalStore, signalStoreFeature, type, withState } from '@ngrx/signals';
import { withReducer, Dispatcher, eventGroup } from '@ngrx/signals/events';
import { immerOn } from 'ngrx-immer/signals';
import { TestBed } from '@angular/core/testing';
import { inject } from '@angular/core';

describe('immerOn integration', () => {
    const todoEvents = eventGroup({
        source: 'Todo',
        events: {
            addTodo: type<{ text: string }>(),
            removeTodo: type<{ index: number }>(),
            updateTodo: type<{ index: number, text: string }>(),
            clearTodos: type<void>(),
            resetTodos: type<void>(),
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
                }),
                immerOn(todoEvents.clearTodos, todoEvents.resetTodos, (state) => {
                    state.todos = [];
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

            dispatcher.dispatch(todoEvents.addTodo({ text: 'test' }));
            expect(store.todos()).toEqual(['test']);

            dispatcher.dispatch(todoEvents.addTodo({ text: 'test2' }));
            expect(store.todos()).toEqual(['test', 'test2']);

            dispatcher.dispatch(todoEvents.updateTodo({ index: 0, text: 'updated' }));
            expect(store.todos()).toEqual(['updated', 'test2']);

            dispatcher.dispatch(todoEvents.removeTodo({ index: 1 }));
            expect(store.todos()).toEqual(['updated']);

            dispatcher.dispatch(todoEvents.clearTodos());
            expect(store.todos()).toEqual([]);

            dispatcher.dispatch(todoEvents.addTodo({ text: 'test' }));
            dispatcher.dispatch(todoEvents.resetTodos());
            expect(store.todos()).toEqual([]);
        });
    });
});
