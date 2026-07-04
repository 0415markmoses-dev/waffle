import {renderHook, act} from '@testing-library/react';
import {useDebounce} from '../../src/Hooks/useDebounce.js';

describe('useDebounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('returns the initial value immediately', () => {
        const {result} = renderHook(() => useDebounce('hello', 500));
        expect(result.current).toBe('hello');
    });

    it('does not update before the delay elapses', () => {
        const {result, rerender} = renderHook(
            ({value}) => useDebounce(value, 500),
            {initialProps: {value: 'a'}}
        );
        rerender({value: 'b'});
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current).toBe('a');
    });

    it('updates after the delay elapses', () => {
        const {result, rerender} = renderHook(
            ({value}) => useDebounce(value, 500),
            {initialProps: {value: 'a'}}
        );
        rerender({value: 'b'});
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(result.current).toBe('b');
    });

    it('resets the timer on rapid changes and only commits the last value', () => {
        const {result, rerender} = renderHook(
            ({value}) => useDebounce(value, 300),
            {initialProps: {value: 'x'}}
        );
        rerender({value: 'y'});
        act(() => {
            vi.advanceTimersByTime(100);
        });
        rerender({value: 'z'});
        act(() => {
            vi.advanceTimersByTime(100);
        });
        // Only 200ms elapsed since last change — still 'x'
        expect(result.current).toBe('x');
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(result.current).toBe('z');
    });

    it('uses 500ms default delay', () => {
        const {result, rerender} = renderHook(
            ({value}) => useDebounce(value),
            {initialProps: {value: 'a'}}
        );
        rerender({value: 'b'});
        act(() => {
            vi.advanceTimersByTime(499);
        });
        expect(result.current).toBe('a');
        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('b');
    });
});
