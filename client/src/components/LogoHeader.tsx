import logoPath from "@assets/logo.jpg";

export function LogoHeader() {
  return (
    <div className="w-full flex flex-col items-center justify-center mb-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
          Blitz Business
        </h1>
        <p className="text-gray-600 max-w-md">
          Platformă educațională dezvoltată de prof. SIMINA Marius
        </p>
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="flex items-center justify-center p-3 rounded-xl bg-white shadow-sm border border-gray-100">
          <img 
            src={logoPath} 
            alt="Logo Blitz Business" 
            className="w-auto h-24 object-contain"
          />
        </div>
      </div>
    </div>
  );
}