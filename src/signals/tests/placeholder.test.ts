import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { placeholder } from 'ngrx-immer/signals';

test('placeholder', () => {
	assert.is(placeholder(), 'placeholder');
});
test.run();
