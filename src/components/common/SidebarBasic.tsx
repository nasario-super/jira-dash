import React from 'react';

const SidebarBasic: React.FC = () => {
  console.log('🔍 SidebarBasic rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar básica */}
      <div className="fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 z-50 shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Sidebar Básica
          </h2>
          <div className="space-y-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded">
              Dashboard
            </div>
            <div className="p-2 bg-gray-100 text-gray-800 rounded">Agile</div>
            <div className="p-2 bg-gray-100 text-gray-800 rounded">
              Analytics
            </div>
            <div className="p-2 bg-gray-100 text-gray-800 rounded">
              AI Analytics
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-70">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Teste Sidebar Básica</h1>
          <p className="text-gray-600 mt-2">
            Esta é uma sidebar básica para testar se o problema está na
            implementação complexa.
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="text-green-800">
              Se você consegue ver esta sidebar, o problema está na
              implementação complexa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarBasic;








