import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR
const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 flex items-center justify-center border border-gray-300 rounded-lg">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default DynamicMap; 