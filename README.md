# ngrx-immer

> Immer wrappers around NgRx methods to mutate state easily

## Installation

```bash
npm install ngrx-immer
```

> Do not forget to install immer

## Resources

- [Immer docs](https://immerjs.github.io/immer/)
- [NgRx docs](https://ngrx.io/docs/)

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

## `immerPatchState`

Provides an Immer-version of the Signal Store's `patchState`. It adds an additional updater function
which can mutate the state.

```ts
const UserState = signalStore(withState({
	id: 1,
	name: { firstname: 'Konrad', lastname: 'Schultz' },
	address: { city: 'Vienna', zip: '1010' },
}), withComputed(({ name }) => ({ prettyName: computed(() => `${name.firstname()} ${name.lastname()}`) })));

const userState = new UserState();

immerPatchState(userState, (state => {
	state.name = { firstname: 'Lucy', lastname: 'Sanders' };
	state.address.zip = '1020'
}));
```

Please note, that the updater function can only mutate a change without returning it or return an immutable 
state without mutable change.

This one is going to throw a runtime error:

```ts
// will throw because of both returning and mutable change
immerPatchState(userState, (state) => {
	state.name.lastname = 'Sanders'; // mutable change
	return state; // returning state
});
```



## `immerReducer`

Inspired by [Alex Okrushko](https://twitter.com/alexokrushko), `immerReducer` is a reducer method that uses the Immer `produce` method.
This method is used by all the methods in `ngrx-immer` provides.

## FAQ

- See the Immer docs, [Update patterns](https://immerjs.github.io/immer/docs/update-patterns), on how to mutate state
