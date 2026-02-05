# ngrx-immer

> Immer wrappers around NgRx methods to simplify mutating state

<!-- TOC -->
* [ngrx-immer](#ngrx-immer)
  * [Installation](#installation)
  * [Functions](#functions)
    * [`createImmerReducer` (@ngrx/store)](#createimmerreducer-ngrxstore)
    * [`immerOn` (@ngrx/store)](#immeron-ngrxstore)
    * [`ImmerComponentStore` (@ngrx/component-store)](#immercomponentstore-ngrxcomponent-store)
    * [`immerPatchState` (@ngrx/signals)](#immerpatchstate-ngrxsignals)
    * [`immerOn` (@ngrx/signals)](#immeron-ngrxsignals)
    * [`immerReducer`](#immerreducer)
  * [FAQ](#faq)
  * [Resources](#resources)
<!-- TOC -->

## Installation

```bash
npm install ngrx-immer
```

> Do not forget to install immer

## Functions

### `createImmerReducer` (@ngrx/store)

Creates an NgRx reducer, but allows you to mutate state without having to use to spread operator.

- Use it when you want to go Immer all the way
- Caveat, you have to return the state with each `on` method

```ts
import { createImmerReducer } from 'ngrx-immer/store';

const todoReducer = createImmerReducer(
	{ todos: [] },
	on(newTodo, (state, action) => {
		state.todos.push({ text: action.todo, completed: false });
		return state;
	}),
	on(completeTodo, (state, action) => {
		state.todos[action.index].completed = true;
		return state;
	}),
);
```

### `immerOn` (@ngrx/store)

Creates an NgRx reducer, but allows you to mutate state without having to use to spread operator.

- Use it when you want to go sprinkle a little bit of Immer for more complex cases

```ts
import { immerOn } from 'ngrx-immer/store';

const todoReducer = createReducer(
	{ todos: [] },
	on(newTodo, (state, action) => {
		return {
			...state,
			todos: [...state.todos, action.todo],
		};
	}),
	immerOn(completeTodo, (state, action) => {
		state.todos[action.index].completed = true;
	}),
);
```

### `ImmerComponentStore` (@ngrx/component-store)

Wraps Immer around the Component Store `updater` and `setState` methods.

```ts
import { ImmerComponentStore } from 'ngrx-immer/component-store';

@Injectable()
export class MoviesStore extends ImmerComponentStore<MoviesState> {
	constructor() {
		super({ movies: [] });
	}

	readonly addMovie = this.updater((state, movie: Movie) => {
		state.movies.push(movie);
	});
}
```

### `immerPatchState` (@ngrx/signals)

> [!IMPORTANT]  
> Because `@ngrx/signals` is in developer preview, the `immerPatchState` function is also in developer preview. It is ready to try, but may change before becoming stable.

Provides an Immer-version of the `patchState` function from the `@ngrx/signals` package. In addition to partial state objects and updaters that update the state immutably, it accepts updater functions that update the state in a mutable manner. Similar to `patchState`, the `immerPatchState` function can be used to update the state of both SignalStore and SignalState.

```ts
const UserStore = signalStore(
	withState({
		user: { firstName: 'Konrad', lastName: 'Schultz' },
		address: { city: 'Vienna', zip: '1010' },
	}),
	withMethods((store) => ({
		setLastName(lastName: string): void {
			immerPatchState(store, (state) => {
				state.user.lastName = lastName;
			});
		},
		setCity(city: string): void {
			immerPatchState(store, (state) => {
				state.address.city = city;
			});
		},
	}))
);
```

Please note, that the updater function can only mutate a change without returning it or return an immutable
state without mutable change.

This one is going to throw a runtime error:

```ts
// will throw because of both returning and mutable change
immerPatchState(userStore, (state) => {
	state.name.lastname = 'Sanders'; // mutable change
	return state; // returning state
});
```

### `immerOn` (@ngrx/signals)

Provides an Immer-version of the `on` function from the `@ngrx/signals` package to usage in the `withReducer` feature.
It allows you to mutate the state in a concise and readable way.

```ts
import { signalStoreFeature, type, withReducer } from '@ngrx/signals';
import { event } from '@ngrx/signals/events';
import { immerOn } from 'ngrx-immer/signals';

export const todoEvents = eventGroup({
  source: 'Todo',
  events: {
    addTodo: type<{ text: string}>(),
    removeTodo: type<{ index: number }>(),
    updateTodo: type<{ index: number, text: string }>(),
    clearTodos: type<void>(),
    resetTodos: type<void>(),
  },
});

interface TodoState {
    todos: string[];
}

export function withTodoReducer() {
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
    );
}
```

### `immerReducer`

Inspired by [Alex Okrushko](https://twitter.com/alexokrushko), `immerReducer` is a reducer method that uses the Immer `produce` method.
This method is used by all the methods in `ngrx-immer` provides.

## FAQ

- See the Immer docs, [Update patterns](https://immerjs.github.io/immer/docs/update-patterns), on how to mutate state

## Resources

- [Immer docs](https://immerjs.github.io/immer/)
- [NgRx docs](https://ngrx.io/docs/)
  
