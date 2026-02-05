import '@angular/compiler';
import { describe, it, expect } from 'vitest';

import { ImmerComponentStore, provideImmerComponentStore } from 'ngrx-immer/component-store';
import { provideComponentStore } from '@ngrx/component-store';


describe('provideImmerComponentStore', () => {
	it('provideImmerComponentStore() equals provideComponentStore()', () => {
		const ngrxProviders = provideComponentStore(DummyImmerComponentStore as any);

		const ngrxImmerProviders = provideImmerComponentStore(DummyImmerComponentStore);

		// assert
		expect(ngrxImmerProviders).toBeInstanceOf(Array);
		expect(ngrxImmerProviders.length).not.toBe(0);
		expect(ngrxImmerProviders.toString()).toEqual(ngrxProviders.toString());
	});
});

class DummyImmerComponentStore extends ImmerComponentStore<{}> { }
