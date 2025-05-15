import { useState, useRef, useEffect } from 'react';

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

    // Debug state to see what's happening
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
            if (typeof updatedElements[focusedExpIndex] !== 'string') {
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
            }
        } else if (cursorPosition !== -1) {
            const updatedElements = [
                ...elements.slice(0, cursorPosition + 1),
                digit,
                ...elements.slice(cursorPosition + 1)
            ];
            setElements(updatedElements);
            setCursorPosition(cursorPosition + 1); 
            setLastAction(`Added ${digit} at cursor position ${cursorPosition}`);
        } else {
            setElements([...elements, digit]);
            setCursorPosition(elements.length); 
            setLastAction(`Added ${digit} to main expression`);
        }
    };

    const addExponent = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        if (elements.length === 0) return;

        const lastIndex = elements.length - 1;
        const lastElement = elements[lastIndex];

        if (typeof lastElement === 'string') {
            const newElements = [
                ...elements.slice(0, -1),
                { base: lastElement, exponent: '' } as ExponentElement
            ];

            setElements(newElements);
            setLastAction(`Created exponent for base ${lastElement}`);

            setFocusedExpIndex(newElements.length - 1);
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
            setLastAction(`Deleted element at cursor position ${cursorPosition}`);
            
            // Keep cursor at the same position unless we're at the end
            if (cursorPosition >= updatedElements.length) {
                setCursorPosition(Math.max(-1, updatedElements.length - 1));
            }
            // Don't move cursor after deletion - this makes it "eat" the deleted number
        } else {
            setElements(elements.slice(0, -1));
            setLastAction('Deleted last element from expression');
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
                setLastAction(`Moved cursor left to position ${cursorPosition - 1}`);
            }
        } else if (direction === 'right') {
            if (cursorPosition < elements.length - 1) {
                setCursorPosition(cursorPosition + 1);
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
                        <span key={index} className={`mx-1 select-none ${cursorPosition === index ? 'bg-yellow-200' : ''}`}>
                            {el}
                            {cursorPosition === index && (
                                <span className="cursor-indicator">|</span>
                            )}
                        </span>
                    ) : (
                        <span key={index} className={`inline-flex items-start mx-1 ${cursorPosition === index ? 'bg-yellow-200' : ''}`}>
                            <span className="select-none">{el.base}</span>
                            <span className="inline-block relative -top-3 text-sm ml-1">
                                <input
                                    ref={(element) => (exponentRefs.current[index] = element)}
                                    className={`exponent-input ${
                                        focusedExpIndex === index ? 'border border-blue-500 bg-blue-50' : 'border-b border-gray-300 bg-transparent'
                                    }`}
                                    style={{
                                        width: `${Math.max(1, el.exponent.length) * 0.6 + 0.8}em`,
                                        caretColor: 'black' // Macht den Cursor in Eingabefeldern sichtbar
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
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
                    exp
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
        </div>
    );
}