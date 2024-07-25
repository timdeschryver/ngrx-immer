import {
	PartialStateUpdater,
	signalStore,
	withComputed,
	withMethods,
	withState,
} from '@ngrx/signals';
import { immerPatchState } from 'ngrx-immer/signals';
import { computed, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('immerPatchState (unprotected)', () => {
	const UnprotectedUserState = signalStore(
		{ protectedState: false },
		withState({
			id: 1,
			name: { firstname: 'Konrad', lastname: 'Schultz' },
			address: { city: 'Vienna', zip: '1010' },
		}),
		withComputed(({ name }) => ({
			prettyName: computed(() => `${name.firstname()} ${name.lastname()}`),
		})),
	);

	const setup = () => {
		return new UnprotectedUserState();
	};

	it('smoketest', () => {
		const userState = setup();
		expect(userState.id()).toBe(1);
	});

	it('is type-safe', () => {
		const userState = setup();

		//@ts-expect-error number is not a property
		immerPatchState(userState, { number: 1 });

		//@ts-expect-error number is not a property
		immerPatchState(userState, (state) => ({ number: 1 }));
	});

	it('allows patching with object literal', () => {
		const userState = setup();
		immerPatchState(userState, {
			name: { firstname: 'Lucy', lastname: 'Sanders' },
		});
		expect(userState.prettyName()).toBe('Lucy Sanders');
	});

	describe('update with return value', () => {
		it('works with the default patch function', () => {
			const userState = setup();
			immerPatchState(userState, ({ name }) => ({
				name: { firstname: name.firstname, lastname: 'Sanders' },
			}));
			expect(userState.prettyName()).toBe('Konrad Sanders');
		});

		it('works with chained patch functions', () => {
			const userState = setup();

			function updateNames<
				T extends {
					name: { firstname: string; lastname: string };
				},
			>(newState: T): PartialStateUpdater<T> {
				return (state) => {
					return {
						...state,
						...newState
					};
				};
			}

			immerPatchState(
				userState,
				updateNames({ name: { firstname: 'Konrad', lastname: 'Sanders' } }),
				(state) => {
					state.id = 2;
				},
				(state) => {
					state.address = { city: 'Updated', zip: '1234' };
				},
			);

			expect(userState.prettyName()).toBe('Konrad Sanders');
			expect(userState.id()).toBe(2);
			expect(userState.address()).toEqual({ city: 'Updated', zip: '1234' });
		});

		it('does not emit other signals', () => {
			TestBed.runInInjectionContext(() => {
				let effectCounter = 0;
				const userState = setup();
				effect(() => {
					userState.id();
					effectCounter++;
				});
				TestBed.flushEffects();

				expect(effectCounter).toBe(1);
				immerPatchState(userState, ({ name }) => ({
					name: { firstname: name.firstname, lastname: 'Sanders' },
				}));

				TestBed.flushEffects();
				expect(effectCounter).toBe(1);
			});
		});

		it('throws if a mutated patched state is returned', () => {
			const userState = setup();

			expect(() =>
				immerPatchState(userState, (state) => {
					state.name.lastname = 'Sanders';
					return state;
				}),
			).toThrow(
				'[Immer] An immer producer returned a new value *and* modified its draft.',
			);
		});
	});

	describe('update without returning a value', () => {
		it('allows a mutable update', () => {
			const userState = setup();
			immerPatchState(userState, (state) => {
				state.name = { firstname: 'Lucy', lastname: 'Sanders' };
			});
			expect(userState.prettyName()).toBe('Lucy Sanders');
		});

		it('does not emit other signals', () => {
			TestBed.runInInjectionContext(() => {
				let effectCounter = 0;
				const userState = setup();
				effect(() => {
					userState.id();
					effectCounter++;
				});
				TestBed.flushEffects();

				expect(effectCounter).toBe(1);
				immerPatchState(userState, (state) => {
					state.name = { firstname: 'Lucy', lastname: 'Sanders' };
				});

				TestBed.flushEffects();
				expect(effectCounter).toBe(1);
			});
		});
	});

	it('checks the Signal notification on multiple updates', () => {
		TestBed.runInInjectionContext(() => {
			// setup effects
			let addressEffectCounter = 0;
			let nameEffectCounter = 0;
			let idEffectCounter = 0;
			const userState = setup();
			effect(() => {
				userState.id();
				idEffectCounter++;
			});
			effect(() => {
				userState.address();
				addressEffectCounter++;
			});
			effect(() => {
				userState.name();
				nameEffectCounter++;
			});

			// first run
			TestBed.flushEffects();
			expect(idEffectCounter).toBe(1);
			expect(addressEffectCounter).toBe(1);
			expect(nameEffectCounter).toBe(1);

			// change
			immerPatchState(userState, (state) => {
				state.name = { firstname: 'Lucy', lastname: 'Sanders' };
				state.address.zip = '1020';
			});

			// second run
			TestBed.flushEffects();
			expect(idEffectCounter).toBe(1);
			expect(addressEffectCounter).toBe(2);
			expect(nameEffectCounter).toBe(2);
		});
	});
});

describe('immerPatchState (protected)', () => {
	const ProtectedUserState = signalStore(
		{ protectedState: true },
		withState({
			id: 1,
			name: { firstname: 'Konrad', lastname: 'Schultz' },
			address: { city: 'Vienna', zip: '1010' },
		}),
		withComputed(({ name }) => ({
			prettyName: computed(() => `${name.firstname()} ${name.lastname()}`),
		})),
		withMethods((store) => ({
			setName: (name: {firstname:string, lastname:string}) => immerPatchState(store, { name }),
			incrementId: () => immerPatchState(store, state => {
				state.id++;
			}),
		}))
	);

	const setup = () => {
		return new ProtectedUserState();
	};

	it('smoketest', () => {
		const userState = setup();
		expect(userState.id()).toBe(1);
	});

	it('state is protected and cannot be updated from the outside', () => {
		const userState = setup();

		expect(() => {
			// @ts-ignore
			immerPatchState(userState, (state) => ({ number: 1 }));
		}).toThrow();
	});

	it('allows patching protected state using withMethods', () => {
		const userState = setup();

		userState.incrementId();
		userState.setName({ firstname: 'Lucy', lastname: 'Sanders' });

		expect(userState.prettyName()).toBe('Lucy Sanders');
		expect(userState.id()).toBe(2);
	});
});
