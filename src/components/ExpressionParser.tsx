import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

type ExponentElement = {
    base: string;
    exponent: string;
};

type ExpressionElement = string | ExponentElement;

export default function ExpressionParser() {
    const [elements, setElements] = useState<ExpressionElement[]>([]);
    const [focusedExpIndex, setFocusedExpIndex] = useState<number | null>(null);
    const [cursorPosition, setCursorPosition] = useState<number>(-1);
    const exponentRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [calculationResult, setCalculationResult] = useState<string>('');

    const [lastAction, setLastAction] = useState<string>('None');

    useEffect(() => {
        if (focusedExpIndex !== null && exponentRefs.current[focusedExpIndex]) {
            exponentRefs.current[focusedExpIndex]?.focus();
        }
    }, [focusedExpIndex]);

    const addDigit = (digit: string, e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        if (focusedExpIndex !== null) {
            const updatedElements = [...elements];
                const element = updatedElements[focusedExpIndex] as ExponentElement;
                updatedElements[focusedExpIndex] = {
                    ...element,
                    exponent: element.exponent + digit
                };
                setElements(updatedElements);
                setLastAction(`Added ${digit} to exponent at index ${focusedExpIndex}`);

                if (exponentRefs.current[focusedExpIndex]) {
                    exponentRefs.current[focusedExpIndex]?.focus();
                }

        } else if (cursorPosition !== -2) {
            const updatedElements = [
                ...elements.slice(0, cursorPosition + 1),
                digit,
                ...elements.slice(cursorPosition + 1)
            ];
            setElements(updatedElements);
            setCursorPosition(cursorPosition + 1); 
            setLastAction(`Added ${digit} at cursor position ${cursorPosition}`);
        }
    };

    const handleEquals = async (): Promise<void> => {
        try {
            const expressionString = parseExpression(elements);
            const result = await invoke('parse_expression', { input: expressionString });
            setCalculationResult(result as string);
            setLastAction(`Calculated expression: ${expressionString}`);
        } catch (error) {
            console.error('Error calculating expression:', error);
            setCalculationResult(`Error: ${error}`);
            setLastAction(`Error calculating expression`);
        }
    };

    const addExponent = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        if (elements.length === 0) return;

        const targetIndex = cursorPosition !== -1? cursorPosition : elements.length - 1;
        const lastElement = elements[targetIndex];

        if (typeof lastElement === 'string') {
            const updatedElements = [
                ...elements.slice(0, cursorPosition),
                { base: lastElement, exponent: '' },
                ...elements.slice(cursorPosition + 1)
            ];

            setElements(updatedElements);
            setLastAction(`Created exponent for base ${lastElement}`);
            setLastAction(`Created exponent for base ${lastElement}`);

            setFocusedExpIndex(updatedElements.length - 1);
        }
    };

    const updateExponent = (index: number, value: string): void => {
        const updatedElements = [...elements];
        if (typeof updatedElements[index] !== 'string') {
            const element = updatedElements[index] as ExponentElement;
            updatedElements[index] = {
                ...element,
                exponent: value
            };
            setElements(updatedElements);
            setLastAction(`Updated exponent at index ${index} to ${value}`);
        }
    };

    const handleInputFocus = (index: number): void => {
        setFocusedExpIndex(index);
        setLastAction(`Focused on exponent at index ${index}`);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
        if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).classList.contains('expression-button')) {
            setFocusedExpIndex(null);
            setLastAction('Removed focus from exponent');
        }
    };

    const handleDelete = (): void => {
        if (elements.length === 0) return;

        if (focusedExpIndex !== null) {
            const updatedElements = [...elements];
            const element = updatedElements[focusedExpIndex] as ExponentElement;
            
            if (element.exponent.length > 0) {
                updatedElements[focusedExpIndex] = {
                    ...element,
                    exponent: element.exponent.slice(0, -1)
                };
                setElements(updatedElements);
                setLastAction(`Deleted last character from exponent at index ${focusedExpIndex}`);
            } else {
                updatedElements[focusedExpIndex] = element.base;
                setElements(updatedElements);
                setFocusedExpIndex(null);
                setLastAction(`Removed empty exponent at index ${focusedExpIndex}`);
            }
        } else if (cursorPosition !== -1) {
            const updatedElements = [...elements];
            updatedElements.splice(cursorPosition, 1);
            setElements(updatedElements);

            setCursorPosition(Math.max(-1, cursorPosition - 1));
            setLastAction(`Deleted element at cursor position ${cursorPosition}`);
        } else {
            setLastAction('Cant delete nothing');
        }
    };

    const parseExpression = (elements: ExpressionElement[]): string => {
        return elements
            .map(el => {
                if (typeof el === 'string') {
                    return el;
                } else {
                    return `${el.base}^${el.exponent || '?'}`;
                }
            })
            .join(' ');
    };

    const parsedString = parseExpression(elements);

    const handleNavigation = (direction: 'left' | 'right' | 'up' | 'down'): void => {
        if (elements.length === 0) return;

        if (direction === 'left') {
            if (cursorPosition > -1) {
                setCursorPosition(cursorPosition - 1);
                setFocusedExpIndex(null);
                setLastAction(`Moved cursor left to position ${cursorPosition - 1}`);
            }
        } else if (direction === 'right') {
            if (cursorPosition < elements.length - 1) {
                setCursorPosition(cursorPosition + 1);
                setFocusedExpIndex(null);
                setLastAction(`Moved cursor right to position ${cursorPosition + 1}`);
            }
        } else if (direction === 'up' && cursorPosition !== -1 && focusedExpIndex === null) {
            const element = elements[cursorPosition];
            if (typeof element !== 'string') {
                setFocusedExpIndex(cursorPosition);
                setLastAction(`Moved cursor up to exponent at position ${cursorPosition}`);
            }
        } else if (direction === 'down') {
            setFocusedExpIndex(null);
            setLastAction('Moved cursor down from exponent');
        }
    };

    return (
        <div className="expression-container">
            <div className="expression-display">
                {elements.map((el, index) =>
                    typeof el === 'string' ? (
                        <span key={index} className={`mx-1 select-none ${cursorPosition === index ? 'highlight' : ''}`}>
                            {el}
                            {cursorPosition === index && (
                                <span className="cursor-indicator">|</span>
                            )}
                        </span>
                    ) : (
                        <span key={index} className={`inline-flex items-start mx-1 ${cursorPosition === index && focusedExpIndex !== index ? 'highlight' : ''}`}>
                            <span className="select-none">{el.base}</span>
                            <span className="inline-block relative -top-3 text-sm ml-1">
                                <input
                                    ref={(element) => (exponentRefs.current[index] = element)}
                                    className={`exponent-input ${
                                        focusedExpIndex === index ? 'border border-blue-500 bg-blue-50' : 'border-b border-gray-300 bg-transparent'
                                    }`}
                                    style={{
                                        width: `${Math.max(1, el.exponent.length) * 0.6 + 0.8}em`,
                                        caretColor: 'black'
                                    }}
                                    value={el.exponent}
                                    onChange={(e) => updateExponent(index, e.target.value)}
                                    onFocus={() => handleInputFocus(index)}
                                    onBlur={handleInputBlur}
                                    placeholder="?"
                                />
                            </span>
                            {cursorPosition === index && (
                                <span className="cursor-indicator">|</span>
                            )}
                        </span>
                    )
                )}
                {elements.length === 0 && (
                    <span className="cursor-indicator">|</span>
                )}
            </div>

            <div className="navigation-controls">
                <button
                    className="expression-button nav-button"
                    onClick={() => handleNavigation('up')}
                >
                    ↑
                </button>
                <div className="horizontal-nav">
                    <button
                        className="expression-button nav-button"
                        onClick={() => handleNavigation('left')}
                    >
                        ←
                    </button>
                    <button
                        className="expression-button nav-button"
                        onClick={() => handleNavigation('right')}
                    >
                        →
                    </button>
                </div>
                <button
                    className="expression-button nav-button"
                    onClick={() => handleNavigation('down')}
                >
                    ↓
                </button>
            </div>

            <div className="button-grid">
                {/* Digits */}
                {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((digit) => (
                    <button
                        key={digit}
                        className="expression-button"
                        onMouseDown={(e) => addDigit(digit.toString(), e)}
                    >
                        {digit}
                    </button>
                ))}

                {/* Operators */}
                {['+', '-', '*', '/'].map((op) => (
                    <button
                        key={op}
                        className="expression-button operator-button"
                        onMouseDown={(e) => addDigit(op, e)}
                    >
                        {op}
                    </button>
                ))}

                {/* Exponent */}
                <button
                    className="expression-button exp-button"
                    onMouseDown={addExponent}
                >
                    x<sup>y</sup>
                </button>

                {/* Equals button */}
                <button
                    className="expression-button equals-button"
                    onClick={handleEquals}
                >
                    =
                </button>

                <button
                    className="expression-button delete-button"
                    onClick={handleDelete}
                >
                    DEL
                </button>
            </div>

            <div className="debug-info">
                <div><strong>Debug Info:</strong></div>
                <div>Current focus index: {focusedExpIndex !== null ? focusedExpIndex : 'None'}</div>
                <div>Last action: {lastAction}</div>
            </div>

            <div className="parsed-expression">
                <strong>Parsed Expression:</strong> {parsedString}
            </div>

            {calculationResult && (
                <div className="calculation-result">
                    <strong>Result:</strong>
                    <pre>{calculationResult}</pre>
                </div>
            )}
        </div>
    );
}


