import { useState, useEffect } from "react";

export default function IntegrationModal({ isOpen, setIsOpen, selectedApp, setSelectedApp, getToken, onSuccess }) {
  // 💡 A single unified object state container to hold dynamic inputs on the fly
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Clear or set initial blank keys whenever a user opens a new platform form
  useEffect(() => {
    if (selectedApp && selectedApp.requiredFields) {
      const initialFields = {};
      selectedApp.requiredFields.forEach(field => {
        initialFields[field.key] = ""; // Seed every dynamic field key as blank
      });
      setFormData(initialFields);
    }
  }, [selectedApp]);

  if (!isOpen || !selectedApp) return null;

  // Track field state mutations dynamically based on their specific key assignments
  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      const token = await getToken();
      const API_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_URL}/api/dashboard/integrations/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          appId: selectedApp._id,
          // 💡 Simply send the structured formData dictionary straight down to your database!
          credentials: formData 
        })
      });

      if (response.ok) {
        setFormData({});
        setIsOpen(false);
        setSelectedApp(null);
        onSuccess?.(); // Instantly reload channels array values on sidebar panel
      }
    } catch (error) {
      console.error("Failed saving dynamic account credentials:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-card border border-custom rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
        
        <div>
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            ⚡ Connect {selectedApp.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Provide connection credentials below to register this channel to your workspace.
          </p>
        </div>

        <form onSubmit={handleFormSubmission} className="space-y-4">
          
          {/* 💡 THE CORE SOLUTION: Map over the array coming from MongoDB */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-none">
            {selectedApp.requiredFields?.map((field) => (
              <div key={field.key} className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-muted-foreground">
                  {field.label}
                </label>
                <input 
                  type={field.type || "text"} 
                  required
                  disabled={isSaving}
                  value={formData[field.key] || ""}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || "Enter parameters..."}
                  className="w-full p-3 bg-background border border-custom rounded-xl text-sm focus:outline-none focus:border-blue-500 font-mono disabled:opacity-50" 
                />
              </div>
            ))}
          </div>

          {/* Action Footer Button Drawer Controls */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button 
              type="button" 
              disabled={isSaving}
              onClick={() => { setIsOpen(false); setSelectedApp(null); }}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:opacity-95 shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Connection"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}