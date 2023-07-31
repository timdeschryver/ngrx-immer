import '@angular/compiler';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { ImmerComponentStore, provideImmerComponentStore } from 'ngrx-immer/component-store';
import { provideComponentStore } from '@ngrx/component-store';


test('provideImmerComponentStore() should equal provideComponentStore()', () => {
	const ngrxProviders = provideComponentStore(DummyImmerComponentStore as any);

	const ngrxImmerProviders = provideImmerComponentStore(DummyImmerComponentStore);

	// assert
	assert.instance(ngrxImmerProviders, Array);
	assert.is.not(ngrxImmerProviders.length, 0);
	assert.equal(ngrxImmerProviders.toString(), ngrxProviders.toString());
});

class DummyImmerComponentStore extends ImmerComponentStore<{}> { }

test.run();
