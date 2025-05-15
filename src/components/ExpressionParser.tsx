import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';


export function ExpressionParser() {
  const [expression, setExpression] = useState('');
  const [ast, setAst] = useState('');

  const handleParse = async () => {
    try {
      const result = await invoke('parse_expression', { input: expression });
      setAst(result as string);
    } catch (error) {
      console.error('Error parsing expression:', error);
      setAst('Error parsing expression');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression (e.g. 1+2*3)"
      />
      <button onClick={handleParse}>Parse</button>
      <pre>{ast}</pre>
    </div>
  );
}