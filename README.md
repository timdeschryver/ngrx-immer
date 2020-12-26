# ngrx-immer

> Immer wrappers around NgRx methods to mutate state easily

## Installation

```bash
npm install ngrx-immer
```

> Do not forget to install immer

## Resources

- [Immer docs](https://immerjs.github.io/immer/docs/introduction)
- [NgRx docs](https://ngrx.io/docs)

## `createImmerReducer`

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

## `immerOn`

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

## `ImmerComponentStore`

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

## `immerReducer`

Inspired by [Alex Okrushko](https://twitter.com/alexokrushko), `immerReducer` is a reducer method that uses the Immer `produce` method.
This method is used by all of the methods in `ngrx-immer` provides.

## Migrating from `ngrx-etc` to `ngrx-immer`

You can execute the following script in your project,
this script replaces everything from `ngrx-etc` to the `ngrx-immer` equivalent.

```bash
npx https://gist.github.com/timdeschryver/efdded8b72bd36ac0a2bc719eca1f161
```

Don't forget to install `ngrx-immer` and `immer` after running the above script.

| Old (`ngrx-etc`)     | New (`ngrx-immer`)  |
| -------------------- | ------------------- |
| mutableOn            | immerOn             |
| createMutableReducer | createImmerReducer  |
|                      | ImmerComponentStore |
|                      | immerReducer        |

## FAQ

- See the Immer docs, [Update patterns](https://immerjs.github.io/immer/docs/update-patterns), on how to mutate state
