import { signalStore, withComputed, withState } from '@ngrx/signals';
import { immerPatchState } from 'ngrx-immer/signals';
import { computed, effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const UserState = signalStore(withState({
	id: 1,
	name: { firstname: 'Konrad', lastname: 'Schultz' },
	address: { city: 'Vienna', zip: '1010' },
}), withComputed(({ name }) => ({ prettyName: computed(() => `${name.firstname()} ${name.lastname()}`) })));


describe('immerPatchState', () => {
	const setup = () => {
		return new UserState;
	};

	it('should do a sanity check', () => {
		const userState = setup();
		expect(userState.id()).toBe(1);
	});

	it('should be type-safe', () => {
		const userState = setup();

		//@ts-expect-error number is not a property
		immerPatchState(userState, { number: 1 });

		//@ts-expect-error number is not a property
		immerPatchState(userState, state => ({ number: 1 }));
	});

	it('should allow patching with object literal', () => {
		const userState = setup();
		immerPatchState(userState, { name: { firstname: 'Lucy', lastname: 'Sanders' } });
		expect(userState.prettyName()).toBe('Lucy Sanders');
	});

	describe('update with return value', () => {
		it('should work with the default patch function', () => {
			const userState = setup();
			immerPatchState(userState, ({ name }) => ({ name: { firstname: name.firstname, lastname: 'Sanders' } }));
			expect(userState.prettyName()).toBe('Konrad Sanders');
		});

		it('should not emit other signals', () => {
			TestBed.runInInjectionContext(() => {
				let effectCounter = 0;
				const userState = setup();
				effect(() => {
					userState.id();
					effectCounter++;
				});
				TestBed.flushEffects();

				expect(effectCounter).toBe(1);
				immerPatchState(userState, ({ name }) => ({ name: { firstname: name.firstname, lastname: 'Sanders' } }));

				TestBed.flushEffects();
				expect(effectCounter).toBe(1);
			});
		});

		it('should throw if a mutated patched state is returned', () => {
			const userState = setup();

			expect(() =>
				immerPatchState(userState, (state) => {
					state.name.lastname = 'Sanders';
					return state;
				})).toThrow('[Immer] An immer producer returned a new value *and* modified its draft.');
		});
	});

	describe('update without returning a value', () => {
		it('should allow a mutable update', () => {
			const userState = setup();
			immerPatchState(userState, (state => {
				state.name = { firstname: 'Lucy', lastname: 'Sanders' };
			}));
			expect(userState.prettyName()).toBe('Lucy Sanders');
		});

		it('should not emit other signals', () => {
			TestBed.runInInjectionContext(() => {
				let effectCounter = 0;
				const userState = setup();
				effect(() => {
					userState.id();
					effectCounter++;
				});
				TestBed.flushEffects();

				expect(effectCounter).toBe(1);
				immerPatchState(userState, (state => {
					state.name = { firstname: 'Lucy', lastname: 'Sanders' };
				}));

				TestBed.flushEffects();
				expect(effectCounter).toBe(1);
			});
		});
	});

	it('should check the Signal notification on multiple updates', () => {
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
				addressEffectCounter++
			});
			effect(() => {
				userState.name();
				nameEffectCounter++
			});


			// first run
			TestBed.flushEffects();
			expect(idEffectCounter).toBe(1);
			expect(addressEffectCounter).toBe(1);
			expect(nameEffectCounter).toBe(1);

			// change
			immerPatchState(userState, (state => {
				state.name = { firstname: 'Lucy', lastname: 'Sanders' };
				state.address.zip = '1020'
			}));

			// second run
			TestBed.flushEffects();
			expect(idEffectCounter).toBe(1);
			expect(addressEffectCounter).toBe(2);
			expect(nameEffectCounter).toBe(2);
		});
	});
});
