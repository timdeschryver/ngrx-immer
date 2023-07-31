import { ComponentStore, provideComponentStore } from '@ngrx/component-store';
import { Provider, Type } from '@angular/core';
import { ImmerComponentStore } from '.';

/**
 * @description
 * Immer wrapper around `provideComponentStore()` in `@ngrx/component-store`.
 * @returns the ImmerComponentStore class registered as a provider
 */
export function provideImmerComponentStore<T extends object>(componentStoreClass: Type<ImmerComponentStore<T>>): Provider[] {
    return provideComponentStore(componentStoreClass as Type<ComponentStore<T>>);
}