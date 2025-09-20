import React from 'react';

export default function MobileFirstCard() {
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow mt-6">
      <h2 className="text-xl font-bold mb-2 text-gray-900">Mobile-First Card</h2>
      <p className="text-gray-700 mb-4">
        This card is designed with mobile-first Tailwind CSS classes. Resize the window to see responsive changes.
      </p>
      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition md:w-auto md:px-8">
        Action
      </button>
    </div>
  );
}
