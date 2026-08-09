// components/TestReact.tsx
import { useState, useEffect } from 'react';

export default function TestReact() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('✅ TestReact: Componente montado en el cliente');
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h3 className="font-bold">Test React Component</h3>
      <p>Contador: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Incrementar
      </button>
      <p className="text-xs text-gray-500 mt-2">✅ JS funciona correctamente</p>
    </div>
  );
}