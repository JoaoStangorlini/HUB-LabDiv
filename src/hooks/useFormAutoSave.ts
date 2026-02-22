import { useEffect, useRef } from 'react';
import { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';

interface AutoSaveOptions {
    key: string;
    debounceMs?: number;
}

export function useFormAutoSave<T extends FieldValues>(
    form: UseFormReturn<T>,
    options: AutoSaveOptions
) {
    const { watch, setValue, reset } = form;
    const { key, debounceMs = 1000 } = options;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.timestamp && parsed.data) {
                    const age = Date.now() - parsed.timestamp;
                    if (age < 24 * 60 * 60 * 1000) { // 24 hours validity
                        reset(parsed.data);
                    } else {
                        localStorage.removeItem(key); // Expired payload
                    }
                } else {
                    // Legacy format
                    reset(parsed);
                }
            } catch (e) {
                console.error('Error loading auto-save data:', e);
            }
        }
    }, [key, reset]);

    // Save to localStorage when watched values change
    useEffect(() => {
        const subscription = watch((value) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                const payload = {
                    timestamp: Date.now(),
                    data: value
                };
                localStorage.setItem(key, JSON.stringify(payload));
            }, debounceMs);
        });

        return () => {
            subscription.unsubscribe();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [watch, key, debounceMs]);

    const clearAutoSave = () => {
        localStorage.removeItem(key);
    };

    return { clearAutoSave };
}
