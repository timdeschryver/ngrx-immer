import { skip, take } from 'rxjs/operators';
import { ImmerComponentStore } from '..';

const initialState: { shows: string[] } = {
	shows: [],
};

test('updater mutates state', (doneCb) => {
	const cs = new ImmerComponentStore(initialState);
	const addShow = cs.updater((state, show: string) => {
		state.shows.push(show);
	});

	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		expect(state).toEqual({
			shows: ['The queens gambit'],
		});
		expect(state).not.toBe(initialState);
		doneCb();
	});

	addShow('The queens gambit');
});

test('setState callback mutates state', (doneCb) => {
	const cs = new ImmerComponentStore(initialState);

	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		expect(state).toEqual({
			shows: ['The queens gambit'],
		});
		doneCb();
	});

	cs.setState((state) => {
		state.shows = ['The queens gambit'];
	});
});

test('setState value mutates state', (doneCb) => {
	const cs = new ImmerComponentStore(initialState);

	cs.state$.pipe(skip(1), take(1)).subscribe((state) => {
		expect(state).toEqual({
			shows: ['The queens gambit'],
		});
		doneCb();
	});

	cs.setState({
		shows: ['The queens gambit'],
	});
});
